import { Module } from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { EvidenceController } from './evidence.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceService, PrismaService],
  exports: [EvidenceService],
})
export class EvidenceModule {}
