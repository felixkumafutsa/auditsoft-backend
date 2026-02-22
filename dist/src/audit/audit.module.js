"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditModule = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const audit_controller_1 = require("./audit.controller");
const audit_workflow_controller_1 = require("./audit-workflow.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_workflow_1 = require("../workflow/audit.workflow");
const audit_timeline_service_1 = require("./audit-timeline.service");
const audit_risk_service_1 = require("./audit-risk.service");
const audit_approval_service_1 = require("./audit-approval.service");
const audit_comments_service_1 = require("./audit-comments.service");
const bulk_audit_service_1 = require("./bulk-audit.service");
const notification_module_1 = require("../notification/notification.module");
const reports_module_1 = require("../reports/reports.module");
const timesheet_service_1 = require("./timesheet.service");
const timesheet_controller_1 = require("./timesheet.controller");
let AuditModule = class AuditModule {
};
exports.AuditModule = AuditModule;
exports.AuditModule = AuditModule = __decorate([
    (0, common_1.Module)({
        imports: [notification_module_1.NotificationModule, reports_module_1.ReportsModule],
        controllers: [audit_controller_1.AuditController, audit_workflow_controller_1.AuditWorkflowController, timesheet_controller_1.TimesheetController],
        providers: [
            audit_service_1.AuditService,
            prisma_service_1.PrismaService,
            audit_workflow_1.AuditWorkflowService,
            audit_timeline_service_1.AuditTimelineService,
            audit_risk_service_1.AuditRiskService,
            audit_approval_service_1.AuditApprovalService,
            audit_comments_service_1.AuditCommentsService,
            bulk_audit_service_1.BulkAuditService,
            timesheet_service_1.TimesheetService,
        ],
        exports: [audit_service_1.AuditService, timesheet_service_1.TimesheetService],
    })
], AuditModule);
//# sourceMappingURL=audit.module.js.map