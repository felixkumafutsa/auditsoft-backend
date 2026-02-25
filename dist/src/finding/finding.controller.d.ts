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
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    getCritical(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    getOverdue(): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    getOne(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    getActionPlans(id: number): Promise<any>;
    getByAudit(auditId: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }[]>;
    create(body: CreateFindingDto, req: any): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    update(id: number, body: UpdateFindingDto): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    delete(id: number): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
        auditProgramId: number | null;
        rootCause: string | null;
    }>;
    assignAction(id: number, body: {
        comment?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        finding: {
            id: number;
            status: string;
            createdAt: Date;
            updatedAt: Date;
            auditId: number | null;
            description: string;
            severity: string;
            assignedToId: number | null;
            auditProgramId: number | null;
            rootCause: string | null;
        };
        redirectTo: {
            path: string;
            message: string;
        };
    }>;
    transitionStatus(id: number, body: {
        toStatus: string;
        userRole?: string;
        comment?: string;
    }): Promise<{
        id: number;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        auditId: number | null;
        description: string;
        severity: string;
        assignedToId: number | null;
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
