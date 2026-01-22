import { FindingService, CreateFindingDto, UpdateFindingDto } from './finding.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
export declare class FindingController {
    private findingService;
    private workflowService;
    constructor(findingService: FindingService, workflowService: FindingWorkflowService);
    getAll(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    getCritical(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    getOverdue(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    getOne(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    getByAudit(auditId: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    create(body: CreateFindingDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    update(id: number, body: UpdateFindingDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    transitionStatus(id: number, body: {
        toStatus: string;
        userRole?: string;
    }): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditId: number;
        severity: string;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    getAllowedTransitions(id: number): Promise<{
        currentStatus: string;
        allowedTransitions: import("../workflow/finding.workflow").FindingStatus[];
    }>;
    escalate(id: number, body: {
        reason: string;
        escalatedTo: string;
    }): Promise<{
        findingId: number;
        escalatedTo: string;
        reason: string;
        timestamp: Date;
        status: string;
    }>;
}
