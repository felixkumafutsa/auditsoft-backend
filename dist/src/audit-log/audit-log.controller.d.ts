import { PrismaService } from '../../prisma/prisma.service';
export declare class AuditLogController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    search(filters: any): Promise<{
        id: number;
        userId: number;
        action: string;
        entityType: string;
        entityId: number | null;
        timestamp: Date;
        ipAddress: string | null;
        deviceInfo: string | null;
    }[]>;
}
