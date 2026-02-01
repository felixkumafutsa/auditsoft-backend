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
    templateId;
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
        const where = {
            status: { not: 'Template' }
        };
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
    async findTemplates() {
        return this.prisma.audit.findMany({
            where: { status: 'Template' },
            include: { auditPrograms: true },
            orderBy: { auditName: 'asc' }
        });
    }
    async create(data, user) {
        if (!data.auditName || !data.auditType) {
            throw new common_1.BadRequestException('auditName and auditType are required');
        }
        const newAudit = await this.prisma.audit.create({
            data: {
                auditName: data.auditName,
                auditType: data.auditType,
                status: data.status || 'Planned',
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
        if (newAudit.status === 'Planned') {
            const caes = await this.prisma.user.findMany({
                where: {
                    userRoles: {
                        some: {
                            role: {
                                roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                            }
                        }
                    }
                }
            });
            for (const cae of caes) {
                await this.notificationService.create({
                    userId: cae.id,
                    title: 'New Audit Awaiting Approval',
                    message: `A new audit '${newAudit.auditName}' has been created by ${user?.name || 'a Manager'} and is awaiting your approval.`,
                    type: 'action_required',
                    link: `/audits/${newAudit.id}`
                });
            }
        }
        if (data.templateId) {
            const template = await this.prisma.audit.findUnique({
                where: { id: data.templateId },
                include: { auditPrograms: true },
            });
            if (template && template.auditPrograms.length > 0) {
                for (const program of template.auditPrograms) {
                    await this.prisma.auditProgram.create({
                        data: {
                            auditId: newAudit.id,
                            procedureName: program.procedureName,
                            controlReference: program.controlReference,
                            expectedOutcome: program.expectedOutcome,
                        },
                    });
                }
                return this.findOne(newAudit.id);
            }
        }
        return newAudit;
    }
    async update(id, data, user) {
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
            include: { findings: true, auditPrograms: true, assignedAuditors: true, assignedManager: true },
        });
        if (data.assignedAuditorIds && data.assignedAuditorIds.length > 0) {
            const assignerName = user?.name || 'System';
            for (const auditorId of data.assignedAuditorIds) {
                if (user && user.id === auditorId)
                    continue;
                await this.notificationService.create({
                    userId: auditorId,
                    title: 'New Audit Assignment',
                    message: `You have been assigned to audit: ${updatedAudit.auditName} by ${assignerName}.`,
                    type: 'info',
                    link: `/audits/${updatedAudit.id}`
                });
            }
        }
        if (data.status && data.status !== audit.status) {
            const auditLink = `/audits/${updatedAudit.id}`;
            const auditName = updatedAudit.auditName;
            if (audit.status === 'Planned' && data.status === 'Approved') {
                for (const auditor of updatedAudit.assignedAuditors) {
                    await this.notificationService.create({
                        userId: auditor.id,
                        title: 'Audit Approved',
                        message: `Audit '${auditName}' has been approved and is ready to start.`,
                        type: 'info',
                        link: auditLink
                    });
                }
            }
            if (audit.status === 'In Progress' && data.status === 'Under Review') {
                if (updatedAudit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: updatedAudit.assignedManagerId,
                        title: 'Audit Ready for Review',
                        message: `Audit '${auditName}' has been submitted for review.`,
                        type: 'action_required',
                        link: auditLink
                    });
                }
            }
            if (audit.status === 'Under Review' && data.status === 'Finalized') {
                const caes = await this.prisma.user.findMany({
                    where: {
                        userRoles: {
                            some: {
                                role: {
                                    roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                                }
                            }
                        }
                    }
                });
                for (const cae of caes) {
                    await this.notificationService.create({
                        userId: cae.id,
                        title: 'Audit Finalized',
                        message: `Audit '${auditName}' has been finalized.`,
                        type: 'info',
                        link: auditLink
                    });
                }
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