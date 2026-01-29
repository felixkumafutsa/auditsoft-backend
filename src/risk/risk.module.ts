import { Module } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [RiskController],
  providers: [RiskService, PrismaService],
})
export class RiskModule {}
