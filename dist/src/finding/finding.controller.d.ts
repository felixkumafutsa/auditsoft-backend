import { FindingService, CreateFindingDto, UpdateFindingDto } from './finding.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
export declare class FindingController {
    private findingService;
    private workflowService;
    constructor(findingService: FindingService, workflowService: FindingWorkflowService);
    getAll(): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }[]>;
    getCritical(): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }[]>;
    getOverdue(): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }[]>;
    getOne(id: number): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }>;
    getActionPlans(id: number): Promise<any>;
    getByAudit(auditId: number): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }[]>;
    create(body: CreateFindingDto, req: any): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }>;
    update(id: number, body: UpdateFindingDto): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }>;
    delete(id: number): Promise<{
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
        rootCause: string | null;
    }>;
    assignAction(id: number, body: {
        comment?: string;
    }, req: any): Promise<{
        success: boolean;
        message: string;
        finding: {
            status: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            description: string;
            auditProgramId: number | null;
            auditId: number | null;
            severity: string;
            assignedToId: number | null;
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
        status: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        description: string;
        auditProgramId: number | null;
        auditId: number | null;
        severity: string;
        assignedToId: number | null;
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
