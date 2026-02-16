// src/workflow/evidence.workflow.ts
// Evidence Lifecycle: Uploaded → Reviewed → Approved → Archived
// Auditor uploads, Manager reviews, Manager approves, Manager archives

import { Injectable, BadRequestException } from '@nestjs/common';

export enum EvidenceStatus {
  UPLOADED = 'Uploaded',
  REVIEWED = 'Reviewed',
  APPROVED = 'Approved',
  ARCHIVED = 'Archived',
}

@Injectable()
export class EvidenceWorkflowService {
  // Strict lifecycle: Uploaded → Reviewed → Approved → Archived
  private readonly validTransitions: Record<EvidenceStatus, EvidenceStatus[]> = {
    [EvidenceStatus.UPLOADED]: [EvidenceStatus.REVIEWED],
    [EvidenceStatus.REVIEWED]: [EvidenceStatus.APPROVED, EvidenceStatus.UPLOADED], // Can reject back to re-upload
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
   * Auditor: uploads
   * Manager: reviews, approves, archives
   */
  getPermittedRoles(fromStatus: string, toStatus: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      [EvidenceStatus.UPLOADED]: {
        [EvidenceStatus.REVIEWED]: ['Audit Manager', 'Manager'],
      },
      [EvidenceStatus.REVIEWED]: {
        [EvidenceStatus.APPROVED]: ['Audit Manager', 'Manager'],
        [EvidenceStatus.UPLOADED]: ['Audit Manager', 'Manager'], // Reject back for re-upload
      },
      [EvidenceStatus.APPROVED]: {
        [EvidenceStatus.ARCHIVED]: ['Audit Manager', 'Manager'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }
}
