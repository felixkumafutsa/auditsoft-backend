import { PrismaService } from '../prisma/prisma.service';
export declare class AdminController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getSystemStats(): Promise<{
        totalUsers: number;
        totalRoles: number;
        totalLogs: number;
    }>;
}
