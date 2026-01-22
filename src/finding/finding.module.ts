import { Module } from '@nestjs/common';
import { FindingService } from './finding.service';
import { FindingController } from './finding.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';

@Module({
  controllers: [FindingController],
  providers: [FindingService, PrismaService, FindingWorkflowService],
  exports: [FindingService],
})
export class FindingModule {}
