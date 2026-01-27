// src/workflow/finding.workflow.ts
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

@Injectable()
export class FindingWorkflowService {
  private readonly validTransitions: Record<FindingStatus, FindingStatus[]> = {
    [FindingStatus.IDENTIFIED]: [FindingStatus.VALIDATED, FindingStatus.CLOSED],
    [FindingStatus.VALIDATED]: [FindingStatus.ACTION_ASSIGNED, FindingStatus.CLOSED],
    [FindingStatus.ACTION_ASSIGNED]: [FindingStatus.REMEDIATION_IN_PROGRESS, FindingStatus.CLOSED],
    [FindingStatus.REMEDIATION_IN_PROGRESS]: [FindingStatus.VERIFIED, FindingStatus.ACTION_ASSIGNED],
    [FindingStatus.VERIFIED]: [FindingStatus.CLOSED],
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
        [FindingStatus.VALIDATED]: ['Auditor', 'Audit Manager'],
        [FindingStatus.CLOSED]: ['System Administrator'],
      },
      [FindingStatus.VALIDATED]: {
        [FindingStatus.ACTION_ASSIGNED]: ['Audit Manager', 'Chief Audit Executive (CAE)'],
        [FindingStatus.CLOSED]: ['System Administrator'],
      },
      [FindingStatus.ACTION_ASSIGNED]: {
        [FindingStatus.REMEDIATION_IN_PROGRESS]: ['Process Owner', 'Audit Manager'],
        [FindingStatus.CLOSED]: ['System Administrator'],
      },
      [FindingStatus.REMEDIATION_IN_PROGRESS]: {
        [FindingStatus.VERIFIED]: ['Auditor', 'Audit Manager'],
        [FindingStatus.ACTION_ASSIGNED]: ['Audit Manager'],
      },
      [FindingStatus.VERIFIED]: {
        [FindingStatus.CLOSED]: ['Audit Manager', 'Chief Audit Executive (CAE)'],
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
