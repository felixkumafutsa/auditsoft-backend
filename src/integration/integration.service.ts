import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IntegrationService {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.IntegrationCreateInput) {
    return this.prisma.integration.create({ data });
  }

  async findAll() {
    return this.prisma.integration.findMany();
  }

  async findOne(id: number) {
    const integration = await this.prisma.integration.findUnique({ where: { id } });
    if (!integration) throw new NotFoundException(`Integration #${id} not found`);
    return integration;
  }

  async update(id: number, data: Prisma.IntegrationUpdateInput) {
    await this.findOne(id);
    return this.prisma.integration.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.integration.delete({ where: { id } });
  }
}
