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
    const where: any = {};
    
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

  async create(data: CreateAuditDto): Promise<Audit> {
    if (!data.auditName || !data.auditType) {
      throw new BadRequestException('auditName and auditType are required');
    }

    return this.prisma.audit.create({
      data: {
        auditName: data.auditName,
        auditType: data.auditType,
        status: data.status || 'planned',
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
  }

  async update(id: number, data: UpdateAuditDto): Promise<Audit> {
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
      include: { findings: true, auditPrograms: true, assignedAuditors: true },
    });

    // Send notifications if auditors were assigned
    if (data.assignedAuditorIds && data.assignedAuditorIds.length > 0) {
      // Find new auditors (in a real scenario, we might want to diff with existing)
      // For now, we notify all currently assigned auditors to keep it simple
      for (const auditorId of data.assignedAuditorIds) {
         await this.notificationService.create({
            userId: auditorId,
            title: 'New Audit Assignment',
            message: `You have been assigned to audit: ${updatedAudit.auditName}`,
            type: 'info',
            link: `/audits/${updatedAudit.id}` // Assuming frontend route
         });
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
