import { Injectable, BadRequestException } from '@nestjs/common';

export enum EvidenceStatus {
  UPLOADED = 'Uploaded',
  REVIEWED = 'Reviewed',
  APPROVED = 'Approved',
  ARCHIVED = 'Archived',
}

@Injectable()
export class EvidenceWorkflowService {
  private readonly validTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
    [EvidenceStatus.UPLOADED]: [EvidenceStatus.REVIEWED],
    [EvidenceStatus.REVIEWED]: [EvidenceStatus.APPROVED],
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
        [EvidenceStatus.REVIEWED]: ['Auditor', 'Audit Manager'],
      },
      [EvidenceStatus.REVIEWED]: {
        [EvidenceStatus.APPROVED]: ['Audit Manager', 'Chief Audit Executive (CAE)'],
      },
      [EvidenceStatus.APPROVED]: {
        [EvidenceStatus.ARCHIVED]: ['System Administrator', 'Chief Audit Executive (CAE)'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
