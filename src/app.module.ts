import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { FindingModule } from './finding/finding.module';
import { AuditProgramModule } from './audit-program/audit-program.module';
import { ActionPlanModule } from './action-plan/action-plan.module';
import { EvidenceModule } from './evidence/evidence.module';
import { NotificationModule } from './notification/notification.module';
import { MessagingModule } from './messaging/messaging.module';
import { ComplianceModule } from './compliance/compliance.module';
import { RiskModule } from './risk/risk.module';
import { ReportsModule } from './reports/reports.module';
import { AuditUniverseModule } from './audit-universe/audit-universe.module';
import { IntegrationModule } from './integration/integration.module';
import { ContinuousAuditModule } from './continuous-audit/continuous-audit.module';
import { WorkflowModule } from './workflow/workflow.module';
import { WorkpaperModule } from './workpaper/workpaper.module';
import { UploadModule } from './upload/upload.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SwaggerModule,
    AuditModule,
    AuditProgramModule,
    EvidenceModule,
    FindingModule,
    ActionPlanModule,
    ComplianceModule,
    RiskModule,
    ReportsModule,
    AuditUniverseModule,
    IntegrationModule,
    ContinuousAuditModule,
    WorkflowModule,
    WorkpaperModule,
    UploadModule,
    UserModule,
    RoleModule,
    AuthModule,
    AdminModule,
    AuditLogModule,
    NotificationModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
