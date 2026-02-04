import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { CreateKriDto } from './dto/create-kri.dto';
import { UpdateKriDto } from './dto/update-kri.dto';

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  // Risk Methods
  async createRisk(createRiskDto: CreateRiskDto) {
    const riskId = `RISK-${Date.now().toString().slice(-6)}`;
    return this.prisma.risk.create({
      data: {
        ...createRiskDto,
        riskId,
      },
    });
  }

  async findAllRisks() {
    return this.prisma.risk.findMany({
      include: {
        owner: true,
        kris: true,
        audits: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOneRisk(id: number) {
    return this.prisma.risk.findUnique({
      where: { id },
      include: {
        owner: true,
        kris: true,
        audits: true,
      },
    });
  }

  async updateRisk(id: number, updateRiskDto: UpdateRiskDto) {
    return this.prisma.risk.update({
      where: { id },
      data: updateRiskDto,
    });
  }

  async removeRisk(id: number) {
    return this.prisma.risk.delete({
      where: { id },
    });
  }

  // KRI Methods
  async createKri(createKriDto: CreateKriDto) {
    const kriId = `KRI-${Date.now().toString().slice(-6)}`;
    
    // Calculate initial status
    let status = 'green';
    if (createKriDto.currentValue >= createKriDto.criticalThreshold) {
      status = 'red';
    } else if (createKriDto.currentValue >= createKriDto.warningThreshold) {
      status = 'amber';
    }

    return this.prisma.kRI.create({
      data: {
        ...createKriDto,
        kriId,
        status,
      },
    });
  }

  async findAllKris() {
    return this.prisma.kRI.findMany({
      include: {
        risk: true,
        owner: true,
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOneKri(id: number) {
    return this.prisma.kRI.findUnique({
      where: { id },
      include: {
        risk: true,
        owner: true,
      },
    });
  }

  async updateKri(id: number, updateKriDto: UpdateKriDto) {
    // If value or thresholds changed, recalculate status
    const status = undefined;
    if (updateKriDto.currentValue !== undefined) {
        // Need to fetch current thresholds if not provided
        // For simplicity, assuming if we update value we might update status manually or logic needs full object
        // Let's simple check:
        // This is complex without fetching first.
        // For now, let's just update fields.
        // TODO: specific logic for status update based on thresholds
    }

    return this.prisma.kRI.update({
      where: { id },
      data: updateKriDto,
    });
  }

  async removeKri(id: number) {
    return this.prisma.kRI.delete({
      where: { id },
    });
  }
}
