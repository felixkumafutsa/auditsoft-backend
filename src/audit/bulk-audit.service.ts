import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class BulkAuditUpdateDto {
  auditIds: number[];
  updates: {
    status?: string;
    assignedManagerId?: number;
    auditType?: string;
  };
}

export class AuditFilterDto {
  status?: string;
  auditType?: string;
  assignedManagerId?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

@Injectable()
export class BulkAuditService {
  constructor(private prisma: PrismaService) {}

  /**
   * Bulk update audits
   */
  async bulkUpdateAudits(data: BulkAuditUpdateDto): Promise<any> {
    if (!data.auditIds || data.auditIds.length === 0) {
      throw new BadRequestException('At least one audit ID must be provided');
    }

    const result = await this.prisma.audit.updateMany({
      where: {
        id: { in: data.auditIds },
      },
      data: {
        ...(data.updates.status && { status: data.updates.status }),
        ...(data.updates.assignedManagerId && { assignedManagerId: data.updates.assignedManagerId }),
        ...(data.updates.auditType && { auditType: data.updates.auditType }),
      },
    });

    return {
      successful: result.count,
      total: data.auditIds.length,
      message: `Updated ${result.count} audits successfully`,
    };
  }

  /**
   * Find audits by filters
   */
  async findAuditsByFilters(filters: AuditFilterDto): Promise<any[]> {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.auditType) {
      where.auditType = filters.auditType;
    }

    if (filters.assignedManagerId) {
      where.assignedManagerId = filters.assignedManagerId;
    }

    if (filters.createdAfter || filters.createdBefore) {
      where.createdAt = {};
      if (filters.createdAfter) {
        where.createdAt.gte = filters.createdAfter;
      }
      if (filters.createdBefore) {
        where.createdAt.lte = filters.createdBefore;
      }
    }

    return this.prisma.audit.findMany({
      where,
      include: { findings: true, auditPrograms: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(): Promise<any> {
    const audits = await this.prisma.audit.findMany({
      include: { findings: true },
    });

    const statuses = new Map<string, number>();
    const types = new Map<string, number>();
    let totalFindings = 0;

    for (const audit of audits) {
      // Count by status
      const status = audit.status || 'unknown';
      statuses.set(status, (statuses.get(status) || 0) + 1);

      // Count by type
      const type = audit.auditType || 'unknown';
      types.set(type, (types.get(type) || 0) + 1);

      // Count findings
      totalFindings += audit.findings?.length || 0;
    }

    return {
      totalAudits: audits.length,
      byStatus: Object.fromEntries(statuses),
      byType: Object.fromEntries(types),
      totalFindings,
      averageFindingsPerAudit: audits.length > 0 ? (totalFindings / audits.length).toFixed(2) : 0,
    };
  }

  /**
   * Get audits due soon (based on endDate)
   */
  async getAuditsDueSoon(daysFromNow: number = 7): Promise<any[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);

    return this.prisma.audit.findMany({
      where: {
        endDate: {
          gte: now,
          lte: futureDate,
        },
        status: { notIn: ['Closed', 'Finalized'] },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  /**
   * Get overdue audits
   */
  async getOverdueAudits(): Promise<any[]> {
    const now = new Date();

    return this.prisma.audit.findMany({
      where: {
        endDate: {
          lt: now,
        },
        status: { notIn: ['Closed', 'Finalized'] },
      },
      orderBy: { endDate: 'asc' },
    });
  }

  /**
   * Archive old closed audits
   */
  async archiveOldAudits(olderThanDays: number = 365): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await this.prisma.audit.updateMany({
      where: {
        status: 'Closed',
        createdAt: { lt: cutoffDate },
      },
      data: {
        status: 'Archived',
      },
    });

    return {
      archivedCount: result.count,
      message: `Archived ${result.count} audits older than ${olderThanDays} days`,
    };
  }
}
