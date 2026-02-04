// src/workflow/audit.workflow.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

export enum AuditStatus {
  PLANNED = 'Planned',
  APPROVED = 'Approved',
  IN_PROGRESS = 'In Progress',
  UNDER_REVIEW = 'Under Review',
  FINALIZED = 'Finalized',
  CLOSED = 'Closed',
}

@Injectable()
export class AuditWorkflowService {
  constructor(private notificationService: NotificationService) {}

  // Define valid state transitions
  private readonly validTransitions: Record<AuditStatus, AuditStatus[]> = {
    [AuditStatus.PLANNED]: [AuditStatus.APPROVED, AuditStatus.CLOSED],
    [AuditStatus.APPROVED]: [AuditStatus.IN_PROGRESS, AuditStatus.CLOSED],
    [AuditStatus.IN_PROGRESS]: [AuditStatus.UNDER_REVIEW, AuditStatus.CLOSED],
    [AuditStatus.UNDER_REVIEW]: [AuditStatus.FINALIZED, AuditStatus.IN_PROGRESS],
    [AuditStatus.FINALIZED]: [AuditStatus.CLOSED],
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
      case AuditStatus.IN_PROGRESS:
        title = 'Audit Started';
        message = `The audit "${auditName}" is now in progress.`;
        type = 'info';
        break;
      case AuditStatus.UNDER_REVIEW:
        title = 'Audit Review Needed';
        message = `The audit "${auditName}" is ready for review.`;
        type = 'action_required';
        break;
      case AuditStatus.FINALIZED:
        title = 'Audit Finalized';
        message = `The audit "${auditName}" has been finalized.`;
        type = 'success';
        break;
      case AuditStatus.CLOSED:
        title = 'Audit Closed';
        message = `The audit "${auditName}" has been closed.`;
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
        [AuditStatus.APPROVED]: ['Chief Audit Executive (CAE)'],
        [AuditStatus.CLOSED]: ['System Administrator'],
      },
      [AuditStatus.APPROVED]: {
        [AuditStatus.IN_PROGRESS]: ['Audit Manager', 'Chief Audit Executive (CAE)'],
        [AuditStatus.CLOSED]: ['System Administrator'],
      },
      [AuditStatus.IN_PROGRESS]: {
        [AuditStatus.UNDER_REVIEW]: ['Audit Manager', 'Auditor'],
        [AuditStatus.CLOSED]: ['System Administrator'],
      },
      [AuditStatus.UNDER_REVIEW]: {
        [AuditStatus.FINALIZED]: ['Audit Manager', 'Chief Audit Executive (CAE)'],
        [AuditStatus.IN_PROGRESS]: ['Audit Manager'],
      },
      [AuditStatus.FINALIZED]: {
        [AuditStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'System Administrator'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
