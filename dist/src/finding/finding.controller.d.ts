import { FindingService, CreateFindingDto, UpdateFindingDto } from './finding.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
export declare class FindingController {
    private findingService;
    private workflowService;
    constructor(findingService: FindingService, workflowService: FindingWorkflowService);
    getAll(): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }[]>;
    getCritical(): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }[]>;
    getOverdue(): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }[]>;
    getOne(id: number): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }>;
    getActionPlans(id: number): Promise<any>;
    getByAudit(auditId: number): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }[]>;
    create(body: CreateFindingDto, req: any): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }>;
    update(id: number, body: UpdateFindingDto): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }>;
    delete(id: number): Promise<{
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        assignedToId: number | null;
    }>;
    assignAction(id: number, body: {
        comment?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        finding: {
            auditId: number | null;
            auditProgramId: number | null;
            description: string;
            severity: string;
            rootCause: string | null;
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            assignedToId: number | null;
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
        auditId: number | null;
        auditProgramId: number | null;
        description: string;
        severity: string;
        rootCause: string | null;
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
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
