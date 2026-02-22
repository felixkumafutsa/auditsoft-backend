import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditWorkflowController } from './audit-workflow.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWorkflowService } from '../workflow/audit.workflow';
import { AuditTimelineService } from './audit-timeline.service';
import { AuditRiskService } from './audit-risk.service';
import { AuditApprovalService } from './audit-approval.service';
import { AuditCommentsService } from './audit-comments.service';
import { BulkAuditService } from './bulk-audit.service';
import { NotificationModule } from '../notification/notification.module';
import { ReportsModule } from '../reports/reports.module';
import { TimesheetService } from './timesheet.service';
import { TimesheetController } from './timesheet.controller';

@Module({
  imports: [NotificationModule, ReportsModule],
  controllers: [AuditController, AuditWorkflowController, TimesheetController],
  providers: [
    AuditService,
    PrismaService,
    AuditWorkflowService,
    AuditTimelineService,
    AuditRiskService,
    AuditApprovalService,
    AuditCommentsService,
    BulkAuditService,
    TimesheetService,
  ],
  exports: [AuditService, TimesheetService],
})
export class AuditModule { }
