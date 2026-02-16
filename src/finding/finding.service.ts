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
        auditProgram: true,
        actionPlans: true,
        audit: true
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
    chiefAuditorComment?: string,
  ): Promise<Finding> {
    const finding = await this.findOne(id);
    const currentStatus = finding.status;

    // Normalize inputs
    const normalizedToStatus = toStatus.trim();
    const normalizedUserRole = userRole?.trim();

    // Check if audit allows finding transitions
    if (!finding.auditId) {
      throw new BadRequestException('Finding must be associated with an audit to change status.');
    }
    const audit = await this.auditService.findOne(finding.auditId) as any;
    const allowedAuditStatuses = ['In Progress', 'Under Review', 'Finalized'];
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

    // Validate Chief Auditor comment is provided when required
    if (this.workflowService.requiresChiefAuditorComment(currentStatus, normalizedToStatus) && !chiefAuditorComment) {
      throw new BadRequestException(
        `Chief Auditor comment is required for transitioning from ${currentStatus} to ${normalizedToStatus}`,
      );
    }

    const updatedFinding = await this.update(id, { status: normalizedToStatus });

    // --- Send Notifications with Chief Auditor feedback ---
    try {
      if (!updatedFinding.auditId) {
        return updatedFinding; // Skip notifications if no audit associated
      }
      const link = `/audits/${updatedFinding.auditId}`;
      const findingDesc = updatedFinding.description.substring(0, 50);

      // Identified -> Validated: Notify Manager
      if (currentStatus === 'Identified' && normalizedToStatus === 'Validated') {
        // Notify Chief Auditor that a finding needs attention
        const chiefAuditors = await this.prisma.user.findMany({
          where: {
            userRoles: {
              some: {
                role: {
                  roleName: { in: ['Chief Auditor'] }
                }
              }
            }
          }
        });
        for (const chiefAuditor of chiefAuditors) {
          await this.notificationService.create({
            userId: chiefAuditor.id,
            title: 'Finding Validated',
            message: `Finding "${findingDesc}..." in audit '${audit.auditName}' has been validated by the manager.`,
            type: 'info',
            link
          });
        }
      }

      // Validated -> Action Assigned: Notify Auditors
      if (currentStatus === 'Validated' && normalizedToStatus === 'Action Assigned') {
        for (const auditor of audit.assignedAuditors || []) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Action Assigned to Finding',
            message: `An action plan has been assigned for finding "${findingDesc}..." in '${audit.auditName}'.`,
            type: 'info',
            link
          });
        }
      }

      // Remediation In Progress -> Verified: Chief Auditor verifies with comment, notify Manager and Auditor
      if (currentStatus === 'Remediation In Progress' && normalizedToStatus === 'Verified') {
        // Notify Manager
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Finding Verified by Chief Auditor',
            message: `Finding "${findingDesc}..." has been verified by Chief Auditor. Feedback: ${chiefAuditorComment || 'No comment'}`,
            type: 'success',
            link
          });
        }
        // Notify Auditors
        for (const auditor of audit.assignedAuditors || []) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Finding Verified by Chief Auditor',
            message: `Finding "${findingDesc}..." has been verified. Chief Auditor Feedback: ${chiefAuditorComment || 'No comment'}`,
            type: 'info',
            link
          });
        }
      }

      // Verified -> Closed: Chief Auditor closes with comment, notify Manager and Auditor
      if (currentStatus === 'Verified' && normalizedToStatus === 'Closed') {
        // Notify Manager
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Finding Closed by Chief Auditor',
            message: `Finding "${findingDesc}..." has been closed by Chief Auditor. Feedback: ${chiefAuditorComment || 'No comment'}`,
            type: 'success',
            link
          });
        }
        // Notify Auditors
        for (const auditor of audit.assignedAuditors || []) {
          await this.notificationService.create({
            userId: auditor.id,
            title: 'Finding Closed by Chief Auditor',
            message: `Finding "${findingDesc}..." has been officially closed. Chief Auditor Feedback: ${chiefAuditorComment || 'No comment'}`,
            type: 'info',
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
