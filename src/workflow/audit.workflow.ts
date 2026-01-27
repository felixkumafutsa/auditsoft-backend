// src/workflow/audit.workflow.ts
import { Injectable, BadRequestException } from '@nestjs/common';

export enum AuditStatus {
  PLANNED = 'Planned',
  APPROVED = 'Approved',
  IN_PROGRESS = 'In Progress',
  UNDER_REVIEW = 'Review',
  FINALIZED = 'Finalized',
  CLOSED = 'Closed',
}

@Injectable()
export class AuditWorkflowService {
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
