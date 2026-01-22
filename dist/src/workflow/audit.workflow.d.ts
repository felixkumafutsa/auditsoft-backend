export declare enum AuditStatus {
    PLANNED = "Planned",
    APPROVED = "Approved",
    IN_PROGRESS = "In Progress",
    UNDER_REVIEW = "Review",
    FINALIZED = "Finalized",
    CLOSED = "Closed"
}
export declare class AuditWorkflowService {
    private readonly validTransitions;
    canTransition(fromStatus: string, toStatus: string): boolean;
    getAllowedTransitions(currentStatus: string): AuditStatus[];
    getPermittedRoles(fromStatus: string, toStatus: string): string[];
}
