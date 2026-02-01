import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Running automated control tests...');
    // Fetch active automated controls
    // Run tests
    // Log results
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueItems() {
    this.logger.debug('Checking for overdue findings and audits...');
    // Logic to find overdue items and send notifications
  }
}
