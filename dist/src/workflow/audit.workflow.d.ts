import { NotificationService } from '../notification/notification.service';
export declare enum AuditStatus {
    PLANNED = "Planned",
    APPROVED = "Approved",
    REJECTED = "Rejected",
    IN_PROGRESS = "In Progress",
    UNDER_REVIEW = "Under Review",
    FINALIZED = "Finalized",
    CLOSED = "Closed",
    REPORT_GENERATED = "Report Generated"
}
export declare const CAE_COMMENT_REQUIRED_TRANSITIONS: {
    from: string;
    to: string;
}[];
export declare class AuditWorkflowService {
    private notificationService;
    constructor(notificationService: NotificationService);
    private readonly validTransitions;
    requiresCAEComment(fromStatus: string, toStatus: string): boolean;
    canTransition(fromStatus: string, toStatus: string): boolean;
    handleTransition(auditId: number, auditName: string, fromStatus: string, toStatus: string, recipients: {
        managerId?: number;
        auditorIds?: number[];
    }, caeComment?: string): Promise<void>;
    private triggerNotifications;
    getAllowedTransitions(currentStatus: string): AuditStatus[];
    getPermittedRoles(fromStatus: string, toStatus: string): string[];
}
