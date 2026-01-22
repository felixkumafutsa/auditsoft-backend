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
let AuditController = class AuditController {
    auditService;
    workflowService;
    constructor(auditService, workflowService) {
        this.auditService = auditService;
        this.workflowService = workflowService;
    }
    getAll() {
        return this.auditService.findAll();
    }
    getOne(id) {
        return this.auditService.findOne(id);
    }
    create(body) {
        return this.auditService.create(body);
    }
    update(id, body) {
        return this.auditService.update(id, body);
    }
    delete(id) {
        return this.auditService.delete(id);
    }
    async transitionStatus(id, body) {
        const audit = await this.auditService.findOne(id);
        const currentStatus = audit.status;
        if (!this.workflowService.canTransition(currentStatus, body.toStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${body.toStatus}`);
        }
        const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, body.toStatus);
        if (body.userRole && !permittedRoles.includes(body.userRole)) {
            throw new common_1.BadRequestException(`Role ${body.userRole} is not permitted to transition from ${currentStatus} to ${body.toStatus}`);
        }
        return this.auditService.update(id, { status: body.toStatus });
    }
    getAllowedTransitions(id) {
        return this.auditService.findOne(id).then(audit => ({
            currentStatus: audit.status,
            allowedTransitions: this.workflowService.getAllowedTransitions(audit.status),
        }));
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, audit_service_1.UpdateAuditDto]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/transition'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "transitionStatus", null);
__decorate([
    (0, common_1.Get)(':id/allowed-transitions'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getAllowedTransitions", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audits'),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        audit_workflow_1.AuditWorkflowService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map