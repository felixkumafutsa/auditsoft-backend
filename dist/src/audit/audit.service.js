"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = exports.UpdateAuditDto = exports.CreateAuditDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
class CreateAuditDto {
    auditName;
    auditType;
    status;
    startDate;
    endDate;
    assignedManagerId;
    auditUniverseId;
    assignedAuditorIds;
}
exports.CreateAuditDto = CreateAuditDto;
class UpdateAuditDto {
    auditName;
    auditType;
    status;
    startDate;
    endDate;
    assignedManagerId;
    assignedAuditorIds;
}
exports.UpdateAuditDto = UpdateAuditDto;
let AuditService = class AuditService {
    prisma;
    notificationService;
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async findAll(user) {
        const where = {};
        if (user) {
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const isAuditor = roles.includes('Auditor');
            if (isAuditor) {
                where.assignedAuditors = { some: { id: user.id } };
            }
        }
        return this.prisma.audit.findMany({
            where,
            include: { findings: true, auditPrograms: true, assignedManager: true, assignedAuditors: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id, user) {
        const audit = await this.prisma.audit.findUnique({
            where: { id },
            include: { findings: true, auditPrograms: true, assignedManager: true, assignedAuditors: true },
        });
        if (!audit) {
            throw new common_1.NotFoundException(`Audit with ID ${id} not found`);
        }
        if (user) {
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const isAuditor = roles.includes('Auditor');
            if (isAuditor) {
                const isAssigned = audit.assignedAuditors.some((auditor) => auditor.id === user.id);
                if (!isAssigned) {
                    throw new common_1.NotFoundException(`Audit with ID ${id} not found`);
                }
            }
        }
        return audit;
    }
    async create(data) {
        if (!data.auditName || !data.auditType) {
            throw new common_1.BadRequestException('auditName and auditType are required');
        }
        return this.prisma.audit.create({
            data: {
                auditName: data.auditName,
                auditType: data.auditType,
                status: data.status || 'planned',
                startDate: data.startDate,
                endDate: data.endDate,
                assignedManagerId: data.assignedManagerId,
                auditUniverseId: data.auditUniverseId,
                assignedAuditors: data.assignedAuditorIds ? {
                    connect: data.assignedAuditorIds.map(id => ({ id }))
                } : undefined,
            },
            include: { findings: true, auditPrograms: true, assignedAuditors: true },
        });
    }
    async update(id, data) {
        const audit = await this.findOne(id);
        const updatedAudit = await this.prisma.audit.update({
            where: { id },
            data: {
                ...(data.auditName && { auditName: data.auditName }),
                ...(data.auditType && { auditType: data.auditType }),
                ...(data.status && { status: data.status }),
                ...(data.startDate && { startDate: data.startDate }),
                ...(data.endDate && { endDate: data.endDate }),
                ...(data.assignedManagerId !== undefined && {
                    assignedManagerId: data.assignedManagerId,
                }),
                ...(data.assignedAuditorIds && {
                    assignedAuditors: {
                        set: data.assignedAuditorIds.map(id => ({ id }))
                    }
                }),
            },
            include: { findings: true, auditPrograms: true, assignedAuditors: true },
        });
        if (data.assignedAuditorIds && data.assignedAuditorIds.length > 0) {
            for (const auditorId of data.assignedAuditorIds) {
                await this.notificationService.create({
                    userId: auditorId,
                    title: 'New Audit Assignment',
                    message: `You have been assigned to audit: ${updatedAudit.auditName}`,
                    type: 'info',
                    link: `/audits/${updatedAudit.id}`
                });
            }
        }
        return updatedAudit;
    }
    async delete(id) {
        await this.findOne(id);
        return this.prisma.audit.delete({
            where: { id },
            include: { findings: true, auditPrograms: true },
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], AuditService);
//# sourceMappingURL=audit.service.js.map