import { Module } from '@nestjs/common';
import { AuditWorkflowService } from './audit.workflow';
import { FindingWorkflowService } from './finding.workflow';
import { WorkflowController } from './workflow.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [WorkflowController],
  providers: [AuditWorkflowService, FindingWorkflowService],
  exports: [AuditWorkflowService, FindingWorkflowService],
})
export class WorkflowModule {}
