import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

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
    await this.checkOverdueAudits();
    await this.checkOverdueActionPlans();
    await this.checkUpcomingDueDates();
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyReminders() {
    this.logger.debug('Sending daily due date reminders...');
    await this.checkUpcomingDueDates(7); // 7 days in advance
  }

  private async checkOverdueAudits() {
    try {
      const now = new Date();
      const overdueAudits = await this.prisma.audit.findMany({
        where: {
          endDate: {
            lt: now,
          },
          status: {
            notIn: ['Completed', 'Cancelled'],
          },
        },
        include: {
          assignedManager: true,
          assignedAuditors: true,
        },
      });

      for (const audit of overdueAudits) {
        // Notify assigned manager
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Overdue Audit Alert',
            message: `Audit "${audit.auditName}" is overdue. End date was ${audit.endDate?.toDateString()}. Please take immediate action.`,
            type: 'urgent',
            link: `/audits/${audit.id}`,
          });
        }

        // Notify assigned auditors
        if (audit.assignedAuditors) {
          for (const auditor of audit.assignedAuditors) {
            await this.notificationService.create({
              userId: auditor.id,
              title: 'Overdue Audit Alert',
              message: `Audit "${audit.auditName}" is overdue. End date was ${audit.endDate?.toDateString()}. Please take immediate action.`,
              type: 'urgent',
              link: `/audits/${audit.id}`,
            });
          }
        }
      }

      this.logger.log(`Processed ${overdueAudits.length} overdue audits`);
    } catch (error) {
      this.logger.error('Error checking overdue audits:', error);
    }
  }

  private async checkOverdueActionPlans() {
    try {
      const now = new Date();
      const overduePlans = await this.prisma.actionPlan.findMany({
        where: {
          dueDate: {
            lt: now,
          },
          status: {
            notIn: ['Closed', 'Completed'],
          },
        },
        include: {
          owner: true,
          finding: {
            include: {
              audit: {
                select: {
                  auditName: true,
                  assignedManagerId: true,
                },
              },
            },
          },
        },
      });

      for (const plan of overduePlans) {
        // Notify action plan owner
        if (plan.ownerId) {
          await this.notificationService.create({
            userId: plan.ownerId,
            title: 'Overdue Action Plan Alert',
            message: `Action plan for finding "${plan.finding?.description || 'N/A'}" is overdue. Due date was ${plan.dueDate?.toDateString()}. Please take immediate action.`,
            type: 'urgent',
            link: `/findings/${plan.findingId}`,
          });
        }

        // Notify audit manager
        const auditManagerId = plan.finding?.audit?.assignedManagerId;
        if (auditManagerId && auditManagerId !== plan.ownerId) {
          await this.notificationService.create({
            userId: auditManagerId,
            title: 'Overdue Action Plan - Team Alert',
            message: `Action plan assigned to ${plan.owner?.name || 'Unknown'} for finding "${plan.finding?.description || 'N/A'}" is overdue. Due date was ${plan.dueDate?.toDateString()}.`,
            type: 'urgent',
            link: `/findings/${plan.findingId}`,
          });
        }
      }

      this.logger.log(`Processed ${overduePlans.length} overdue action plans`);
    } catch (error) {
      this.logger.error('Error checking overdue action plans:', error);
    }
  }

  private async checkUpcomingDueDates(daysAhead = 7) {
    try {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + daysAhead);

      // Check upcoming audit due dates
      const upcomingAudits = await this.prisma.audit.findMany({
        where: {
          endDate: {
            gte: now,
            lte: futureDate,
          },
          status: {
            notIn: ['Completed', 'Cancelled'],
          },
        },
        include: {
          assignedManager: true,
          assignedAuditors: true,
        },
      });

      for (const audit of upcomingAudits) {
        const daysUntilDue = Math.ceil((audit.endDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Notify assigned manager
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Upcoming Audit Due Date',
            message: `Audit "${audit.auditName}" is due in ${daysUntilDue} days (${audit.endDate?.toDateString()}). Please ensure timely completion.`,
            type: daysUntilDue <= 3 ? 'warning' : 'info',
            link: `/audits/${audit.id}`,
          });
        }

        // Notify assigned auditors
        if (audit.assignedAuditors) {
          for (const auditor of audit.assignedAuditors) {
            await this.notificationService.create({
              userId: auditor.id,
              title: 'Upcoming Audit Due Date',
              message: `Audit "${audit.auditName}" is due in ${daysUntilDue} days (${audit.endDate?.toDateString()}). Please ensure timely completion.`,
              type: daysUntilDue <= 3 ? 'warning' : 'info',
              link: `/audits/${audit.id}`,
            });
          }
        }
      }

      // Check upcoming action plan due dates
      const upcomingPlans = await this.prisma.actionPlan.findMany({
        where: {
          dueDate: {
            gte: now,
            lte: futureDate,
          },
          status: {
            notIn: ['Closed', 'Completed'],
          },
        },
        include: {
          owner: true,
          finding: {
            include: {
              audit: {
                select: {
                  auditName: true,
                  assignedManagerId: true,
                },
              },
            },
          },
        },
      });

      for (const plan of upcomingPlans) {
        const daysUntilDue = Math.ceil((plan.dueDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        // Notify action plan owner
        if (plan.ownerId) {
          await this.notificationService.create({
            userId: plan.ownerId,
            title: 'Upcoming Action Plan Due Date',
            message: `Action plan for finding "${plan.finding?.description || 'N/A'}" is due in ${daysUntilDue} days (${plan.dueDate?.toDateString()}). Please ensure timely completion.`,
            type: daysUntilDue <= 3 ? 'warning' : 'info',
            link: `/findings/${plan.findingId}`,
          });
        }

        // Notify audit manager for critical items (3 days or less)
        const auditManagerId = plan.finding?.audit?.assignedManagerId;
        if (auditManagerId && auditManagerId !== plan.ownerId && daysUntilDue <= 3) {
          await this.notificationService.create({
            userId: auditManagerId,
            title: 'Action Plan Due Soon - Team Alert',
            message: `Action plan assigned to ${plan.owner?.name || 'Unknown'} for finding "${plan.finding?.description || 'N/A'}" is due in ${daysUntilDue} days (${plan.dueDate?.toDateString()}).`,
            type: 'warning',
            link: `/findings/${plan.findingId}`,
          });
        }
      }

      this.logger.log(`Processed ${upcomingAudits.length} upcoming audits and ${upcomingPlans.length} upcoming action plans`);
    } catch (error) {
      this.logger.error('Error checking upcoming due dates:', error);
    }
  }
}
