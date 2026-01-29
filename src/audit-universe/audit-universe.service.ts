import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditUniverseDto } from './dto/create-audit-universe.dto';
import { UpdateAuditUniverseDto } from './dto/update-audit-universe.dto';

@Injectable()
export class AuditUniverseService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAuditUniverseDto) {
    return this.prisma.auditUniverse.create({
      data,
    });
  }

  findAll() {
    return this.prisma.auditUniverse.findMany({
      include: {
        owner: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.auditUniverse.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });
  }

  update(id: number, data: UpdateAuditUniverseDto) {
    return this.prisma.auditUniverse.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.auditUniverse.delete({
      where: { id },
    });
  }
}
