import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAuditUniverseDto } from './dto/create-audit-universe.dto';
import { UpdateAuditUniverseDto } from './dto/update-audit-universe.dto';

@Injectable()
export class AuditUniverseService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateAuditUniverseDto) {
    const createData: any = {
      entityType: data.entityType,
      entityName: data.entityName,
    };

    // Only include optional fields if they are provided
    if (data.riskRating !== undefined) {
      createData.riskRating = data.riskRating;
    }

    return this.prisma.auditUniverse.create({
      data: createData,
    });
  }

  findAll() {
    return this.prisma.auditUniverse.findMany();
  }

  findOne(id: number) {
    return this.prisma.auditUniverse.findUnique({
      where: { id },
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
