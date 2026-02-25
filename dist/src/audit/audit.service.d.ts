import { PrismaService } from '../../prisma/prisma.service';
import { Audit } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
import { ReportsService } from '../reports/reports.service';
export declare class CreateAuditDto {
    auditName: string;
    auditType: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    assignedManagerId?: number;
    auditUniverseId?: number;
    assignedAuditorIds?: number[];
    templateId?: number;
    riskScore?: number;
    riskLevel?: string;
    priority?: string;
    quarter?: string;
    year?: number;
    resourceHours?: number;
    budgetAllocation?: number;
    justification?: string;
}
export declare class UpdateAuditDto {
    auditName?: string;
    auditType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    assignedManagerId?: number;
    auditUniverseId?: number;
    assignedAuditorIds?: number[];
    chiefAuditorComments?: string;
    riskScore?: number;
    riskLevel?: string;
    priority?: string;
    quarter?: string;
    year?: number;
    resourceHours?: number;
    budgetAllocation?: number;
    justification?: string;
    executiveApproval?: boolean;
    executiveApprovedById?: number;
}
export declare class AuditService {
    private prisma;
    private notificationService;
    private reportsService;
    constructor(prisma: PrismaService, notificationService: NotificationService, reportsService: ReportsService);
    findAll(user?: any): Promise<Audit[]>;
    findOne(id: number, user?: any): Promise<Audit>;
    findTemplates(): Promise<Audit[]>;
    findForOwner(ownerId: number): Promise<Audit[]>;
    create(data: CreateAuditDto, user?: any): Promise<Audit>;
    update(id: number, data: UpdateAuditDto, user?: any): Promise<Audit>;
    delete(id: number): Promise<Audit>;
    updateChiefAuditorComments(auditId: number, comments: string): Promise<void>;
}
