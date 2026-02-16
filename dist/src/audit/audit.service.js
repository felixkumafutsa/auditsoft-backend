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
const reports_service_1 = require("../reports/reports.service");
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
    auditUniverseId;
    assignedAuditorIds;
}
exports.UpdateAuditDto = UpdateAuditDto;
let AuditService = class AuditService {
    prisma;
    notificationService;
    reportsService;
    constructor(prisma, notificationService, reportsService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
        this.reportsService = reportsService;
    }
    async findAll(user) {
        const where = {
            status: { not: 'Template' }
        };
        if (user) {
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const isAuditor = roles.includes('Auditor');
            const isProcessOwner = roles.includes('Process Owner');
            if (isAuditor) {
                where.assignedAuditors = { some: { id: user.id } };
            }
            else if (isProcessOwner) {
                where.auditUniverse = { ownerId: user.id };
            }
        }
        return this.prisma.audit.findMany({
            where,
            include: {
                findings: true,
                auditPrograms: true,
                assignedManager: true,
                assignedAuditors: true,
                auditUniverse: true
            },
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
    async findForOwner(ownerId) {
        return this.prisma.audit.findMany({
            where: {
                status: { not: 'Template' },
                auditUniverse: { ownerId },
            },
            include: { findings: true, auditPrograms: true, assignedManager: true, assignedAuditors: true, auditUniverse: true },
            orderBy: { createdAt: 'desc' },
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
                                roleName: { in: ['Chief Auditor'] }
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
        const existingAudit = await this.prisma.audit.findUnique({
            where: { id },
            include: { assignedManager: true, assignedAuditors: true }
        });
        if (!existingAudit) {
            throw new common_1.NotFoundException(`Audit with ID ${id} not found`);
        }
        const { auditName, auditType, status, startDate, endDate, assignedManagerId, auditUniverseId, assignedAuditorIds } = data;
        const updateData = {
            ...(auditName !== undefined && { auditName }),
            ...(auditType !== undefined && { auditType }),
            ...(status !== undefined && { status }),
            ...(startDate !== undefined && { startDate }),
            ...(endDate !== undefined && { endDate }),
            ...(assignedManagerId !== undefined && { assignedManagerId }),
            ...(auditUniverseId !== undefined && { auditUniverseId }),
        };
        if (assignedAuditorIds) {
            updateData.assignedAuditors = {
                set: assignedAuditorIds.map(id => ({ id }))
            };
        }
        const updatedAudit = await this.prisma.audit.update({
            where: { id },
            data: updateData,
            include: {
                findings: true,
                auditPrograms: true,
                assignedAuditors: true,
                assignedManager: true,
                auditUniverse: {
                    include: {
                        owner: true
                    }
                }
            },
        });
        if (data.assignedAuditorIds && data.assignedAuditorIds.length > 0) {
            const newAuditorIds = data.assignedAuditorIds.filter(id => !existingAudit.assignedAuditors?.some(a => a.id === id));
            for (const auditorId of newAuditorIds) {
                if (user && user.id === auditorId)
                    continue;
                await this.notificationService.create({
                    userId: auditorId,
                    title: 'Assigned to Audit',
                    message: `You have been assigned to audit '${updatedAudit.auditName}' by ${user?.name || 'an Audit Manager'}.`,
                    type: 'info',
                    link: `/audits/${updatedAudit.id}`
                });
            }
        }
        if (data.status && data.status !== existingAudit.status) {
            const auditLink = `/audits/${updatedAudit.id}`;
            const auditName = updatedAudit.auditName;
            if (existingAudit.status === 'Planned' && data.status === 'Approved') {
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
            if (existingAudit.status === 'Planned' && data.status === 'Rejected') {
                if (updatedAudit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: updatedAudit.assignedManagerId,
                        title: 'Audit Plan Rejected',
                        message: `The audit plan for '${auditName}' has been rejected by the CAE.`,
                        type: 'warning',
                        link: auditLink
                    });
                }
            }
            if (existingAudit.status === 'In Progress' && data.status === 'Under Review') {
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
            if (existingAudit.status === 'Under Review' && data.status === 'Execution Finished') {
                const caes = await this.prisma.user.findMany({
                    where: {
                        userRoles: {
                            some: {
                                role: {
                                    roleName: { in: ['Chief Auditor'] }
                                }
                            }
                        }
                    }
                });
                for (const cae of caes) {
                    await this.notificationService.create({
                        userId: cae.id,
                        title: 'Audit Execution Finished',
                        message: `Execution for audit '${auditName}' has been confirmed finished by the manager and is ready for your finalization.`,
                        type: 'action_required',
                        link: auditLink
                    });
                }
            }
            if (existingAudit.status === 'Execution Finished' && data.status === 'Finalized') {
                await this.reportsService.generatePDFToFile(updatedAudit.id);
                if (updatedAudit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: updatedAudit.assignedManagerId,
                        title: 'Audit Report Ready for Review',
                        message: `The audit '${auditName}' has been finalized. Please preview and save the report for CAE approval.`,
                        type: 'action_required',
                        link: `/reports/audit/${updatedAudit.id}/preview`
                    });
                }
            }
            if (existingAudit.status === 'Finalized' && data.status === 'Process Owner Review') {
                const caes = await this.prisma.user.findMany({
                    where: {
                        userRoles: {
                            some: {
                                role: {
                                    roleName: { in: ['Chief Auditor'] }
                                }
                            }
                        }
                    }
                });
                for (const cae of caes) {
                    await this.notificationService.create({
                        userId: cae.id,
                        title: 'Process Owner Reviewed Audit',
                        message: `The process owner has reviewed audit '${auditName}'. You can now close the audit.`,
                        type: 'info',
                        link: auditLink
                    });
                }
            }
            if (data.status === 'Closed') {
                if (updatedAudit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: updatedAudit.assignedManagerId,
                        title: 'Audit Closed',
                        message: `Audit '${auditName}' has been officially closed. The final report is ready.`,
                        type: 'success',
                        link: `/reports/audit/${updatedAudit.id}/preview`
                    });
                }
                for (const auditor of updatedAudit.assignedAuditors) {
                    await this.notificationService.create({
                        userId: auditor.id,
                        title: 'Audit Closed',
                        message: `Audit '${auditName}' has been officially closed.`,
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
        notification_service_1.NotificationService,
        reports_service_1.ReportsService])
], AuditService);
//# sourceMappingURL=audit.service.js.map