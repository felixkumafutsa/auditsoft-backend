import { Module } from '@nestjs/common';
import { AuditProgramService } from './audit-program.service';
import { AuditProgramController } from './audit-program.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceModule } from '../evidence/evidence.module';

@Module({
  imports: [EvidenceModule],
  controllers: [AuditProgramController],
  providers: [AuditProgramService, PrismaService],
  exports: [AuditProgramService],
})
export class AuditProgramModule {}
