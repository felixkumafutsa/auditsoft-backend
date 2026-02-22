"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const audit_module_1 = require("./audit/audit.module");
const user_module_1 = require("./user/user.module");
const role_module_1 = require("./role/role.module");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const finding_module_1 = require("./finding/finding.module");
const audit_program_module_1 = require("./audit-program/audit-program.module");
const action_plan_module_1 = require("./action-plan/action-plan.module");
const evidence_module_1 = require("./evidence/evidence.module");
const notification_module_1 = require("./notification/notification.module");
const messaging_module_1 = require("./messaging/messaging.module");
const compliance_module_1 = require("./compliance/compliance.module");
const risk_module_1 = require("./risk/risk.module");
const reports_module_1 = require("./reports/reports.module");
const audit_universe_module_1 = require("./audit-universe/audit-universe.module");
const integration_module_1 = require("./integration/integration.module");
const continuous_audit_module_1 = require("./continuous-audit/continuous-audit.module");
const workflow_module_1 = require("./workflow/workflow.module");
const workpaper_module_1 = require("./workpaper/workpaper.module");
const upload_module_1 = require("./upload/upload.module");
const prisma_service_1 = require("../prisma/prisma.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            swagger_1.SwaggerModule,
            audit_module_1.AuditModule,
            audit_program_module_1.AuditProgramModule,
            evidence_module_1.EvidenceModule,
            finding_module_1.FindingModule,
            action_plan_module_1.ActionPlanModule,
            compliance_module_1.ComplianceModule,
            risk_module_1.RiskModule,
            reports_module_1.ReportsModule,
            audit_universe_module_1.AuditUniverseModule,
            integration_module_1.IntegrationModule,
            continuous_audit_module_1.ContinuousAuditModule,
            workflow_module_1.WorkflowModule,
            workpaper_module_1.WorkpaperModule,
            upload_module_1.UploadModule,
            user_module_1.UserModule,
            role_module_1.RoleModule,
            auth_module_1.AuthModule,
            admin_module_1.AdminModule,
            audit_log_module_1.AuditLogModule,
            notification_module_1.NotificationModule,
            messaging_module_1.MessagingModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService, prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map