import { Module } from '@nestjs/common';
import { AuditPlanController } from './audit-plan.controller';
import { AuditPlanService } from './audit-plan.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AuditPlanController],
  providers: [AuditPlanService, PrismaService],
  exports: [AuditPlanService],
})
export class AuditPlanModule {}
