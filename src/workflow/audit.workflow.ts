// src/workflow/audit.workflow.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

export enum AuditStatus {
  PLANNED = 'Planned',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  IN_PROGRESS = 'In Progress',
  UNDER_REVIEW = 'Under Review',
  EXECUTION_FINISHED = 'Execution Finished',
  FINALIZED = 'Finalized',
  PROCESS_OWNER_REVIEW = 'Process Owner Review',
  REVIEWED_BY_OWNER = 'Reviewed by Owner',
  CLOSED = 'Closed',
}

@Injectable()
export class AuditWorkflowService {
  constructor(private notificationService: NotificationService) {}

  // Define valid state transitions
  private readonly validTransitions: Record<AuditStatus, AuditStatus[]> = {
    [AuditStatus.PLANNED]: [AuditStatus.APPROVED, AuditStatus.REJECTED, AuditStatus.CLOSED],
    [AuditStatus.APPROVED]: [AuditStatus.IN_PROGRESS, AuditStatus.CLOSED],
    [AuditStatus.REJECTED]: [AuditStatus.PLANNED, AuditStatus.CLOSED],
    [AuditStatus.IN_PROGRESS]: [AuditStatus.UNDER_REVIEW, AuditStatus.CLOSED],
    [AuditStatus.UNDER_REVIEW]: [AuditStatus.EXECUTION_FINISHED, AuditStatus.IN_PROGRESS],
    [AuditStatus.EXECUTION_FINISHED]: [AuditStatus.FINALIZED, AuditStatus.UNDER_REVIEW],
    [AuditStatus.FINALIZED]: [AuditStatus.PROCESS_OWNER_REVIEW, AuditStatus.CLOSED],
    [AuditStatus.PROCESS_OWNER_REVIEW]: [AuditStatus.REVIEWED_BY_OWNER, AuditStatus.CLOSED],
    [AuditStatus.REVIEWED_BY_OWNER]: [AuditStatus.CLOSED],
    [AuditStatus.CLOSED]: [], // Terminal state
  };

  /**
   * Validate if a state transition is allowed
   */
  canTransition(fromStatus: string, toStatus: string): boolean {
    const from = fromStatus as AuditStatus;
    const to = toStatus as AuditStatus;

    if (!Object.values(AuditStatus).includes(from)) {
      throw new BadRequestException(`Invalid current status: ${from}`);
    }

    if (!Object.values(AuditStatus).includes(to)) {
      throw new BadRequestException(`Invalid target status: ${to}`);
    }

    const allowedTransitions = this.validTransitions[from] || [];
    return allowedTransitions.includes(to);
  }

  /**
   * Handle state transition and trigger notifications
   */
  async handleTransition(auditId: number, auditName: string, fromStatus: string, toStatus: string, managerId?: number) {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new BadRequestException(`Invalid transition from ${fromStatus} to ${toStatus}`);
    }

    // Trigger Notification based on new status
    await this.triggerNotification(auditId, auditName, toStatus, managerId);
  }

  private async triggerNotification(auditId: number, auditName: string, status: string, managerId?: number) {
    let title = '';
    let message = '';
    let type = 'info';
    const targetUserId = managerId; 

    // Logic to determine notification content and recipient
    switch (status) {
      case AuditStatus.APPROVED:
        title = 'Audit Approved';
        message = `The audit "${auditName}" has been approved and is ready to start.`;
        type = 'success';
        break;
      case AuditStatus.REJECTED:
        title = 'Audit Rejected';
        message = `The audit plan for "${auditName}" has been rejected by the CAE.`;
        type = 'warning';
        break;
      case AuditStatus.IN_PROGRESS:
        title = 'Audit Started';
        message = `The audit "${auditName}" is now in progress.`;
        type = 'info';
        break;
      case AuditStatus.UNDER_REVIEW:
        title = 'Audit Review Needed';
        message = `The audit "${auditName}" is ready for manager review.`;
        type = 'action_required';
        break;
      case AuditStatus.EXECUTION_FINISHED:
        title = 'Audit Execution Finished';
        message = `The execution for "${auditName}" has been confirmed as finished and is ready for CAE review.`;
        type = 'info';
        break;
      case AuditStatus.FINALIZED:
        title = 'Audit Finalized';
        message = `The audit "${auditName}" has been finalized by the CAE.`;
        type = 'success';
        break;
      case AuditStatus.PROCESS_OWNER_REVIEW:
        title = 'Audit Ready for Process Owner Review';
        message = `The audit "${auditName}" is ready for your review.`;
        type = 'action_required';
        break;
      case AuditStatus.REVIEWED_BY_OWNER:
        title = 'Audit Reviewed by Process Owner';
        message = `The audit "${auditName}" has been reviewed by the process owner and is ready for closure.`;
        type = 'success';
        break;
      case AuditStatus.CLOSED:
        title = 'Audit Closed';
        message = `The audit "${auditName}" has been officially closed.`;
        type = 'warning';
        break;
    }

    if (title && targetUserId) {
      const notification: CreateNotificationDto = {
        userId: targetUserId,
        title,
        message,
        type,
        link: `/audits/${auditId}`,
      };
      await this.notificationService.create(notification);
    }
  }

  /**
   * Get allowed transitions from current status
   */
  getAllowedTransitions(currentStatus: string): AuditStatus[] {
    const status = currentStatus as AuditStatus;
    return this.validTransitions[status] || [];
  }

  /**
   * Get role-based permissions for status transitions
   */
  getPermittedRoles(fromStatus: string, toStatus: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      [AuditStatus.PLANNED]: {
        [AuditStatus.APPROVED]: ['Chief Audit Executive (CAE)', 'CAE'],
        [AuditStatus.REJECTED]: ['Chief Audit Executive (CAE)', 'CAE'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.APPROVED]: {
        [AuditStatus.IN_PROGRESS]: ['Auditor'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.REJECTED]: {
        [AuditStatus.PLANNED]: ['Audit Manager', 'Manager'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.IN_PROGRESS]: {
        [AuditStatus.UNDER_REVIEW]: ['Auditor'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.UNDER_REVIEW]: {
        [AuditStatus.EXECUTION_FINISHED]: ['Audit Manager', 'Manager'],
        [AuditStatus.IN_PROGRESS]: ['Audit Manager', 'Manager'],
      },
      [AuditStatus.EXECUTION_FINISHED]: {
        [AuditStatus.FINALIZED]: ['Chief Audit Executive (CAE)', 'CAE'],
        [AuditStatus.UNDER_REVIEW]: ['Chief Audit Executive (CAE)', 'CAE'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.FINALIZED]: {
        [AuditStatus.PROCESS_OWNER_REVIEW]: ['Process Owner', 'ProcessOwner'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.PROCESS_OWNER_REVIEW]: {
        [AuditStatus.REVIEWED_BY_OWNER]: ['Process Owner', 'ProcessOwner'],
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [AuditStatus.REVIEWED_BY_OWNER]: {
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
