import { Module } from '@nestjs/common';
import { AuditUniverseService } from './audit-universe.service';
import { AuditUniverseController } from './audit-universe.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AuditUniverseController],
  providers: [AuditUniverseService, PrismaService],
})
export class AuditUniverseModule {}
