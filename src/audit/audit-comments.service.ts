import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class AddCommentDto {
  auditId: number;
  userId: number;
  comment: string;
  commentType?: 'observation' | 'finding' | 'note' | 'actionRequired'; // Classification
}

@Injectable()
export class AuditCommentsService {
  constructor(private prisma: PrismaService) {}

  // Store comments in memory for this session
  private comments: Map<number, any[]> = new Map();

  /**
   * Add a comment/note to an audit
   */
  async addComment(data: AddCommentDto): Promise<any> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: data.auditId },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${data.auditId} not found`);
    }

    const comment = {
      id: Date.now(),
      auditId: data.auditId,
      userId: data.userId,
      comment: data.comment,
      commentType: data.commentType || 'note',
      createdAt: new Date(),
    };

    if (!this.comments.has(data.auditId)) {
      this.comments.set(data.auditId, []);
    }

    this.comments.get(data.auditId)!.push(comment);

    return comment;
  }

  /**
   * Get all comments for an audit
   */
  async getAuditComments(auditId: number): Promise<any[]> {
    const user = await this.prisma.user.findFirst();
    
    return (this.comments.get(auditId) || []).map(c => ({
      id: c.id,
      auditId: c.auditId,
      author: user?.name || 'Unknown',
      comment: c.comment,
      commentType: c.commentType,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Get comments by type for an audit
   */
  async getCommentsByType(auditId: number, commentType: string): Promise<any[]> {
    const allComments = await this.getAuditComments(auditId);
    return allComments.filter(c => c.commentType === commentType);
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    for (const [auditId, comments] of this.comments.entries()) {
      const index = comments.findIndex(c => c.id === commentId);
      if (index > -1) {
        comments.splice(index, 1);
        return;
      }
    }
    
    throw new NotFoundException('Comment not found');
  }

  /**
   * Get comment statistics for an audit
   */
  async getCommentStats(auditId: number): Promise<any> {
    const comments = await this.getAuditComments(auditId);
    const types = ['observation', 'finding', 'note', 'actionRequired'];

    return {
      totalComments: comments.length,
      byType: types.reduce((acc, type) => {
        acc[type] = comments.filter(c => c.commentType === type).length;
        return acc;
      }, {}),
      latestComment: comments[0] || null,
    };
  }
}
