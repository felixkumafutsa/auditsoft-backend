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
        [AuditStatus.APPROVED]: ['CAE', 'Admin'],
        [AuditStatus.CLOSED]: ['Admin'],
      },
      [AuditStatus.APPROVED]: {
        [AuditStatus.IN_PROGRESS]: ['Manager', 'CAE'],
        [AuditStatus.CLOSED]: ['Admin'],
      },
      [AuditStatus.IN_PROGRESS]: {
        [AuditStatus.UNDER_REVIEW]: ['Manager', 'Auditor'],
        [AuditStatus.CLOSED]: ['Admin'],
      },
      [AuditStatus.UNDER_REVIEW]: {
        [AuditStatus.FINALIZED]: ['Manager', 'CAE'],
        [AuditStatus.IN_PROGRESS]: ['Manager'],
      },
      [AuditStatus.FINALIZED]: {
        [AuditStatus.CLOSED]: ['CAE', 'Admin'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
