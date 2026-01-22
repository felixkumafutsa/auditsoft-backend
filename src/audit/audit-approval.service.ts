import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class ApprovalRequestDto {
  auditId: number;
  approverUserId: number;
  approvalType: 'initial' | 'progress' | 'final'; // Type of approval needed
  requiredRole?: string;
  comment?: string;
}

export class SubmitApprovalDto {
  approved: boolean;
  comment?: string;
  approverUserId: number;
}

@Injectable()
export class AuditApprovalService {
  constructor(private prisma: PrismaService) {}

  // Store approvals in memory for this session
  private approvals: Map<number, any[]> = new Map();

  /**
   * Request approval for an audit
   */
  async requestApproval(data: ApprovalRequestDto): Promise<any> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: data.auditId },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${data.auditId} not found`);
    }

    const approval = {
      id: Date.now(),
      auditId: data.auditId,
      approverUserId: data.approverUserId,
      approvalType: data.approvalType,
      requiredRole: data.requiredRole,
      comment: data.comment,
      status: 'pending',
      requestedAt: new Date(),
    };

    if (!this.approvals.has(data.auditId)) {
      this.approvals.set(data.auditId, []);
    }

    this.approvals.get(data.auditId)!.push(approval);

    return approval;
  }

  /**
   * Submit approval decision
   */
  async submitApproval(auditId: number, data: SubmitApprovalDto): Promise<any> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${auditId} not found`);
    }

    const approvals = this.approvals.get(auditId) || [];
    const approval = approvals.find(a => a.status === 'pending');

    if (approval) {
      approval.status = data.approved ? 'approved' : 'rejected';
      approval.approvedAt = new Date();
      approval.approverComment = data.comment;
    }

    return {
      decision: data.approved ? 'approved' : 'rejected',
      approverUserId: data.approverUserId,
      comment: data.comment,
      timestamp: new Date(),
    };
  }

  /**
   * Get all approval requests for an audit
   */
  async getApprovalHistory(auditId: number): Promise<any> {
    const auditApprovals = this.approvals.get(auditId) || [];

    return {
      totalRequests: auditApprovals.length,
      pending: auditApprovals.filter(a => a.status === 'pending').length,
      approved: auditApprovals.filter(a => a.status === 'approved').length,
      rejected: auditApprovals.filter(a => a.status === 'rejected').length,
      history: auditApprovals,
    };
  }

  /**
   * Get pending approvals for a user
   */
  async getPendingApprovalsForUser(userId: number): Promise<any[]> {
    const allApprovals: any[] = [];

    for (const [auditId, approvals] of this.approvals.entries()) {
      const pending = approvals.filter(
        a => a.status === 'pending' && a.approverUserId === userId
      );
      allApprovals.push(...pending.map(p => ({ ...p, auditId })));
    }

    return allApprovals;
  }
}
