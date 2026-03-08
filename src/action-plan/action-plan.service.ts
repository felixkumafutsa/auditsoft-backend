import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { FindingService } from '../finding/finding.service';

@Injectable()
export class ActionPlanService {
  constructor(
    private prisma: PrismaService,
    private findingService: FindingService
  ) {}

  async create(createDto: CreateActionPlanDto) {
    return this.prisma.actionPlan.create({
      data: {
        findingId: createDto.findingId,
        description: createDto.description,
        ownerId: createDto.ownerId,
        // Only set dueDate if provided to avoid passing undefined into Date()
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : undefined,
        status: createDto.status || 'Open',
      },
      include: { owner: true, finding: true },
    });
  }

  async findOverdue() {
    return this.prisma.actionPlan.findMany({
      where: {
        dueDate: {
          lt: new Date(),
        },
        status: {
          notIn: ['Closed', 'Verified'],
        },
      },
      include: { owner: true, finding: true },
    });
  }

  async findAll() {
    return this.prisma.actionPlan.findMany({
      include: { owner: true, finding: true },
    });
  }

  async findOne(id: number) {
    const actionPlan = await this.prisma.actionPlan.findUnique({
      where: { id },
      include: { owner: true, finding: true },
    });

    if (!actionPlan) {
      throw new NotFoundException(`Action Plan #${id} not found`);
    }

    return actionPlan;
  }

  async update(id: number, updateDto: UpdateActionPlanDto) {
    // Get the current action plan with finding details
    const currentActionPlan = await this.findOne(id);
    
    // Update the action plan
    const updatedActionPlan = await this.prisma.actionPlan.update({
      where: { id },
      data: updateDto,
      include: { owner: true, finding: true },
    });

    // Handle automatic finding status transitions
    if (currentActionPlan.finding && updateDto.status) {
      const finding = currentActionPlan.finding;
      const oldStatus = currentActionPlan.status;
      const newStatus = updateDto.status;

      // Rule 1: When action plan status changes to "In Progress", set finding to "Remediation In Progress"
      if (oldStatus !== 'In Progress' && newStatus === 'In Progress') {
        if (finding.status === 'Action Assigned') {
          await this.findingService.autoUpdateStatus(finding.id, 'Remediation In Progress', 'Action plan marked as in progress');
          console.log(`Finding ${finding.id} automatically transitioned to 'Remediation In Progress' due to action plan ${id} status change`);
        }
      }

      // Rule 2: When action plan status changes to "Closed", set finding to "Verified"
      if (oldStatus !== 'Closed' && newStatus === 'Closed') {
        if (finding.status === 'Remediation In Progress') {
          await this.findingService.autoUpdateStatus(finding.id, 'Verified', 'Action plan completed');
          console.log(`Finding ${finding.id} automatically transitioned to 'Verified' due to action plan ${id} completion`);
        }
      }
    }

    return updatedActionPlan;
  }

  async remove(id: number) {
    return this.prisma.actionPlan.delete({
      where: { id },
    });
  }
}
