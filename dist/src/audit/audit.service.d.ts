import { PrismaService } from '../../prisma/prisma.service';
import { Audit } from '@prisma/client';
export declare class CreateAuditDto {
    auditName: string;
    auditType: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    assignedManagerId?: number;
    auditUniverseId?: number;
}
export declare class UpdateAuditDto {
    auditName?: string;
    auditType?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    assignedManagerId?: number;
}
export declare class AuditService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<Audit[]>;
    findOne(id: number): Promise<Audit>;
    create(data: CreateAuditDto): Promise<Audit>;
    update(id: number, data: UpdateAuditDto): Promise<Audit>;
    delete(id: number): Promise<Audit>;
}
