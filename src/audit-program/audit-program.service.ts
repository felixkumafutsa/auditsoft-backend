import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditProgramDto } from './dto/create-audit-program.dto';
import { UpdateAuditProgramDto } from './dto/update-audit-program.dto';

@Injectable()
export class AuditProgramService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAuditProgramDto) {
    const createData: any = {
      auditId: data.auditId,
      procedureName: data.procedureName,
    };

    // Only include optional fields if they are provided
    if (data.controlReference !== undefined) {
      createData.controlReference = data.controlReference;
    }
    if (data.expectedOutcome !== undefined) {
      createData.expectedOutcome = data.expectedOutcome;
    }
    if (data.actualResult !== undefined) {
      createData.actualResult = data.actualResult;
    }
    if (data.reviewerComment !== undefined) {
      createData.reviewerComment = data.reviewerComment;
    }

    return this.prisma.auditProgram.create({
      data: createData,
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
    
    const updateData: any = {};
    
    // Only include fields that are provided
    if (data.procedureName !== undefined) {
      updateData.procedureName = data.procedureName;
    }
    if (data.controlReference !== undefined) {
      updateData.controlReference = data.controlReference;
    }
    if (data.expectedOutcome !== undefined) {
      updateData.expectedOutcome = data.expectedOutcome;
    }
    if (data.actualResult !== undefined) {
      updateData.actualResult = data.actualResult;
    }
    if (data.reviewerComment !== undefined) {
      updateData.reviewerComment = data.reviewerComment;
    }

    return this.prisma.auditProgram.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.auditProgram.delete({ where: { id } });
  }
}
