// src/workflow/finding.workflow.ts
import { Injectable, BadRequestException } from '@nestjs/common';

export enum FindingStatus {
  IDENTIFIED = 'Identified',
  VALIDATED = 'Validated',
  REJECTED = 'Rejected',
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

@Injectable()
export class FindingWorkflowService {
  private readonly validTransitions: Record<FindingStatus, FindingStatus[]> = {
    [FindingStatus.IDENTIFIED]: [FindingStatus.VALIDATED, FindingStatus.REJECTED],
    [FindingStatus.VALIDATED]: [FindingStatus.ACTION_ASSIGNED, FindingStatus.REJECTED],
    [FindingStatus.REJECTED]: [FindingStatus.IDENTIFIED],
    [FindingStatus.ACTION_ASSIGNED]: [FindingStatus.REMEDIATION_IN_PROGRESS],
    [FindingStatus.REMEDIATION_IN_PROGRESS]: [FindingStatus.CLOSED, FindingStatus.VERIFIED],
    [FindingStatus.VERIFIED]: [FindingStatus.CLOSED, FindingStatus.REMEDIATION_IN_PROGRESS],
    [FindingStatus.CLOSED]: [], // Terminal state
  };

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
   */
  getPermittedRoles(fromStatus: string, toStatus: string): string[] {
    const transitions: Record<string, Record<string, string[]>> = {
      [FindingStatus.IDENTIFIED]: {
        [FindingStatus.VALIDATED]: ['Audit Manager', 'Manager'],
        [FindingStatus.REJECTED]: ['Audit Manager', 'Manager'],
      },
      [FindingStatus.VALIDATED]: {
        [FindingStatus.ACTION_ASSIGNED]: ['Chief Audit Executive (CAE)', 'CAE'],
        [FindingStatus.REJECTED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [FindingStatus.REJECTED]: {
        [FindingStatus.IDENTIFIED]: ['Auditor'],
      },
      [FindingStatus.ACTION_ASSIGNED]: {
        [FindingStatus.REMEDIATION_IN_PROGRESS]: ['Audit Manager', 'Manager', 'Chief Audit Executive (CAE)', 'CAE'],
      },
      [FindingStatus.REMEDIATION_IN_PROGRESS]: {
        [FindingStatus.VERIFIED]: ['Audit Manager', 'Manager'],
        [FindingStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
      },
      [FindingStatus.VERIFIED]: {
        [FindingStatus.CLOSED]: ['Chief Audit Executive (CAE)', 'CAE'],
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
