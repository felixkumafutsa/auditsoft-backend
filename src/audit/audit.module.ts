import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditWorkflowService } from '../workflow/audit.workflow';

@Module({
  controllers: [AuditController],
  providers: [AuditService, PrismaService, AuditWorkflowService],
})
export class AuditModule {}
