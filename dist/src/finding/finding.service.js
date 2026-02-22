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
exports.FindingService = exports.UpdateFindingDto = exports.CreateFindingDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const finding_workflow_1 = require("../workflow/finding.workflow");
const audit_service_1 = require("../audit/audit.service");
const notification_service_1 = require("../notification/notification.service");
const class_validator_1 = require("class-validator");
class CreateFindingDto {
    auditId;
    auditProgramId;
    description;
    severity;
    rootCause;
    status;
}
exports.CreateFindingDto = CreateFindingDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateFindingDto.prototype, "auditId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateFindingDto.prototype, "auditProgramId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFindingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateFindingDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFindingDto.prototype, "rootCause", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateFindingDto.prototype, "status", void 0);
class UpdateFindingDto {
    description;
    severity;
    rootCause;
    status;
}
exports.UpdateFindingDto = UpdateFindingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFindingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFindingDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFindingDto.prototype, "rootCause", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateFindingDto.prototype, "status", void 0);
let FindingService = class FindingService {
    prisma;
    workflowService;
    auditService;
    notificationService;
    constructor(prisma, workflowService, auditService, notificationService) {
        this.prisma = prisma;
        this.workflowService = workflowService;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }
    async findAll() {
        return this.prisma.finding.findMany({
            include: {
                auditProgram: true,
                actionPlans: true,
                audit: true
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const finding = await this.prisma.finding.findUnique({
            where: { id },
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
        });
        if (!finding) {
            throw new common_1.NotFoundException(`Finding with ID ${id} not found`);
        }
        return finding;
    }
    async findByAudit(auditId) {
        return this.prisma.finding.findMany({
            where: { auditId },
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
            orderBy: { severity: 'desc' },
        });
    }
    async create(data, user) {
        if (!data.auditId || !data.description || !data.severity) {
            throw new common_1.BadRequestException('auditId, description, and severity are required');
        }
        const audit = await this.auditService.findOne(data.auditId, user);
        if (audit.status !== 'In Progress') {
            throw new common_1.BadRequestException(`Findings can only be created for audits that are 'In Progress'. Current status: ${audit.status}`);
        }
        const createData = {
            auditId: data.auditId,
            description: data.description,
            severity: data.severity,
            status: data.status || 'Identified',
        };
        if (data.auditProgramId !== undefined) {
            createData.auditProgramId = data.auditProgramId;
        }
        if (data.rootCause !== undefined) {
            createData.rootCause = data.rootCause;
        }
        return this.prisma.finding.create({
            data: createData,
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
        });
    }
    async update(id, data) {
        const finding = await this.findOne(id);
        return this.prisma.finding.update({
            where: { id },
            data: {
                ...(data.description && { description: data.description }),
                ...(data.severity && { severity: data.severity }),
                ...(data.rootCause && { rootCause: data.rootCause }),
                ...(data.status && { status: data.status }),
            },
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
        });
    }
    async transitionStatus(id, toStatus, userRole, chiefAuditorComment) {
        const finding = await this.findOne(id);
        const currentStatus = finding.status;
        const normalizedToStatus = toStatus.trim();
        const normalizedUserRole = userRole?.trim();
        if (!finding.auditId) {
            throw new common_1.BadRequestException('Finding must be associated with an audit to change status.');
        }
        const audit = await this.auditService.findOne(finding.auditId);
        const allowedAuditStatuses = ['In Progress', 'Under Review', 'Finalized'];
        if (!allowedAuditStatuses.includes(audit.status)) {
            throw new common_1.BadRequestException(`Finding status cannot be changed when audit is in '${audit.status}' status.`);
        }
        if (!this.workflowService.canTransition(currentStatus, normalizedToStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${normalizedToStatus}`);
        }
        if (normalizedUserRole) {
            const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, normalizedToStatus);
            if (!permittedRoles.includes(normalizedUserRole)) {
                throw new common_1.BadRequestException(`Role ${normalizedUserRole} is not permitted to transition from ${currentStatus} to ${normalizedToStatus}`);
            }
        }
        if (this.workflowService.requiresChiefAuditorComment(currentStatus, normalizedToStatus) && !chiefAuditorComment) {
            throw new common_1.BadRequestException(`Chief Auditor comment is required for transitioning from ${currentStatus} to ${normalizedToStatus}`);
        }
        const updatedFinding = await this.update(id, { status: normalizedToStatus });
        try {
            if (!updatedFinding.auditId) {
                return updatedFinding;
            }
            const link = `/audits/${updatedFinding.auditId}`;
            const findingDesc = updatedFinding.description.substring(0, 50);
            if (currentStatus === 'Identified' && normalizedToStatus === 'Validated') {
                const chiefAuditors = await this.prisma.user.findMany({
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
                for (const chiefAuditor of chiefAuditors) {
                    await this.notificationService.create({
                        userId: chiefAuditor.id,
                        title: 'Finding Validated',
                        message: `Finding "${findingDesc}..." in audit '${audit.auditName}' has been validated by the manager.`,
                        type: 'info',
                        link
                    });
                }
            }
            if (currentStatus === 'Validated' && normalizedToStatus === 'Action Assigned') {
                for (const auditor of audit.assignedAuditors || []) {
                    await this.notificationService.create({
                        userId: auditor.id,
                        title: 'Action Assigned to Finding',
                        message: `An action plan has been assigned for finding "${findingDesc}..." in '${audit.auditName}'.`,
                        type: 'info',
                        link
                    });
                }
            }
            if (currentStatus === 'Remediation In Progress' && normalizedToStatus === 'Verified') {
                if (audit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: audit.assignedManagerId,
                        title: 'Finding Verified by Chief Auditor',
                        message: `Finding "${findingDesc}..." has been verified by Chief Auditor. Feedback: ${chiefAuditorComment || 'No comment'}`,
                        type: 'success',
                        link
                    });
                }
                for (const auditor of audit.assignedAuditors || []) {
                    await this.notificationService.create({
                        userId: auditor.id,
                        title: 'Finding Verified by Chief Auditor',
                        message: `Finding "${findingDesc}..." has been verified. Chief Auditor Feedback: ${chiefAuditorComment || 'No comment'}`,
                        type: 'info',
                        link
                    });
                }
            }
            if (currentStatus === 'Verified' && normalizedToStatus === 'Closed') {
                if (audit.assignedManagerId) {
                    await this.notificationService.create({
                        userId: audit.assignedManagerId,
                        title: 'Finding Closed by Chief Auditor',
                        message: `Finding "${findingDesc}..." has been closed by Chief Auditor. Feedback: ${chiefAuditorComment || 'No comment'}`,
                        type: 'success',
                        link
                    });
                }
                for (const auditor of audit.assignedAuditors || []) {
                    await this.notificationService.create({
                        userId: auditor.id,
                        title: 'Finding Closed by Chief Auditor',
                        message: `Finding "${findingDesc}..." has been officially closed. Chief Auditor Feedback: ${chiefAuditorComment || 'No comment'}`,
                        type: 'info',
                        link
                    });
                }
            }
        }
        catch (e) {
            console.error('Failed to send finding notification', e);
        }
        return updatedFinding;
    }
    async delete(id) {
        const finding = await this.findOne(id);
        return this.prisma.finding.delete({
            where: { id },
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
        });
    }
    async getCriticalFindings() {
        return this.prisma.finding.findMany({
            where: {
                severity: 'Critical',
                status: { not: 'Closed' },
            },
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getOverdueFindings() {
        const now = new Date();
        return this.prisma.finding.findMany({
            where: {
                status: { not: 'Closed' },
                actionPlans: {
                    some: {
                        dueDate: {
                            lt: now,
                        },
                        status: { not: 'Closed' },
                    },
                },
            },
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
            },
        });
    }
    async updateStatus(id, newStatus, userRole, chiefAuditorComment) {
        const finding = await this.findOne(id);
        if (!this.workflowService.canTransition(finding.status, newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${finding.status} to ${newStatus}`);
        }
        if (userRole) {
            const permittedRoles = this.workflowService.getPermittedRoles(finding.status, newStatus);
            if (!permittedRoles.includes(userRole)) {
                throw new common_1.BadRequestException(`Role ${userRole} is not permitted to transition from ${finding.status} to ${newStatus}`);
            }
        }
        if (this.workflowService.requiresChiefAuditorComment(finding.status, newStatus) && !chiefAuditorComment) {
            throw new common_1.BadRequestException(`Chief Auditor comment is required for transitioning from ${finding.status} to ${newStatus}`);
        }
        const updatedFinding = await this.update(id, { status: newStatus });
        await this.sendStatusChangeNotifications(updatedFinding, finding.status, newStatus, chiefAuditorComment);
        return updatedFinding;
    }
    async sendStatusChangeNotifications(finding, oldStatus, newStatus, chiefAuditorComment) {
        try {
            if (!finding.auditId)
                return;
            const link = `/audits/${finding.auditId}`;
            const findingDesc = finding.description.substring(0, 50);
            if (oldStatus === 'Validated' && newStatus === 'Action Assigned') {
                const processOwners = await this.prisma.user.findMany({
                    where: {
                        userRoles: {
                            some: {
                                role: {
                                    roleName: { in: ['Process Owner'] }
                                }
                            }
                        }
                    }
                });
                for (const processOwner of processOwners) {
                    await this.notificationService.create({
                        userId: processOwner.id,
                        title: 'Action Plan Assigned',
                        message: `Action plan has been assigned for finding "${findingDesc}..." in audit #${finding.auditId}`,
                        type: 'info',
                        link
                    });
                }
            }
            if (oldStatus === 'Action Assigned' && newStatus === 'Remediation In Progress') {
                const chiefAuditors = await this.prisma.user.findMany({
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
                for (const chiefAuditor of chiefAuditors) {
                    await this.notificationService.create({
                        userId: chiefAuditor.id,
                        title: 'Remediation Started',
                        message: `Remediation has started for finding "${findingDesc}..." in audit #${finding.auditId}`,
                        type: 'info',
                        link
                    });
                }
            }
        }
        catch (e) {
            console.error('Failed to send finding notification', e);
        }
    }
};
exports.FindingService = FindingService;
exports.FindingService = FindingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        finding_workflow_1.FindingWorkflowService,
        audit_service_1.AuditService,
        notification_service_1.NotificationService])
], FindingService);
//# sourceMappingURL=finding.service.js.map