import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditProgramDto } from './dto/create-audit-program.dto';
import { UpdateAuditProgramDto } from './dto/update-audit-program.dto';

@Injectable()
export class AuditProgramService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAuditProgramDto) {
    return this.prisma.auditProgram.create({
      data: {
        auditId: data.auditId,
        procedureName: data.procedureName,
        controlReference: data.controlReference,
        expectedOutcome: data.expectedOutcome,
        actualResult: data.actualResult,
      },
    });
  }

  async findAll() {
    return this.prisma.auditProgram.findMany();
  }

  async findOne(id: number) {
    const program = await this.prisma.auditProgram.findUnique({ where: { id } });
    if (!program) throw new NotFoundException(`Audit Program ${id} not found`);
    return program;
  }

  async update(id: number, data: UpdateAuditProgramDto) {
    await this.findOne(id);
    return this.prisma.auditProgram.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.auditProgram.delete({ where: { id } });
  }
}
