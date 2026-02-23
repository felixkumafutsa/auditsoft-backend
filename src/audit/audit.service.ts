import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Audit } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { ReportsService } from '../reports/reports.service';
import { IsString, IsOptional, IsDate, IsNumber, IsArray } from 'class-validator';

export class CreateAuditDto {
  @IsString()
  auditName: string;

  @IsString()
  auditType: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  assignedManagerId?: number;

  @IsNumber()
  @IsOptional()
  auditUniverseId?: number;

  @IsArray()
  @IsOptional()
  assignedAuditorIds?: number[];

  @IsNumber()
  @IsOptional()
  templateId?: number;
}

export class UpdateAuditDto {
  @IsString()
  @IsOptional()
  auditName?: string;

  @IsString()
  @IsOptional()
  auditType?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;

  @IsNumber()
  @IsOptional()
  assignedManagerId?: number;

  @IsNumber()
  @IsOptional()
  auditUniverseId?: number;

  @IsArray()
  @IsOptional()
  assignedAuditorIds?: number[];

  @IsString()
  @IsOptional()
  chiefAuditorComments?: string;
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private reportsService: ReportsService
  ) { }

  async findAll(user?: any): Promise<Audit[]> {
    const where: any = {
      status: { not: 'Template' } // Exclude templates from normal list
    };

    // Role-based filtering
    if (user) {
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
      const isAuditor = roles.includes('Auditor');
      // Normalize role check (handle potential variations in casing/spacing)
      const isProcessOwner = roles.some(r => r.toLowerCase().includes('process owner'));
      const isAdminOrManager = roles.some(r => ['System Administrator', 'Audit Manager', 'CAE', 'Chief Auditor'].includes(r));

      if (!isAdminOrManager) {
        if (isAuditor) {
          where.assignedAuditors = { some: { id: user.id } };
        } else if (isProcessOwner) {
          where.auditUniverse = { ownerId: user.id };
        }
      }
    }

    return this.prisma.audit.findMany({
      where,
      include: {
        findings: true,
        auditPrograms: true,
        assignedManager: true,
        assignedAuditors: true,
        auditUniverse: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number, user?: any): Promise<Audit> {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: {
        findings: true,
        auditPrograms: true,
        assignedManager: true,
        assignedAuditors: true,
        auditUniverse: true
      },
    });


    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }

    if (user) {
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
      const isAuditor = roles.includes('Auditor');
      const isProcessOwner = roles.some(r => r.toLowerCase().includes('process owner'));
      const isAdminOrManager = roles.some(r => ['System Administrator', 'Audit Manager', 'CAE', 'Chief Auditor'].includes(r));

      if (!isAdminOrManager) {
        if (isAuditor) {
          const isAssigned = audit.assignedAuditors.some((auditor) => auditor.id === user.id);
          if (!isAssigned) {
            throw new ForbiddenException(`You do not have access to this audit`);
          }
        } else if (isProcessOwner) {
          if (audit.auditUniverse?.ownerId !== user.id) {
            throw new ForbiddenException(`You do not have access to audits for this entity`);
          }
        }
      }
    }

    return audit;
  }

  async findTemplates(): Promise<Audit[]> {
    return this.prisma.audit.findMany({
      where: { status: 'Template' },
      include: { auditPrograms: true },
      orderBy: { auditName: 'asc' }
    });
  }

  async findForOwner(ownerId: number): Promise<Audit[]> {
    return this.prisma.audit.findMany({
      where: {
        status: { not: 'Template' },
        auditUniverse: { ownerId },
      },
      include: { findings: true, auditPrograms: true, assignedManager: true, assignedAuditors: true, auditUniverse: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateAuditDto, user?: any): Promise<Audit> {
    if (!data.auditName || !data.auditType) {
      throw new BadRequestException('auditName and auditType are required');
    }

    const newAudit = await this.prisma.audit.create({
      data: {
        auditName: data.auditName,
        auditType: data.auditType,
        status: data.status || 'Planned',
        startDate: data.startDate,
        endDate: data.endDate,
        assignedManagerId: data.assignedManagerId,
        auditUniverseId: data.auditUniverseId,
        assignedAuditors: data.assignedAuditorIds ? {
          connect: data.assignedAuditorIds.map(id => ({ id }))
        } : undefined,
      },
      include: { findings: true, auditPrograms: true, assignedAuditors: true },
    });

    // Notify CAEs about new audit awaiting approval
    if (newAudit.status === 'Planned') {
      const caes = await this.prisma.user.findMany({
        where: {
          userRoles: {
            some: {
              role: {
                roleName: { in: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
              }
            }
          }
        }
      });

      for (const cae of caes) {
        await this.notificationService.create({
          userId: cae.id,
          title: 'New Audit Awaiting Approval',
          message: `A new audit '${newAudit.auditName}' has been created by ${user?.name || 'a Manager'} and is awaiting your approval.`,
          type: 'action_required',
          link: `/audits/${newAudit.id}`
        });
      }
    }

    // Handle Template Cloning
    if (data.templateId) {
      const template = await this.prisma.audit.findUnique({
        where: { id: data.templateId },
        include: { auditPrograms: true },
      });

      if (template && template.auditPrograms.length > 0) {
        // Clone programs
        for (const program of template.auditPrograms) {
          await this.prisma.auditProgram.create({
            data: {
              auditId: newAudit.id,
              procedureName: program.procedureName,
              controlReference: program.controlReference,
              expectedOutcome: program.expectedOutcome,
            },
          });
        }

        // Reload audit to include new programs
        return this.findOne(newAudit.id);
      }
    }

    return newAudit;
  }

  async update(id: number, data: UpdateAuditDto, user?: any): Promise<Audit> {
    const existingAudit = await this.prisma.audit.findUnique({
      where: { id },
      include: { assignedManager: true, assignedAuditors: true }
    });

    if (!existingAudit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }

    // Explicitly pick allowed fields to avoid passing relations (like findings=[]) that cause Prisma errors
    const {
      auditName,
      auditType,
      status,
      startDate,
      endDate,
      assignedManagerId,
      auditUniverseId,
      assignedAuditorIds,
      chiefAuditorComments
    } = data;

    const updateData: any = {
      ...(auditName !== undefined && { auditName }),
      ...(auditType !== undefined && { auditType }),
      ...(status !== undefined && { status }),
      ...(startDate !== undefined && { startDate }),
      ...(endDate !== undefined && { endDate }),
      ...(assignedManagerId !== undefined && { assignedManagerId }),
      ...(auditUniverseId !== undefined && { auditUniverseId }),
      ...(chiefAuditorComments !== undefined && { chiefAuditorComments }),
    };

    if (assignedAuditorIds) {
      updateData.assignedAuditors = {
        set: assignedAuditorIds.map(id => ({ id }))
      };
    }

    const updatedAudit = await this.prisma.audit.update({
      where: { id },
      data: updateData,
      include: {
        findings: true,
        auditPrograms: true,
        assignedAuditors: true,
        assignedManager: true,
        auditUniverse: {
          include: {
            owner: true
          }
        }
      },
    });

    // Notify Auditors if assigned (New Assignments only)
    if (data.assignedAuditorIds && data.assignedAuditorIds.length > 0) {
      const newAuditorIds = data.assignedAuditorIds.filter(id =>
        !existingAudit.assignedAuditors?.some(a => a.id === id)
      );

      for (const auditorId of newAuditorIds) {
        // Skip self-notification if user assigns themselves (optional)
        if (user && user.id === auditorId) continue;

        await this.notificationService.create({
          userId: auditorId,
          title: 'Assigned to Audit',
          message: `You have been assigned to audit '${updatedAudit.auditName}' by ${user?.name || 'an Audit Manager'}.`,
          type: 'info',
          link: `/audits/${updatedAudit.id}`
        });
      }
    }

    // Status Change Notifications
    if (data.status && data.status !== existingAudit.status) {
      const auditLink = `/audits/${updatedAudit.id}`;
      const auditName = updatedAudit.auditName;

      // Planned -> Approved: Alert Auditors (Ready to start)
      if (existingAudit.status === 'Planned' && data.status === 'Approved') {
        for (const auditor of updatedAudit.assignedAuditors) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Audit Approved',
            message: `Audit '${auditName}' has been approved and is ready to start.`,
            type: 'info',
            link: auditLink
          });
        }
      }

      // Planned -> Rejected: Alert Manager
      if (existingAudit.status === 'Planned' && data.status === 'Rejected') {
        if (updatedAudit.assignedManagerId) {
          await this.notificationService.create({
            userId: updatedAudit.assignedManagerId,
            title: 'Audit Plan Rejected',
            message: `The audit plan for '${auditName}' has been rejected by the CAE.`,
            type: 'warning',
            link: auditLink
          });
        }
      }

      // In Progress -> Under Review: Alert Manager
      if (existingAudit.status === 'In Progress' && data.status === 'Under Review') {
        if (updatedAudit.assignedManagerId) {
          await this.notificationService.create({
            userId: updatedAudit.assignedManagerId,
            title: 'Audit Ready for Review',
            message: `Audit '${auditName}' has been submitted for review.`,
            type: 'action_required',
            link: auditLink
          });
        }
      }

      // Under Review -> Finalized: Generate PDF and Alert Chief Auditor for approval
      if (existingAudit.status === 'Under Review' && data.status === 'Finalized') {
        // Generate PDF report when audit is finalized
        await this.reportsService.generatePDFToFile(updatedAudit.id);

        // Notify Chief Auditor that audit is finalized and ready for approval
        const chiefAuditors = await this.prisma.user.findMany({
          where: {
            userRoles: {
              some: {
                role: {
                  roleName: { in: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                }
              }
            }
          }
        });

        for (const chiefAuditor of chiefAuditors) {
          await this.notificationService.create({
            userId: chiefAuditor.id,
            title: 'Audit Finalized - Awaiting Your Approval',
            message: `Audit '${auditName}' has been finalized and is awaiting your approval to close.`,
            type: 'action_required',
            link: auditLink
          });
        }

        // Notify Manager that audit is finalized
        if (updatedAudit.assignedManagerId) {
          await this.notificationService.create({
            userId: updatedAudit.assignedManagerId,
            title: 'Audit Finalized',
            message: `The audit '${auditName}' has been finalized. Please preview and save the report for Chief Auditor approval.`,
            type: 'action_required',
            link: `/reports/audit/${updatedAudit.id}/preview`
          });
        }
      }

      // Closed: Notify manager and auditors (report already generated at Finalized)
      if (data.status === 'Closed') {
        if (updatedAudit.assignedManagerId) {
          await this.notificationService.create({
            userId: updatedAudit.assignedManagerId,
            title: 'Audit Closed',
            message: `Audit '${auditName}' has been officially closed. The final report is ready.`,
            type: 'success',
            link: `/reports/audit/${updatedAudit.id}/preview`
          });
        }

        for (const auditor of updatedAudit.assignedAuditors) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Audit Closed',
            message: `Audit '${auditName}' has been officially closed.`,
            type: 'info',
            link: auditLink
          });
        }
      }
    }

    return updatedAudit;
  }

  async delete(id: number): Promise<Audit> {
    const audit = await this.findOne(id);

    // Prevent deletion of audits that have been approved or are beyond
    if (audit.status !== 'Planned' && audit.status !== 'Rejected') {
      throw new BadRequestException(
        `Cannot delete audit with status '${audit.status}'. Only audits in 'Planned' or 'Rejected' status can be deleted.`,
      );
    }

    return this.prisma.audit.delete({
      where: { id },
      include: { findings: true, auditPrograms: true },
    });
  }

  async updateChiefAuditorComments(auditId: number, comments: string): Promise<void> {
    await this.prisma.audit.update({
      where: { id: auditId },
      data: { chiefAuditorComments: comments }
    });
  }
}
