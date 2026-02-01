import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Audit } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';

export class CreateAuditDto {
  auditName: string;
  auditType: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  assignedManagerId?: number;
  auditUniverseId?: number;
  assignedAuditorIds?: number[];
  templateId?: number;
}

export class UpdateAuditDto {
  auditName?: string;
  auditType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  assignedManagerId?: number;
  assignedAuditorIds?: number[];
}

@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

  async findAll(user?: any): Promise<Audit[]> {
    const where: any = {
      status: { not: 'Template' } // Exclude templates from normal list
    };
    
    // Role-based filtering
    if (user) {
      // Check if user has Auditor role
      // user.roles is an array of strings like ['Auditor'] coming from JWT
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
      const isAuditor = roles.includes('Auditor');
      
      if (isAuditor) {
        where.assignedAuditors = { some: { id: user.id } };
      }
    }

    return this.prisma.audit.findMany({ 
      where,
      include: { findings: true, auditPrograms: true, assignedManager: true, assignedAuditors: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number, user?: any): Promise<Audit> {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: { findings: true, auditPrograms: true, assignedManager: true, assignedAuditors: true },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
    }

    if (user) {
      // Check if user has Auditor role
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
      const isAuditor = roles.includes('Auditor');
      
      if (isAuditor) {
        const isAssigned = audit.assignedAuditors.some((auditor) => auditor.id === user.id);
        if (!isAssigned) {
          throw new NotFoundException(`Audit with ID ${id} not found`); // Hiding existence for security
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
                roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
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
    const audit = await this.findOne(id);

    const updatedAudit = await this.prisma.audit.update({
      where: { id },
      data: {
        ...(data.auditName && { auditName: data.auditName }),
        ...(data.auditType && { auditType: data.auditType }),
        ...(data.status && { status: data.status }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.assignedManagerId !== undefined && {
          assignedManagerId: data.assignedManagerId,
        }),
        ...(data.assignedAuditorIds && {
          assignedAuditors: {
            set: data.assignedAuditorIds.map(id => ({ id }))
          }
        }),
      },
      include: { findings: true, auditPrograms: true, assignedAuditors: true, assignedManager: true },
    });

    // --- Notifications Logic ---

    // 1. Assignment Notification
    if (data.assignedAuditorIds && data.assignedAuditorIds.length > 0) {
      const assignerName = user?.name || 'System';
      for (const auditorId of data.assignedAuditorIds) {
         // Skip if assigning self (unlikely but possible)
         if (user && user.id === auditorId) continue;

         await this.notificationService.create({
            userId: auditorId,
            title: 'New Audit Assignment',
            message: `You have been assigned to audit: ${updatedAudit.auditName} by ${assignerName}.`,
            type: 'info',
            link: `/audits/${updatedAudit.id}`
         });
      }
    }

    // 2. Status Change Notifications
    if (data.status && data.status !== audit.status) {
      const auditLink = `/audits/${updatedAudit.id}`;
      const auditName = updatedAudit.auditName;

      // Planned -> Approved: Alert Auditors (Ready to start)
      if (audit.status === 'Planned' && data.status === 'Approved') {
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

      // In Progress -> Under Review: Alert Manager
      if (audit.status === 'In Progress' && data.status === 'Under Review') {
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

      // Under Review -> Finalized: Alert CAE
      if (audit.status === 'Under Review' && data.status === 'Finalized') {
        const caes = await this.prisma.user.findMany({
          where: {
            userRoles: {
              some: {
                role: {
                  roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                }
              }
            }
          }
        });
        
        for (const cae of caes) {
          await this.notificationService.create({
            userId: cae.id,
            title: 'Audit Finalized',
            message: `Audit '${auditName}' has been finalized.`,
            type: 'info',
            link: auditLink
          });
        }
      }
    }

    return updatedAudit;
  }

  async delete(id: number): Promise<Audit> {
    await this.findOne(id);

    return this.prisma.audit.delete({
      where: { id },
      include: { findings: true, auditPrograms: true },
    });
  }
}
