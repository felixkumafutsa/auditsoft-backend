import { Module } from '@nestjs/common';
import { ActionPlanService } from './action-plan.service';
import { ActionPlanController } from './action-plan.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FindingService } from '../finding/finding.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
import { FindingModule } from '../finding/finding.module';
import { WorkflowModule } from '../workflow/workflow.module';

@Module({
  imports: [FindingModule, WorkflowModule],
  controllers: [ActionPlanController],
  providers: [ActionPlanService, PrismaService],
})
export class ActionPlanModule {}
