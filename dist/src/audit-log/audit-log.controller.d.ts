import { AuditLogService } from './audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    findAll(): Promise<({
        user: {
            name: string;
            email: string;
        };
    } & {
        id: number;
        entityType: string;
        userId: number;
        action: string;
        entityId: number | null;
        timestamp: Date;
        ipAddress: string | null;
        deviceInfo: string | null;
    })[]>;
    search(filters: any): Promise<({
        user: {
            name: string;
            email: string;
        };
    } & {
        id: number;
        entityType: string;
        userId: number;
        action: string;
        entityId: number | null;
        timestamp: Date;
        ipAddress: string | null;
        deviceInfo: string | null;
    })[]>;
}
