import { NotificationService } from '../notification/notification.service';
export declare enum AuditStatus {
    PLANNED = "Planned",
    APPROVED = "Approved",
    IN_PROGRESS = "In Progress",
    UNDER_REVIEW = "Review",
    FINALIZED = "Finalized",
    CLOSED = "Closed"
}
export declare class AuditWorkflowService {
    private notificationService;
    constructor(notificationService: NotificationService);
    private readonly validTransitions;
    canTransition(fromStatus: string, toStatus: string): boolean;
    handleTransition(auditId: number, auditName: string, fromStatus: string, toStatus: string, managerId?: number): Promise<void>;
    private triggerNotification;
    getAllowedTransitions(currentStatus: string): AuditStatus[];
    getPermittedRoles(fromStatus: string, toStatus: string): string[];
}
