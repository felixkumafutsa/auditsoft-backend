import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SchedulerService } from './scheduler.service';

@Injectable()
export class ContinuousAuditService {
  constructor(
    private prisma: PrismaService,
    private scheduler: SchedulerService
  ) {}

  async createControl(data: any) {
    return this.prisma.automatedControl.create({ data });
  }

  async findAllControls() {
    return this.prisma.automatedControl.findMany({
      include: { controlRuns: { orderBy: { runDate: 'desc' }, take: 1 } }
    });
  }

  async getControlRuns(controlId: number) {
    return this.prisma.controlRun.findMany({
      where: { automatedControlId: controlId },
      orderBy: { runDate: 'desc' }
    });
  }

  async runControl(controlId: number) {
    // Logic to manually trigger a run
    // For now, just logging it
    console.log(`Manually running control #${controlId}`);
    return { message: 'Control run initiated' };
  }
}
