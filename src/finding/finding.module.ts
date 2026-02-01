import { Module } from '@nestjs/common';
import { FindingService } from './finding.service';
import { FindingController } from './finding.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
import { AuditModule } from '../audit/audit.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [AuditModule, NotificationModule],
  controllers: [FindingController],
  providers: [FindingService, PrismaService, FindingWorkflowService],
  exports: [FindingService],
})
export class FindingModule {}
