import { Injectable, BadRequestException } from '@nestjs/common';

export enum EvidenceStatus {
  UPLOADED = 'Uploaded',
  REVIEWED = 'Reviewed',
  REJECTED = 'Rejected',
  APPROVED = 'Approved',
  ARCHIVED = 'Archived',
}

@Injectable()
export class EvidenceWorkflowService {
  private readonly validTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
    [EvidenceStatus.UPLOADED]: [EvidenceStatus.REVIEWED, EvidenceStatus.REJECTED, EvidenceStatus.ARCHIVED],
    [EvidenceStatus.REVIEWED]: [EvidenceStatus.APPROVED, EvidenceStatus.REJECTED, EvidenceStatus.UPLOADED],
    [EvidenceStatus.REJECTED]: [EvidenceStatus.UPLOADED], // Re-upload after rejection
    [EvidenceStatus.APPROVED]: [EvidenceStatus.ARCHIVED],
    [EvidenceStatus.ARCHIVED]: [], // Terminal state
  };

  /**
   * Validate if a state transition is allowed
   */
  canTransition(fromStatus: string, toStatus: string): boolean {
    const from = fromStatus as EvidenceStatus;
    const to = toStatus as EvidenceStatus;

    if (!Object.values(EvidenceStatus).includes(from)) {
      throw new BadRequestException(`Invalid current status: ${from}`);
    }

    if (!Object.values(EvidenceStatus).includes(to)) {
      throw new BadRequestException(`Invalid target status: ${to}`);
    }

    const allowedTransitions = this.validTransitions[from] || [];
    return allowedTransitions.includes(to);
  }

  /**
   * Get allowed transitions from current status
   */
  getAllowedTransitions(currentStatus: string): EvidenceStatus[] {
    const status = currentStatus as EvidenceStatus;
    return this.validTransitions[status] || [];
  }

  /**
   * Get role-based permissions for status transitions
   */
  getPermittedRoles(fromStatus: string, toStatus: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      [EvidenceStatus.UPLOADED]: {
        [EvidenceStatus.REVIEWED]: ['Audit Manager', 'Manager', 'Chief Audit Executive (CAE)', 'CAE', 'Admin', 'System Administrator'],
        [EvidenceStatus.REJECTED]: ['Audit Manager', 'Manager', 'Chief Audit Executive (CAE)', 'CAE', 'Admin', 'System Administrator'],
      },
      [EvidenceStatus.REVIEWED]: {
        [EvidenceStatus.APPROVED]: ['Chief Audit Executive (CAE)', 'CAE', 'Admin', 'System Administrator'],
        [EvidenceStatus.REJECTED]: ['Chief Audit Executive (CAE)', 'CAE', 'Admin', 'System Administrator'],
      },
      [EvidenceStatus.REJECTED]: {
        [EvidenceStatus.UPLOADED]: ['Auditor'],
      },
      [EvidenceStatus.APPROVED]: {
        [EvidenceStatus.ARCHIVED]: ['Chief Audit Executive (CAE)', 'CAE', 'Admin', 'System Administrator'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
