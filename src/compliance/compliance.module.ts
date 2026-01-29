import { Module } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceController } from './compliance.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ComplianceController],
  providers: [ComplianceService, PrismaService],
  exports: [ComplianceService],
})
export class ComplianceModule {}
