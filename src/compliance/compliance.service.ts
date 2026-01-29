import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFrameworkDto } from './dto/create-framework.dto';
import { UpdateFrameworkDto } from './dto/update-framework.dto';
import { CreateControlMappingDto } from './dto/create-control-mapping.dto';
import { UpdateControlMappingDto } from './dto/update-control-mapping.dto';

@Injectable()
export class ComplianceService {
  constructor(private prisma: PrismaService) {}

  // --- Frameworks ---

  async findAllFrameworks() {
    return this.prisma.complianceFramework.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneFramework(id: number) {
    const framework = await this.prisma.complianceFramework.findUnique({
      where: { id },
    });
    if (!framework) {
      throw new NotFoundException(`Framework with ID ${id} not found`);
    }
    return framework;
  }

  async createFramework(data: CreateFrameworkDto) {
    return this.prisma.complianceFramework.create({
      data,
    });
  }

  async updateFramework(id: number, data: UpdateFrameworkDto) {
    await this.findOneFramework(id); // Ensure exists
    return this.prisma.complianceFramework.update({
      where: { id },
      data,
    });
  }

  async deleteFramework(id: number) {
    await this.findOneFramework(id); // Ensure exists
    return this.prisma.complianceFramework.delete({
      where: { id },
    });
  }

  // --- Control Mappings ---

  async findMappingsByProgram(programId: number) {
    return this.prisma.controlMapping.findMany({
      where: { auditProgramId: programId },
      include: { framework: true },
    });
  }

  async createControlMapping(data: CreateControlMappingDto) {
    try {
      return await this.prisma.controlMapping.create({
        data: {
          auditProgramId: data.auditProgramId,
          frameworkId: data.frameworkId,
          coverageStatus: data.coverageStatus,
        },
      });
    } catch (error) {
      if ((error as any).code === 'P2002') {
        throw new ConflictException(
          'A control mapping for this Audit Program and Framework already exists.',
        );
      }
      throw error;
    }
  }

  async updateControlMapping(id: number, data: UpdateControlMappingDto) {
    const mapping = await this.prisma.controlMapping.findUnique({ where: { id } });
    if (!mapping) throw new NotFoundException(`Mapping with ID ${id} not found`);

    return this.prisma.controlMapping.update({
      where: { id },
      data,
    });
  }

  async deleteControlMapping(id: number) {
    const mapping = await this.prisma.controlMapping.findUnique({ where: { id } });
    if (!mapping) throw new NotFoundException(`Mapping with ID ${id} not found`);

    return this.prisma.controlMapping.delete({
      where: { id },
    });
  }

  // --- Analytics ---

  async getCoverageStats() {
    const frameworks = await this.prisma.complianceFramework.findMany({
      include: {
        controlMappings: true,
      },
    });

    return frameworks.map((fw) => {
      const total = fw.controlMappings.length;
      const covered = fw.controlMappings.filter((m) => m.coverageStatus === 'Covered').length;
      const partial = fw.controlMappings.filter((m) => m.coverageStatus === 'Partial').length;
      const notCovered = fw.controlMappings.filter((m) => m.coverageStatus === 'Not Covered').length;

      // Simple calculation: Covered = 1, Partial = 0.5
      let coverageScore = 0;
      if (total > 0) {
        coverageScore = Math.round(((covered + partial * 0.5) / total) * 100);
      }

      return {
        id: fw.id,
        frameworkName: fw.frameworkName,
        version: fw.version,
        totalMappings: total,
        covered,
        partial,
        notCovered,
        coverageScore,
      };
    });
  }
}
