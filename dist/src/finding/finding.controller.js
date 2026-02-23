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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindingController = void 0;
const common_1 = require("@nestjs/common");
const finding_service_1 = require("./finding.service");
const finding_workflow_1 = require("../workflow/finding.workflow");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
let FindingController = class FindingController {
    findingService;
    workflowService;
    constructor(findingService, workflowService) {
        this.findingService = findingService;
        this.workflowService = workflowService;
    }
    getAll() {
        return this.findingService.findAll();
    }
    getCritical() {
        return this.findingService.getCriticalFindings();
    }
    getOverdue() {
        return this.findingService.getOverdueFindings();
    }
    getOne(id) {
        return this.findingService.findOne(id);
    }
    async getActionPlans(id) {
        const finding = await this.findingService.findOne(id);
        return finding.actionPlans || [];
    }
    getByAudit(auditId) {
        return this.findingService.findByAudit(auditId);
    }
    create(body, req) {
        return this.findingService.create(body, req.user);
    }
    update(id, body) {
        return this.findingService.update(id, body);
    }
    delete(id) {
        return this.findingService.delete(id);
    }
    async assignAction(id, body, req) {
        const finding = await this.findingService.findOne(id);
        const updatedFinding = await this.findingService.transitionStatus(id, 'Action Assigned', 'Chief Auditor', body.comment);
        return {
            success: true,
            message: 'Finding status changed to Action Assigned',
            finding: updatedFinding,
            redirectTo: {
                path: `/action-plans/create?findingId=${id}`,
                message: 'Please create an action plan for this finding'
            }
        };
    }
    async transitionStatus(id, body) {
        return this.findingService.transitionStatus(id, body.toStatus, body.userRole, body.comment);
    }
    getAllowedTransitions(id) {
        return this.findingService.findOne(id).then((finding) => ({
            currentStatus: finding.status,
            allowedTransitions: this.workflowService.getAllowedTransitions(finding.status),
        }));
    }
    async escalate(id, body) {
        const finding = await this.findingService.findOne(id);
        if (!this.workflowService.requiresEscalation(finding.severity)) {
            throw new common_1.BadRequestException(`Finding with severity ${finding.severity} does not require escalation`);
        }
        return {
            findingId: id,
            escalatedTo: body.escalatedTo,
            reason: body.reason,
            timestamp: new Date(),
            status: 'Escalated',
        };
    }
};
exports.FindingController = FindingController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('critical'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "getCritical", null);
__decorate([
    (0, common_1.Get)('overdue'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "getOverdue", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "getOne", null);
__decorate([
    (0, common_1.Get)(':id/action-plans'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], FindingController.prototype, "getActionPlans", null);
__decorate([
    (0, common_1.Get)('audit/:auditId'),
    __param(0, (0, common_1.Param)('auditId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "getByAudit", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [finding_service_1.CreateFindingDto, Object]),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, finding_service_1.UpdateFindingDto]),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/assign-action'),
    (0, roles_decorator_1.Roles)('Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], FindingController.prototype, "assignAction", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FindingController.prototype, "transitionStatus", null);
__decorate([
    (0, common_1.Get)(':id/allowed-transitions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FindingController.prototype, "getAllowedTransitions", null);
__decorate([
    (0, common_1.Post)(':id/escalate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], FindingController.prototype, "escalate", null);
exports.FindingController = FindingController = __decorate([
    (0, common_1.Controller)('findings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [finding_service_1.FindingService,
        finding_workflow_1.FindingWorkflowService])
], FindingController);
//# sourceMappingURL=finding.controller.js.map