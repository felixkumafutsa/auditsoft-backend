"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = exports.UpdateAuditDto = exports.CreateAuditDto = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const notification_service_1 = require("../notification/notification.service");
const reports_service_1 = require("../reports/reports.service");
const class_validator_1 = require("class-validator");
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
    riskScore;
    riskLevel;
    priority;
    quarter;
    year;
    resourceHours;
    budgetAllocation;
    justification;
}
exports.CreateAuditDto = CreateAuditDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "auditName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "auditType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateAuditDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateAuditDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "assignedManagerId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "auditUniverseId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAuditDto.prototype, "assignedAuditorIds", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "templateId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "riskScore", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "riskLevel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "quarter", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "resourceHours", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateAuditDto.prototype, "budgetAllocation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAuditDto.prototype, "justification", void 0);
class UpdateAuditDto {
    auditName;
    auditType;
    status;
    startDate;
    endDate;
    assignedManagerId;
    auditUniverseId;
    assignedAuditorIds;
    chiefAuditorComments;
    riskScore;
    riskLevel;
    priority;
    quarter;
    year;
    resourceHours;
    budgetAllocation;
    justification;
    executiveApproval;
    executiveApprovedById;
}
exports.UpdateAuditDto = UpdateAuditDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "auditName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "auditType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateAuditDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateAuditDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "assignedManagerId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "auditUniverseId", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateAuditDto.prototype, "assignedAuditorIds", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "chiefAuditorComments", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "riskScore", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "riskLevel", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "quarter", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "year", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "resourceHours", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "budgetAllocation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateAuditDto.prototype, "justification", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateAuditDto.prototype, "executiveApproval", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateAuditDto.prototype, "executiveApprovedById", void 0);
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
            const isAdminOrManager = roles.some(r => ['System Administrator', 'Audit Manager', 'CAE', 'Chief Auditor'].includes(r));
            if (!isAdminOrManager) {
                if (isAuditor) {
                    where.assignedAuditors = { some: { id: user.id } };
                }
            }
        }
        return this.prisma.audit.findMany({
            where,
            include: {
                findings: true,
                auditPrograms: {
                    include: {
                        workpaper: true
                    }
                },
                assignedManager: true,
                assignedAuditors: true,
                auditUniverse: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async exportExcel(user) {
        const audits = await this.findAll(user);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Audits');
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Audit Name', key: 'auditName', width: 40 },
            { header: 'Type', key: 'auditType', width: 25 },
            { header: 'Status', key: 'status', width: 20 },
            { header: 'Start Date', key: 'startDate', width: 20 },
            { header: 'End Date', key: 'endDate', width: 20 },
            { header: 'Risk Level', key: 'riskLevel', width: 15 },
            { header: 'Assigned Manager', key: 'manager', width: 25 },
        ];
        worksheet.getRow(1).font = { bold: true };
        audits.forEach((audit) => {
            worksheet.addRow({
                id: audit.id,
                auditName: audit.auditName,
                auditType: audit.auditType,
                status: audit.status,
                startDate: audit.startDate ? new Date(audit.startDate).toLocaleDateString() : 'N/A',
                endDate: audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'N/A',
                riskLevel: audit.riskLevel || 'N/A',
                manager: audit.assignedManager?.name || 'Unassigned',
            });
        });
        const buffer = await workbook.xlsx.writeBuffer();
        return new common_1.StreamableFile(Buffer.from(buffer));
    }
    async findAllLightweight(user) {
        const where = {
            status: { not: 'Template' }
        };
        if (user) {
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const isAuditor = roles.includes('Auditor');
            const isAdminOrManager = roles.some(r => ['System Administrator', 'Audit Manager', 'CAE', 'Chief Auditor'].includes(r));
            if (!isAdminOrManager) {
                if (isAuditor) {
                    where.assignedAuditors = { some: { id: user.id } };
                }
            }
        }
        return this.prisma.audit.findMany({
            where,
            select: {
                id: true,
                auditName: true,
                status: true,
                auditType: true
            },
            orderBy: { auditName: 'asc' }
        });
    }
    async findOne(id, user) {
        const audit = await this.prisma.audit.findUnique({
            where: { id },
            include: {
                findings: true,
                auditPrograms: {
                    include: {
                        workpaper: true
                    }
                },
                assignedManager: true,
                assignedAuditors: true,
                auditUniverse: true
            },
        });
        if (!audit) {
            throw new common_1.NotFoundException(`Audit with ID ${id} not found`);
        }
        if (user) {
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const isAuditor = roles.includes('Auditor');
            const isAdminOrManager = roles.some(r => ['System Administrator', 'Audit Manager', 'CAE', 'Chief Auditor'].includes(r));
            if (!isAdminOrManager) {
                if (isAuditor) {
                    const isAssigned = audit.assignedAuditors.some((auditor) => auditor.id === user.id);
                    if (!isAssigned) {
                        throw new common_1.ForbiddenException(`You do not have access to this audit`);
                    }
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
                riskScore: data.riskScore,
                riskLevel: data.riskLevel,
                priority: data.priority,
                quarter: data.quarter,
                year: data.year,
                resourceHours: data.resourceHours,
                budgetAllocation: data.budgetAllocation,
                justification: data.justification,
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
                                roleName: { in: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
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
        const { auditName, auditType, status, startDate, endDate, assignedManagerId, auditUniverseId, assignedAuditorIds, chiefAuditorComments, riskScore, riskLevel, priority, quarter, year, resourceHours, budgetAllocation, justification, executiveApproval, executiveApprovedById } = data;
        const updateData = {
            ...(auditName !== undefined && { auditName }),
            ...(auditType !== undefined && { auditType }),
            ...(status !== undefined && { status }),
            ...(startDate !== undefined && { startDate }),
            ...(endDate !== undefined && { endDate }),
            ...(assignedManagerId !== undefined && { assignedManagerId }),
            ...(auditUniverseId !== undefined && { auditUniverseId }),
            ...(chiefAuditorComments !== undefined && { chiefAuditorComments }),
            ...(riskScore !== undefined && { riskScore }),
            ...(riskLevel !== undefined && { riskLevel }),
            ...(priority !== undefined && { priority }),
            ...(quarter !== undefined && { quarter }),
            ...(year !== undefined && { year }),
            ...(resourceHours !== undefined && { resourceHours }),
            ...(budgetAllocation !== undefined && { budgetAllocation }),
            ...(justification !== undefined && { justification }),
            ...(executiveApproval !== undefined && { executiveApproval }),
            ...(executiveApprovedById !== undefined && { executiveApprovedById }),
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
                auditUniverse: true
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
            if (existingAudit.status === 'Under Review' && data.status === 'Finalized') {
                const openFindings = await this.prisma.finding.findMany({
                    where: {
                        auditId: id,
                        status: {
                            notIn: ['Closed']
                        }
                    }
                });
                if (openFindings.length > 0) {
                    throw new common_1.BadRequestException(`Cannot finalize audit. ${openFindings.length} finding(s) are still open. ` +
                        'All findings must be closed before the audit can be finalized.');
                }
                await this.reportsService.generatePDFToFile(updatedAudit.id);
                const chiefAuditors = await this.prisma.user.findMany({
                    where: {
                        userRoles: {
                            some: {
                                role: {
                                    roleName: { in: ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                                }
                            }
                        }
                    }
                });
                for (const chiefAuditor of chiefAuditors) {
                    await this.notificationService.create({
                        userId: chiefAuditor.id,
                        title: 'Audit Finalized - Awaiting Your Approval',
                        message: `Audit '${auditName}' has been finalized and is awaiting your approval to close.`,
                        type: 'action_required',
                        link: auditLink
                    });
                }
                if (updatedAudit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: updatedAudit.assignedManagerId,
                        title: 'Audit Finalized',
                        message: `The audit '${auditName}' has been finalized. Please preview and save the report for Chief Auditor approval.`,
                        type: 'action_required',
                        link: `/reports/audit/${updatedAudit.id}/preview`
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
        const audit = await this.findOne(id);
        if (audit.status !== 'Planned' && audit.status !== 'Rejected') {
            throw new common_1.BadRequestException(`Cannot delete audit with status '${audit.status}'. Only audits in 'Planned' or 'Rejected' status can be deleted.`);
        }
        return this.prisma.audit.delete({
            where: { id },
            include: { findings: true, auditPrograms: true },
        });
    }
    async updateChiefAuditorComments(auditId, comments) {
        await this.prisma.audit.update({
            where: { id: auditId },
            data: { chiefAuditorComments: comments }
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