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
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateFindingDto {
  @IsNumber()
  auditId: number;

  @IsNumber()
  @IsOptional()
  auditProgramId?: number;

  @IsString()
  description: string;

  @IsString()
  severity: string; // Critical / High / Medium / Low

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

export class UpdateFindingDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  severity?: string;

  @IsString()
  @IsOptional()
  rootCause?: string;

  @IsString()
  @IsOptional()
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

    const createData: any = {
      auditId: data.auditId,
      description: data.description,
      severity: data.severity,
      status: data.status || 'Identified',
    };

    // Only include optional fields if they are provided
    if (data.auditProgramId !== undefined) {
      createData.auditProgramId = data.auditProgramId;
    }
    if (data.rootCause !== undefined) {
      createData.rootCause = data.rootCause;
    }

    return this.prisma.finding.create({
      data: createData,
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
                  roleName: { in: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
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

  /**
   * Update finding status with role validation
   */
  async updateStatus(id: number, newStatus: string, userRole?: string, chiefAuditorComment?: string): Promise<Finding> {
    const finding = await this.findOne(id);

    // Validate transition using workflow service
    if (!this.workflowService.canTransition(finding.status, newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${finding.status} to ${newStatus}`,
      );
    }

    // Check role permissions
    if (userRole) {
      const permittedRoles = this.workflowService.getPermittedRoles(finding.status, newStatus);
      if (!permittedRoles.includes(userRole)) {
        throw new BadRequestException(
          `Role ${userRole} is not permitted to transition from ${finding.status} to ${newStatus}`,
        );
      }
    }

    // Validate Chief Auditor comment is provided when required
    if (this.workflowService.requiresChiefAuditorComment(finding.status, newStatus) && !chiefAuditorComment) {
      throw new BadRequestException(
        `Chief Auditor comment is required for transitioning from ${finding.status} to ${newStatus}`,
      );
    }

    // Update the finding status
    const updatedFinding = await this.update(id, { status: newStatus });

    // Send notifications
    await this.sendStatusChangeNotifications(updatedFinding, finding.status, newStatus, chiefAuditorComment);

    return updatedFinding;
  }

  /**
   * Send notifications when finding status changes
   */
  private async sendStatusChangeNotifications(finding: Finding, oldStatus: string, newStatus: string, chiefAuditorComment?: string) {
    try {
      if (!finding.auditId) return;

      const link = `/audits/${finding.auditId}`;
      const findingDesc = finding.description.substring(0, 50);

      // Validated -> Action Assigned: Notify Process Owners
      if (oldStatus === 'Validated' && newStatus === 'Action Assigned') {
        // Notify Process Owners
        const processOwners = await this.prisma.user.findMany({
          where: {
            userRoles: {
              some: {
                role: {
                  roleName: { in: ['Process Owner'] }
                }
              }
            }
          }
        });
        for (const processOwner of processOwners) {
          await this.notificationService.create({
            userId: processOwner.id,
            title: 'Action Plan Assigned',
            message: `Action plan has been assigned for finding "${findingDesc}..." in audit #${finding.auditId}`,
            type: 'info',
            link
          });
        }
      }

      // Action Assigned -> Remediation In Progress: Notify Chief Auditor
      if (oldStatus === 'Action Assigned' && newStatus === 'Remediation In Progress') {
        // Notify Chief Auditors
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
            title: 'Remediation Started',
            message: `Remediation has started for finding "${findingDesc}..." in audit #${finding.auditId}`,
            type: 'info',
            link
          });
        }
      }
    } catch (e) {
      console.error('Failed to send finding notification', e);
    }
  }
}
