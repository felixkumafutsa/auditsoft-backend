/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class AuditTimelineEntryDto {
  auditId: number;
  userId?: number;
  action: string; // created, status_changed, approved, commented, scheduled
  fromStatus?: string;
  toStatus?: string;
  comment?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditTimelineService {
  constructor(private prisma: PrismaService) {}

  // Store timeline in memory for this session
  private timeline: Map<number, any[]> = new Map();

  /**
   * Record an event in the audit timeline
   */
  async recordEvent(data: AuditTimelineEntryDto): Promise<any> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: data.auditId },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${data.auditId} not found`);
    }

    const entry = {
      id: Date.now(),
      auditId: data.auditId,
      userId: data.userId,
      action: data.action,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      comment: data.comment,
      metadata: data.metadata,
      timestamp: new Date(),
    };

    if (!this.timeline.has(data.auditId)) {
      this.timeline.set(data.auditId, []);
    }

    this.timeline.get(data.auditId)!.push(entry);

    return entry;
  }

  /**
   * Get timeline for an audit
   */
  async getAuditTimeline(auditId: number): Promise<any[]> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${auditId} not found`);
    }

    return (this.timeline.get(auditId) || []).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get audit activity summary
   */
  async getActivitySummary(auditId: number): Promise<any> {
    const timeline = await this.getAuditTimeline(auditId);
    
    return {
      totalActions: timeline.length,
      lastActivity: timeline[0] || null,
      actionTypes: timeline.reduce((acc, item) => {
        acc[item.action] = (acc[item.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}
