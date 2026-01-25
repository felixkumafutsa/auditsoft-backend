import { Module } from '@nestjs/common';
import { ActionPlanService } from './action-plan.service';
import { ActionPlanController } from './action-plan.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ActionPlanController],
  providers: [ActionPlanService, PrismaService],
})
export class ActionPlanModule {}
