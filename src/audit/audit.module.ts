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

@Module({
  controllers: [AuditController, AuditWorkflowController],
  providers: [
    AuditService,
    PrismaService,
    AuditWorkflowService,
    AuditTimelineService,
    AuditRiskService,
    AuditApprovalService,
    AuditCommentsService,
    BulkAuditService,
  ],
})
export class AuditModule {}
