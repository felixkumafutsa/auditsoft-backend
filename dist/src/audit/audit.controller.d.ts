import { AuditService, CreateAuditDto, UpdateAuditDto } from './audit.service';
export declare class AuditController {
    private auditService;
    constructor(auditService: AuditService);
    getAll(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditName: string;
        auditType: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
    }[]>;
    getOne(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditName: string;
        auditType: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
    }>;
    create(body: CreateAuditDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditName: string;
        auditType: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
    }>;
    update(id: number, body: UpdateAuditDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditName: string;
        auditType: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditName: string;
        auditType: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
    }>;
}
