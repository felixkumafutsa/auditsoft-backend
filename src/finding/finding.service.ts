import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Finding } from '@prisma/client';
import { FindingWorkflowService } from '../workflow/finding.workflow';

export class CreateFindingDto {
  auditId: number;
  auditProgramId?: number;
  description: string;
  severity: string; // Critical / High / Medium / Low
  rootCause?: string;
  status?: string;
}

export class UpdateFindingDto {
  description?: string;
  severity?: string;
  rootCause?: string;
  status?: string;
}

@Injectable()
export class FindingService {
  constructor(
    private prisma: PrismaService,
    private workflowService: FindingWorkflowService,
  ) {}

  async findAll(): Promise<Finding[]> {
    return this.prisma.finding.findMany({
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number): Promise<Finding> {
    const finding = await this.prisma.finding.findUnique({
      where: { id },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID ${id} not found`);
    }

    return finding;
  }

  async findByAudit(auditId: number): Promise<Finding[]> {
    return this.prisma.finding.findMany({
      where: { auditId },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
      orderBy: { severity: 'desc' },
    });
  }

  async create(data: CreateFindingDto): Promise<Finding> {
    if (!data.auditId || !data.description || !data.severity) {
      throw new BadRequestException('auditId, description, and severity are required');
    }

    return this.prisma.finding.create({
      data: {
        auditId: data.auditId,
        auditProgramId: data.auditProgramId,
        description: data.description,
        severity: data.severity,
        rootCause: data.rootCause,
        status: data.status || 'Identified',
      },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
    });
  }

  async update(id: number, data: UpdateFindingDto): Promise<Finding> {
    const finding = await this.findOne(id);

    return this.prisma.finding.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.severity && { severity: data.severity }),
        ...(data.rootCause && { rootCause: data.rootCause }),
        ...(data.status && { status: data.status }),
      },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
    });
  }

  async transitionStatus(
    id: number,
    toStatus: string,
    userRole?: string,
  ): Promise<Finding> {
    const finding = await this.findOne(id);
    const currentStatus = finding.status;

    // Validate transition
    if (!this.workflowService.canTransition(currentStatus, toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${toStatus}`,
      );
    }

    // Check role permissions
    if (userRole) {
      const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, toStatus);
      if (!permittedRoles.includes(userRole)) {
        throw new BadRequestException(
          `Role ${userRole} is not permitted to transition from ${currentStatus} to ${toStatus}`,
        );
      }
    }

    return this.update(id, { status: toStatus });
  }

  async delete(id: number): Promise<Finding> {
    const finding = await this.findOne(id);

    return this.prisma.finding.delete({
      where: { id },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
    });
  }

  async getCriticalFindings(): Promise<Finding[]> {
    return this.prisma.finding.findMany({
      where: {
        severity: 'Critical',
        status: { not: 'Closed' },
      },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOverdueFindings(): Promise<Finding[]> {
    const now = new Date();
    return this.prisma.finding.findMany({
      where: {
        status: { not: 'Closed' },
        actionPlans: {
          some: {
            dueDate: {
              lt: now,
            },
            status: { not: 'Closed' },
          },
        },
      },
      include: {
        audit: true,
        auditProgram: true,
        actionPlans: true,
      },
    });
  }
}
