import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Finding } from '@prisma/client';
import { FindingWorkflowService } from '../workflow/finding.workflow';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../notification/notification.service';

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
    private auditService: AuditService,
    private notificationService: NotificationService,
  ) { }

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

  async create(data: CreateFindingDto, user?: any): Promise<Finding> {
    if (!data.auditId || !data.description || !data.severity) {
      throw new BadRequestException('auditId, description, and severity are required');
    }

    // Check if user has access to the audit and if audit is in correct status for finding creation
    const audit = await this.auditService.findOne(data.auditId, user);
    if (audit.status !== 'In Progress') {
      throw new BadRequestException(`Findings can only be created for audits that are 'In Progress'. Current status: ${audit.status}`);
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

    // Normalize inputs
    const normalizedToStatus = toStatus.trim();
    const normalizedUserRole = userRole?.trim();

    // Check if audit allows finding transitions
    const audit = await this.auditService.findOne(finding.auditId) as any;
    const allowedAuditStatuses = ['In Progress', 'Under Review', 'Execution Finished', 'Finalized', 'Process Owner Review'];
    if (!allowedAuditStatuses.includes(audit.status)) {
      throw new BadRequestException(`Finding status cannot be changed when audit is in '${audit.status}' status.`);
    }

    // Validate transition
    if (!this.workflowService.canTransition(currentStatus, normalizedToStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${normalizedToStatus}`,
      );
    }

    // Check role permissions
    if (normalizedUserRole) {
      const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, normalizedToStatus);
      if (!permittedRoles.includes(normalizedUserRole)) {
        throw new BadRequestException(
          `Role ${normalizedUserRole} is not permitted to transition from ${currentStatus} to ${normalizedToStatus}`,
        );
      }
    }

    const updatedFinding = await this.update(id, { status: normalizedToStatus });

    // --- Notifications ---
    try {
      const audit = await this.auditService.findOne(updatedFinding.auditId) as any;
      const link = `/audits/${updatedFinding.auditId}`;
      const findingTitle = `Finding: ${updatedFinding.description.substring(0, 30)}...`;

      // Identified/Validated -> Rejected: Notify Auditors
      if (toStatus === 'Rejected') {
        for (const auditor of audit.assignedAuditors) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Finding Rejected',
            message: `A finding in audit '${audit.auditName}' was rejected by the manager.`,
            type: 'warning',
            link
          });
        }
      }

      // Identified -> Validated: Notify Audit Manager
      if (currentStatus === 'Identified' && toStatus === 'Validated') {
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Finding Validated',
            message: `A finding in audit '${audit.auditName}' has been validated and requires attention.`,
            type: 'info',
            link
          });
        }
      }

      // Validated -> Action Assigned: Notify Auditors and Process Owner
      if (currentStatus === 'Validated' && toStatus === 'Action Assigned') {
        // Notify Auditors
        for (const auditor of audit.assignedAuditors) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Action Plan Assigned',
            message: `Action plan assigned for finding in '${audit.auditName}'.`,
            type: 'info',
            link
          });
        }

        // Notify Audit Manager (was Process Owner)
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Action Plan Required',
            message: `A finding in '${audit.auditName}' requires an action plan.`,
            type: 'action_required',
            link
          });
        }
      }

      // Remediation In Progress -> Verified: Notify CAE to close
      if (currentStatus === 'Remediation In Progress' && toStatus === 'Verified') {
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
            title: 'Finding Verified',
            message: `A finding in audit '${audit.auditName}' has been verified. Closing is pending.`,
            type: 'action_required',
            link
          });
        }
      }
    } catch (e) {
      console.error('Failed to send finding notification', e);
    }

    return updatedFinding;
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
