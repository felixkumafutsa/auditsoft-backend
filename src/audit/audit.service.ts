import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Audit } from '@prisma/client';

export class CreateAuditDto {
  auditName: string;
  auditType: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  assignedManagerId?: number;
  auditUniverseId?: number;
}

export class UpdateAuditDto {
  auditName?: string;
  auditType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  assignedManagerId?: number;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<Audit[]> {
    return this.prisma.audit.findMany({ 
      include: { findings: true, auditPrograms: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number): Promise<Audit> {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: { findings: true, auditPrograms: true },
    });
    
    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found`);
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
      },
      include: { findings: true, auditPrograms: true },
    });
  }

  async update(id: number, data: UpdateAuditDto): Promise<Audit> {
    const audit = await this.findOne(id);
    
    return this.prisma.audit.update({
      where: { id },
      data: {
        ...(data.auditName && { auditName: data.auditName }),
        ...(data.auditType && { auditType: data.auditType }),
        ...(data.status && { status: data.status }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.assignedManagerId !== undefined && { assignedManagerId: data.assignedManagerId }),
      },
      include: { findings: true, auditPrograms: true },
    });
  }

  async delete(id: number): Promise<Audit> {
    const audit = await this.findOne(id);

    return this.prisma.audit.delete({
      where: { id },
      include: { findings: true, auditPrograms: true },
    });
  }
}

