import { Module } from '@nestjs/common';
import { AuditLogController } from './audit-log.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [AuditLogController],
  providers: [PrismaService],
})
export class AuditLogModule {}