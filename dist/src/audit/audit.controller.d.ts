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
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }[]>;
    getForOwner(req: any): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }[]>;
    getTemplates(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }[]>;
    getOne(id: number, req: any): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }>;
    create(body: CreateAuditDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }>;
    update(id: number, body: UpdateAuditDto, req: any): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }>;
    assignAuditors(id: number, body: {
        auditorIds: number[];
    }): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
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
        assignedManagerId: number | null;
        auditName: string;
        auditType: string;
        auditUniverseId: number | null;
        endDate: Date | null;
        startDate: Date | null;
        chiefAuditorComments: string | null;
    }>;
    getAllowedTransitions(id: number): Promise<{
        currentStatus: string;
        allowedTransitions: import("../workflow/audit.workflow").AuditStatus[];
    }>;
    saveChiefAuditorComments(id: number, commentsDto: {
        comments: string;
    }): Promise<{
        message: string;
    }>;
}
