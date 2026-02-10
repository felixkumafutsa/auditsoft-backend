export declare enum FindingStatus {
    IDENTIFIED = "Identified",
    VALIDATED = "Validated",
    REJECTED = "Rejected",
    ACTION_ASSIGNED = "Action Assigned",
    REMEDIATION_IN_PROGRESS = "Remediation In Progress",
    VERIFIED = "Verified",
    CLOSED = "Closed"
}
export declare enum FindingSeverity {
    CRITICAL = "Critical",
    HIGH = "High",
    MEDIUM = "Medium",
    LOW = "Low"
}
export declare class FindingWorkflowService {
    private readonly validTransitions;
    canTransition(fromStatus: string, toStatus: string): boolean;
    getAllowedTransitions(currentStatus: string): FindingStatus[];
    getPermittedRoles(fromStatus: string, toStatus: string): string[];
    requiresEscalation(severity: string): boolean;
    suggestNextStatus(currentStatus: string, userRole: string): FindingStatus[];
}
