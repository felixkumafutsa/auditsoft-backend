import { Module } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceWorkflowService } from '../workflow/evidence.workflow';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [EvidenceController],
  providers: [EvidenceService, PrismaService, EvidenceWorkflowService],
  exports: [EvidenceService, EvidenceWorkflowService],
})
export class EvidenceModule {}
