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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const audit_workflow_1 = require("../workflow/audit.workflow");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
let AuditController = class AuditController {
    auditService;
    workflowService;
    constructor(auditService, workflowService) {
        this.auditService = auditService;
        this.workflowService = workflowService;
    }
    getAll(req) {
        return this.auditService.findAll(req.user);
    }
    getForOwner(req) {
        const userId = req.user?.userId ?? req.user?.id;
        return this.auditService.findForOwner(Number(userId));
    }
    getTemplates() {
        return this.auditService.findTemplates();
    }
    getOne(id, req) {
        return this.auditService.findOne(id, req.user);
    }
    create(body) {
        return this.auditService.create(body);
    }
    update(id, body, req) {
        if (body.status === 'Approved') {
            const user = req.user;
            const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
            const isChiefAuditor = roles.includes('Chief Auditor');
            if (!isChiefAuditor) {
                throw new common_1.ForbiddenException('Only Chief Auditor can approve audits.');
            }
        }
        return this.auditService.update(id, body);
    }
    async assignAuditors(id, body) {
        const audit = await this.auditService.findOne(id);
        if (audit.status !== 'Approved') {
            throw new common_1.BadRequestException('Auditors can only be assigned after the audit plan is Approved.');
        }
        return this.auditService.update(id, { assignedAuditorIds: body.auditorIds });
    }
    delete(id) {
        return this.auditService.delete(id);
    }
    async getPrograms(id) {
        const audit = await this.auditService.findOne(id);
        return audit.auditPrograms || [];
    }
    async getFindings(id) {
        const audit = await this.auditService.findOne(id);
        return audit.findings || [];
    }
    async transitionStatus(id, body, req) {
        const audit = await this.auditService.findOne(id);
        const currentStatus = audit.status;
        const normalizedToStatus = body.toStatus.trim();
        const normalizedUserRole = body.userRole?.trim();
        if (!this.workflowService.canTransition(currentStatus, normalizedToStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${normalizedToStatus}`);
        }
        const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, normalizedToStatus);
        if (normalizedUserRole && !permittedRoles.includes(normalizedUserRole)) {
            throw new common_1.BadRequestException(`Role ${normalizedUserRole} is not permitted to transition from ${currentStatus} to ${normalizedToStatus}`);
        }
        return this.auditService.update(id, { status: normalizedToStatus }, req.user);
    }
    getAllowedTransitions(id) {
        return this.auditService.findOne(id).then((audit) => ({
            currentStatus: audit.status,
            allowedTransitions: this.workflowService.getAllowedTransitions(audit.status),
        }));
    }
    async saveChiefAuditorComments(id, commentsDto) {
        await this.auditService.updateChiefAuditorComments(id, commentsDto.comments);
        return { message: 'Chief Auditor comments saved successfully' };
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('owner'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getForOwner", null);
__decorate([
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [audit_service_1.CreateAuditDto]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, audit_service_1.UpdateAuditDto, Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, roles_decorator_1.Roles)('Audit Manager', 'System Administrator'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "assignAuditors", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/programs'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getPrograms", null);
__decorate([
    (0, common_1.Get)(':id/findings'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getFindings", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "transitionStatus", null);
__decorate([
    (0, common_1.Get)(':id/allowed-transitions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getAllowedTransitions", null);
__decorate([
    (0, common_1.Post)(':id/chief-auditor-comments'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "saveChiefAuditorComments", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audits'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        audit_workflow_1.AuditWorkflowService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map