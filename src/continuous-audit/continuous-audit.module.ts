import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { ContinuousAuditController } from './continuous-audit.controller';
import { ContinuousAuditService } from './continuous-audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [ScheduleModule.forRoot(), NotificationModule],
  controllers: [ContinuousAuditController],
  providers: [SchedulerService, ContinuousAuditService, PrismaService],
  exports: [SchedulerService],
})
export class ContinuousAuditModule {}
