// src/workflow/audit.workflow.ts
// Audit Lifecycle: Planned → Approved → In Progress → Under Review → Finalized → Closed
// Manager plans, Chief Auditor approves (with comment), Auditor executes, Auditor submits for review,
// Manager reviews and finalizes, Board Member closes (with comment)

import { Injectable, BadRequestException } from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

export enum AuditStatus {
  PLANNED = 'Planned',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  IN_PROGRESS = 'In Progress',
  UNDER_REVIEW = 'Under Review',
  FINALIZED = 'Finalized',
  CLOSED = 'Closed',
  REPORT_GENERATED = 'Report Generated',
}

// Actions that require Chief Auditor comments
export const CAE_COMMENT_REQUIRED_TRANSITIONS = [
  { from: 'Planned', to: 'Approved' },
  { from: 'Planned', to: 'Rejected' },
];

@Injectable()
export class AuditWorkflowService {
  constructor(private notificationService: NotificationService) { }

  // Define valid state transitions - Strict lifecycle
  // Planned → Approved → In Progress → Under Review → Finalized → Closed → Report Generated
  private readonly validTransitions: Record<AuditStatus, AuditStatus[]> = {
    [AuditStatus.PLANNED]: [AuditStatus.APPROVED, AuditStatus.REJECTED],
    [AuditStatus.REJECTED]: [AuditStatus.PLANNED], // Manager can resubmit
    [AuditStatus.APPROVED]: [AuditStatus.IN_PROGRESS],
    [AuditStatus.IN_PROGRESS]: [AuditStatus.UNDER_REVIEW],
    [AuditStatus.UNDER_REVIEW]: [AuditStatus.FINALIZED, AuditStatus.IN_PROGRESS], // Manager can send back
    [AuditStatus.FINALIZED]: [AuditStatus.CLOSED],
    [AuditStatus.CLOSED]: [AuditStatus.REPORT_GENERATED], // Chief Auditor can generate report after closure
    [AuditStatus.REPORT_GENERATED]: [], // Terminal state
  };

  /**
   * Check if this transition requires Chief Auditor comment
   */
  requiresCAEComment(fromStatus: string, toStatus: string): boolean {
    return CAE_COMMENT_REQUIRED_TRANSITIONS.some(
      t => t.from === fromStatus && t.to === toStatus
    );
  }

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
   * Handle state transition with optional CAE comment
   */
  async handleTransition(
    auditId: number,
    auditName: string,
    fromStatus: string,
    toStatus: string,
    recipients: { managerId?: number; auditorIds?: number[] },
    caeComment?: string
  ) {
    if (!this.canTransition(fromStatus, toStatus)) {
      throw new BadRequestException(`Invalid transition from ${fromStatus} to ${toStatus}`);
    }

    // Validate Chief Auditor comment is provided when required
    if (this.requiresCAEComment(fromStatus, toStatus) && !caeComment) {
      throw new BadRequestException(`Chief Auditor comment is required for transitioning from ${fromStatus} to ${toStatus}`);
    }

    // Trigger notifications based on new status
    await this.triggerNotifications(auditId, auditName, fromStatus, toStatus, recipients, caeComment);
  }

  private async triggerNotifications(
    auditId: number,
    auditName: string,
    fromStatus: string,
    toStatus: string,
    recipients: { managerId?: number; auditorIds?: number[] },
    caeComment?: string
  ) {
    const link = `/audits/${auditId}`;
    const notifications: CreateNotificationDto[] = [];

    switch (toStatus) {
      case AuditStatus.APPROVED:
        // Notify Manager and Auditors that audit is approved
        if (recipients.managerId) {
          notifications.push({
            userId: recipients.managerId,
            title: 'Audit Plan Approved',
            message: `The audit "${auditName}" has been approved by the Chief Auditor.${caeComment ? ` Comment: ${caeComment}` : ''}`,
            type: 'success',
            link,
          });
        }
        if (recipients.auditorIds) {
          for (const auditorId of recipients.auditorIds) {
            notifications.push({
              userId: auditorId,
              title: 'Audit Ready to Start',
              message: `The audit "${auditName}" has been approved and is ready for execution.${caeComment ? ` Chief Auditor Comment: ${caeComment}` : ''}`,
              type: 'info',
              link,
            });
          }
        }
        break;

      case AuditStatus.REJECTED:
        // Notify Manager that audit was rejected with Chief Auditor feedback
        if (recipients.managerId) {
          notifications.push({
            userId: recipients.managerId,
            title: 'Audit Plan Rejected',
            message: `The audit "${auditName}" has been rejected by the Chief Auditor. Feedback: ${caeComment || 'No comment provided'}`,
            type: 'warning',
            link,
          });
        }
        break;

      case AuditStatus.IN_PROGRESS:
        // Notify Manager that audit has started
        if (recipients.managerId) {
          notifications.push({
            userId: recipients.managerId,
            title: 'Audit Execution Started',
            message: `The audit "${auditName}" is now in progress.`,
            type: 'info',
            link,
          });
        }
        break;

      case AuditStatus.UNDER_REVIEW:
        // Notify Manager that audit is ready for review
        if (recipients.managerId) {
          notifications.push({
            userId: recipients.managerId,
            title: 'Audit Ready for Review',
            message: `The audit "${auditName}" has been submitted for your review.`,
            type: 'action_required',
            link,
          });
        }
        break;

      case AuditStatus.FINALIZED:
        // Notify Auditors and prepare for CAE closure
        if (recipients.auditorIds) {
          for (const auditorId of recipients.auditorIds) {
            notifications.push({
              userId: auditorId,
              title: 'Audit Finalized',
              message: `The audit "${auditName}" has been finalized by the manager.`,
              type: 'success',
              link,
            });
          }
        }
        break;

      case AuditStatus.CLOSED:
        // Notify Manager and Auditors with Board Member closing comment
        if (recipients.managerId) {
          notifications.push({
            userId: recipients.managerId,
            title: 'Audit Closed',
            message: `The audit "${auditName}" has been closed by the Chief Auditor. Feedback: ${caeComment || 'No comment provided'}`,
            type: 'success',
            link,
          });
        }
        if (recipients.auditorIds) {
          for (const auditorId of recipients.auditorIds) {
            notifications.push({
              userId: auditorId,
              title: 'Audit Closed',
              message: `The audit "${auditName}" has been officially closed. Chief Auditor Feedback: ${caeComment || 'No comment provided'}`,
              type: 'info',
              link,
            });
          }
        }
        break;

      case AuditStatus.REPORT_GENERATED:
        // Notify all stakeholders that report has been generated
        if (recipients.managerId) {
          notifications.push({
            userId: recipients.managerId,
            title: 'Audit Report Generated',
            message: `The final audit report for "${auditName}" has been generated by the Chief Auditor.`,
            type: 'success',
            link,
          });
        }
        if (recipients.auditorIds) {
          for (const auditorId of recipients.auditorIds) {
            notifications.push({
              userId: auditorId,
              title: 'Audit Report Generated',
              message: `The final audit report for "${auditName}" has been generated and is now available.`,
              type: 'info',
              link,
            });
          }
        }
        break;
    }

    // Send all notifications
    for (const notification of notifications) {
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
   * Manager: plans, reviews/finalizes
   * Chief Auditor: approves/rejects planned audits
   * Auditor: executes, submits for review
   * Board Member: closes finalized audits
   */
  getPermittedRoles(fromStatus: string, toStatus: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      [AuditStatus.PLANNED]: {
        [AuditStatus.APPROVED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
        [AuditStatus.REJECTED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
      },
      [AuditStatus.REJECTED]: {
        [AuditStatus.PLANNED]: ['Audit Manager', 'Manager'],
      },
      [AuditStatus.APPROVED]: {
        [AuditStatus.IN_PROGRESS]: ['Auditor'],
      },
      [AuditStatus.IN_PROGRESS]: {
        [AuditStatus.UNDER_REVIEW]: ['Auditor'],
      },
      [AuditStatus.UNDER_REVIEW]: {
        [AuditStatus.FINALIZED]: ['Audit Manager', 'Manager'],
        [AuditStatus.IN_PROGRESS]: ['Audit Manager', 'Manager'], // Send back for rework
      },
      [AuditStatus.FINALIZED]: {
        [AuditStatus.CLOSED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'], // Chief Auditor approves at finalization
      },
      [AuditStatus.CLOSED]: {
        [AuditStatus.REPORT_GENERATED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'], // Only Chief Auditor can generate report
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
