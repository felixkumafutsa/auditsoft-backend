import { AuditService, CreateAuditDto, UpdateAuditDto } from './audit.service';
import { AuditWorkflowService } from '../workflow/audit.workflow';
export declare class AuditController {
    private auditService;
    private workflowService;
    constructor(auditService: AuditService, workflowService: AuditWorkflowService);
    getAll(req: any): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getForOwner(req: any): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getTemplates(): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getOne(id: number, req: any): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(body: CreateAuditDto): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, body: UpdateAuditDto, req: any): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    assignAuditors(id: number, body: {
        auditorIds: number[];
    }): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: number): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPrograms(id: number): Promise<any>;
    getFindings(id: number): Promise<any>;
    transitionStatus(id: number, body: {
        toStatus: string;
        userRole?: string;
    }, req: any): Promise<{
        auditName: string;
        auditType: string;
        status: string;
        startDate: Date | null;
        endDate: Date | null;
        assignedManagerId: number | null;
        auditUniverseId: number | null;
        chiefAuditorComments: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
