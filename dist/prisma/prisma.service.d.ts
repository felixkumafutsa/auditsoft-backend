import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private getPrisma;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get user(): import("@prisma/client").Prisma.UserDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get role(): import("@prisma/client").Prisma.RoleDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get userRole(): import("@prisma/client").Prisma.UserRoleDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get auditUniverse(): import("@prisma/client").Prisma.AuditUniverseDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get audit(): import("@prisma/client").Prisma.AuditDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get auditProgram(): import("@prisma/client").Prisma.AuditProgramDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get evidence(): import("@prisma/client").Prisma.EvidenceDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get finding(): import("@prisma/client").Prisma.FindingDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get actionPlan(): import("@prisma/client").Prisma.ActionPlanDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get auditLog(): import("@prisma/client").Prisma.AuditLogDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get complianceFramework(): import("@prisma/client").Prisma.ComplianceFrameworkDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get controlMapping(): import("@prisma/client").Prisma.ControlMappingDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get integration(): import("@prisma/client").Prisma.IntegrationDelegate<import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get $connect(): any;
    get $disconnect(): any;
}
