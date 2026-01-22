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
class CreateFindingDto {
    auditId;
    auditProgramId;
    description;
    severity;
    rootCause;
    status;
}
exports.CreateFindingDto = CreateFindingDto;
class UpdateFindingDto {
    description;
    severity;
    rootCause;
    status;
}
exports.UpdateFindingDto = UpdateFindingDto;
let FindingService = class FindingService {
    prisma;
    workflowService;
    constructor(prisma, workflowService) {
        this.prisma = prisma;
        this.workflowService = workflowService;
    }
    async findAll() {
        return this.prisma.finding.findMany({
            include: {
                audit: true,
                auditProgram: true,
                actionPlans: true,
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
    async create(data) {
        if (!data.auditId || !data.description || !data.severity) {
            throw new common_1.BadRequestException('auditId, description, and severity are required');
        }
        return this.prisma.finding.create({
            data: {
                auditId: data.auditId,
                auditProgramId: data.auditProgramId,
                description: data.description,
                severity: data.severity,
                rootCause: data.rootCause,
                status: data.status || 'Identified',
            },
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
    async transitionStatus(id, toStatus, userRole) {
        const finding = await this.findOne(id);
        const currentStatus = finding.status;
        if (!this.workflowService.canTransition(currentStatus, toStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${toStatus}`);
        }
        if (userRole) {
            const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, toStatus);
            if (!permittedRoles.includes(userRole)) {
                throw new common_1.BadRequestException(`Role ${userRole} is not permitted to transition from ${currentStatus} to ${toStatus}`);
            }
        }
        return this.update(id, { status: toStatus });
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
};
exports.FindingService = FindingService;
exports.FindingService = FindingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        finding_workflow_1.FindingWorkflowService])
], FindingService);
//# sourceMappingURL=finding.service.js.map