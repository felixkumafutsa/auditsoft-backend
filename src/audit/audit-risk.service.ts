import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class RiskAssessmentDto {
  auditId: number;
  stage: string; // planning, execution, review, closing
  riskLevel: string; // low, medium, high, critical
  riskFactors: string[]; // e.g., ["inadequate_controls", "high_transaction_volume"]
  mitigationActions?: string[];
  assessedBy?: number;
  notes?: string;
}

@Injectable()
export class AuditRiskService {
  constructor(private prisma: PrismaService) {}

  /**
   * Record a risk assessment for an audit stage
   * Now persists to database instead of memory
   */
  async recordRiskAssessment(data: RiskAssessmentDto): Promise<any> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: data.auditId },
    });

    if (!audit) {
      throw new BadRequestException(`Audit with ID ${data.auditId} not found`);
    }

    // Validate that the assessor exists if provided
    if (data.assessedBy) {
      const assessor = await this.prisma.user.findUnique({
        where: { id: data.assessedBy },
      });

      if (!assessor) {
        throw new BadRequestException(`User with ID ${data.assessedBy} not found`);
      }
    }

    return this.prisma.riskAssessment.create({
      data: {
        auditId: data.auditId,
        stage: data.stage,
        riskLevel: data.riskLevel,
        riskFactors: JSON.stringify(data.riskFactors),
        mitigationActions: data.mitigationActions ? JSON.stringify(data.mitigationActions) : null,
        assessedBy: data.assessedBy || null,
        notes: data.notes,
      },
      include: {
        audit: true,
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get risk assessments for an audit
   */
  async getRiskAssessments(auditId: number): Promise<any[]> {
    return this.prisma.riskAssessment.findMany({
      where: { auditId },
      include: {
        audit: true,
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calculate overall audit risk based on assessments
   */
  async calculateOverallRisk(auditId: number): Promise<any> {
    const assessments = await this.getRiskAssessments(auditId);

    if (assessments.length === 0) {
      return {
        overallRisk: 'unknown',
        assessmentCount: 0,
        latestAssessment: null,
      };
    }

    const riskLevels = assessments.map(a => a.riskLevel);
    const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const maxRisk = Math.max(...riskLevels.map(r => riskOrder[r] || 0));

    const riskMap = { 4: 'critical', 3: 'high', 2: 'medium', 1: 'low', 0: 'unknown' };

    return {
      overallRisk: riskMap[maxRisk],
      assessmentCount: assessments.length,
      latestAssessment: assessments[0],
      allAssessments: assessments,
    };
  }

  /**
   * Get risk trend for an audit (how risk evolves through stages)
   */
  async getRiskTrend(auditId: number): Promise<any[]> {
    const assessments = await this.getRiskAssessments(auditId);
    const stages = ['planning', 'execution', 'review', 'closing'];

    return stages.map(stage => {
      const stageAssessment = assessments.find(a => a.stage === stage);
      return {
        stage,
        riskLevel: stageAssessment?.riskLevel || 'not_assessed',
        timestamp: stageAssessment?.createdAt || null,
        assessment: stageAssessment || null,
      };
    });
  }

  /**
   * Update a risk assessment
   */
  async updateRiskAssessment(id: number, data: Partial<RiskAssessmentDto>): Promise<any> {
    const updateData: any = { ...data };

    if (data.riskFactors) {
      updateData.riskFactors = JSON.stringify(data.riskFactors);
    }

    if (data.mitigationActions) {
      updateData.mitigationActions = JSON.stringify(data.mitigationActions);
    }

    return this.prisma.riskAssessment.update({
      where: { id },
      data: updateData,
      include: {
        audit: true,
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Delete a risk assessment
   */
  async deleteRiskAssessment(id: number): Promise<any> {
    return this.prisma.riskAssessment.delete({
      where: { id },
    });
  }

  /**
   * Get all risk assessments across all audits (for admin/overview)
   */
  async getAllRiskAssessments(): Promise<any[]> {
    return this.prisma.riskAssessment.findMany({
      include: {
        audit: {
          select: {
            id: true,
            auditName: true,
            auditType: true,
            auditUniverse: {
              select: {
                entityName: true,
                entityType: true,
              },
            },
          },
        },
        assessor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
