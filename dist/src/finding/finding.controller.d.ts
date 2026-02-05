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
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }[]>;
    getCritical(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }[]>;
    getOverdue(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }[]>;
    getOne(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }>;
    getActionPlans(id: number): Promise<any>;
    getByAudit(auditId: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }[]>;
    create(body: CreateFindingDto, req: any): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }>;
    update(id: number, body: UpdateFindingDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
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
        auditProgramId: number | null;
        auditId: number;
        severity: string;
        rootCause: string | null;
        assignedToId: number | null;
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
