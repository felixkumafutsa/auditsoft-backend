import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';

@Injectable()
export class ActionPlanService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateActionPlanDto) {
    return this.prisma.actionPlan.create({
      data: {
        findingId: createDto.findingId,
        description: createDto.description,
        ownerId: createDto.ownerId,
        dueDate: createDto.dueDate,
        status: createDto.status || 'Open',
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
    return this.prisma.actionPlan.update({
      where: { id },
      data: updateDto,
      include: { owner: true, finding: true },
    });
  }

  async remove(id: number) {
    return this.prisma.actionPlan.delete({
      where: { id },
    });
  }
}
