import { Module } from '@nestjs/common';
import { AuditWorkflowService } from './audit.workflow';
import { WorkflowController } from './workflow.controller';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [WorkflowController],
  providers: [AuditWorkflowService],
  exports: [AuditWorkflowService],
})
export class WorkflowModule {}
