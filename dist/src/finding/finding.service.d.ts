import { PrismaService } from '../../prisma/prisma.service';
import { Finding } from '@prisma/client';
import { FindingWorkflowService } from '../workflow/finding.workflow';
import { AuditService } from '../audit/audit.service';
export declare class CreateFindingDto {
    auditId: number;
    auditProgramId?: number;
    description: string;
    severity: string;
    rootCause?: string;
    status?: string;
}
export declare class UpdateFindingDto {
    description?: string;
    severity?: string;
    rootCause?: string;
    status?: string;
}
export declare class FindingService {
    private prisma;
    private workflowService;
    private auditService;
    constructor(prisma: PrismaService, workflowService: FindingWorkflowService, auditService: AuditService);
    findAll(): Promise<Finding[]>;
    findOne(id: number): Promise<Finding>;
    findByAudit(auditId: number): Promise<Finding[]>;
    create(data: CreateFindingDto, user?: any): Promise<Finding>;
    update(id: number, data: UpdateFindingDto): Promise<Finding>;
    transitionStatus(id: number, toStatus: string, userRole?: string): Promise<Finding>;
    delete(id: number): Promise<Finding>;
    getCriticalFindings(): Promise<Finding[]>;
    getOverdueFindings(): Promise<Finding[]>;
}
