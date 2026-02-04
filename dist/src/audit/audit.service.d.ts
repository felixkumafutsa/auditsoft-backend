import { PrismaService } from '../../prisma/prisma.service';
import { Audit } from '@prisma/client';
import { NotificationService } from '../notification/notification.service';
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
}
export declare class AuditService {
    private prisma;
    private notificationService;
    constructor(prisma: PrismaService, notificationService: NotificationService);
    findAll(user?: any): Promise<Audit[]>;
    findOne(id: number, user?: any): Promise<Audit>;
    findTemplates(): Promise<Audit[]>;
    create(data: CreateAuditDto, user?: any): Promise<Audit>;
    update(id: number, data: UpdateAuditDto, user?: any): Promise<Audit>;
    delete(id: number): Promise<Audit>;
}
