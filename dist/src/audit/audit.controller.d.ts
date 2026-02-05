import { AuditService, CreateAuditDto, UpdateAuditDto } from './audit.service';
import { AuditWorkflowService } from '../workflow/audit.workflow';
export declare class AuditController {
    private auditService;
    private workflowService;
    constructor(auditService: AuditService, workflowService: AuditWorkflowService);
    getAll(req: any): Promise<{
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
    getForOwner(req: any): Promise<{
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
    getTemplates(): Promise<{
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
    getOne(id: number, req: any): Promise<{
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
    update(id: number, body: UpdateAuditDto, req: any): Promise<{
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
    assignAuditors(id: number, body: {
        auditorIds: number[];
    }): Promise<{
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
    getPrograms(id: number): Promise<any>;
    getFindings(id: number): Promise<any>;
    transitionStatus(id: number, body: {
        toStatus: string;
        userRole?: string;
    }, req: any): Promise<{
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
    getAllowedTransitions(id: number): Promise<{
        currentStatus: string;
        allowedTransitions: import("../workflow/audit.workflow").AuditStatus[];
    }>;
}
