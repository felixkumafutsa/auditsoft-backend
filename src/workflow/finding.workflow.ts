// src/workflow/finding.workflow.ts
// Finding Lifecycle: Identified → Validated → Action Assigned → Remediation In Progress → Verified → Closed
// Auditor identifies, Manager validates, Chief Auditor assigns action, Chief Auditor manages remediation progress,
// Chief Auditor verifies (with comment), Chief Auditor closes (with comment)

import { Injectable, BadRequestException } from '@nestjs/common';

export enum FindingStatus {
  IDENTIFIED = 'Identified',
  VALIDATED = 'Validated',
  ACTION_ASSIGNED = 'Action Assigned',
  REMEDIATION_IN_PROGRESS = 'Remediation In Progress',
  VERIFIED = 'Verified',
  CLOSED = 'Closed',
}

export enum FindingSeverity {
  CRITICAL = 'Critical',
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
}

// Actions that require Chief Auditor comments
export const CHIEF_AUDITOR_FINDING_COMMENT_REQUIRED = [
  { from: 'Remediation In Progress', to: 'Verified' },
  { from: 'Verified', to: 'Closed' },
];

@Injectable()
export class FindingWorkflowService {
  // Strict lifecycle: Identified → Validated → Action Assigned → Remediation In Progress → Verified → Closed
  private readonly validTransitions: Record<FindingStatus, FindingStatus[]> = {
    [FindingStatus.IDENTIFIED]: [FindingStatus.VALIDATED],
    [FindingStatus.VALIDATED]: [FindingStatus.ACTION_ASSIGNED],
    [FindingStatus.ACTION_ASSIGNED]: [FindingStatus.REMEDIATION_IN_PROGRESS],
    [FindingStatus.REMEDIATION_IN_PROGRESS]: [FindingStatus.VERIFIED],
    [FindingStatus.VERIFIED]: [FindingStatus.CLOSED],
    [FindingStatus.CLOSED]: [], // Terminal state
  };

  /**
   * Check if this transition requires Chief Auditor comment
   */
  requiresChiefAuditorComment(fromStatus: string, toStatus: string): boolean {
    return CHIEF_AUDITOR_FINDING_COMMENT_REQUIRED.some(
      t => t.from === fromStatus && t.to === toStatus
    );
  }

  /**
   * Validate if a state transition is allowed
   */
  canTransition(fromStatus: string, toStatus: string): boolean {
    const from = fromStatus as FindingStatus;
    const to = toStatus as FindingStatus;

    if (!Object.values(FindingStatus).includes(from)) {
      throw new BadRequestException(`Invalid current status: ${from}`);
    }

    if (!Object.values(FindingStatus).includes(to)) {
      throw new BadRequestException(`Invalid target status: ${to}`);
    }

    const allowedTransitions = this.validTransitions[from] || [];
    return allowedTransitions.includes(to);
  }

  /**
   * Get allowed transitions from current status
   */
  getAllowedTransitions(currentStatus: string): FindingStatus[] {
    const status = currentStatus as FindingStatus;
    return this.validTransitions[status] || [];
  }

  /**
   * Get role-based permissions for status transitions
   * Auditor: identifies
   * Manager: validates
   * Chief Auditor: assigns action, manages remediation, verifies (with comment), closes (with comment)
   * Process Owner: views dashboard and reports (no status management)
   */
  getPermittedRoles(fromStatus: string, toStatus: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      [FindingStatus.IDENTIFIED]: {
        [FindingStatus.VALIDATED]: ['Audit Manager', 'Manager'],
      },
      [FindingStatus.VALIDATED]: {
        [FindingStatus.ACTION_ASSIGNED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
      },
      [FindingStatus.ACTION_ASSIGNED]: {
        [FindingStatus.REMEDIATION_IN_PROGRESS]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
      },
      [FindingStatus.REMEDIATION_IN_PROGRESS]: {
        [FindingStatus.VERIFIED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
      },
      [FindingStatus.VERIFIED]: {
        [FindingStatus.CLOSED]: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'],
      },
    };

    return transitions[fromStatus]?.[toStatus] || [];
  }

  /**
   * Get escalation threshold based on severity
   */
  requiresEscalation(severity: string): boolean {
    return [FindingSeverity.CRITICAL, FindingSeverity.HIGH].includes(severity as FindingSeverity);
  }

  /**
   * Suggest next status based on current status and role
   */
  suggestNextStatus(currentStatus: string, userRole: string): FindingStatus[] {
    const allowed = this.getAllowedTransitions(currentStatus);
    // Filter based on user role
    return allowed.filter(status => {
      const permittedRoles = this.getPermittedRoles(currentStatus, status);
      return permittedRoles.includes(userRole);
    });
  }
}
