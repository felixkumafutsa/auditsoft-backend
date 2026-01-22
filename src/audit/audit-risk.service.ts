import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export class RiskAssessmentDto {
  auditId: number;
  stage: string; // planning, execution, review, closing
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
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
   * Store in memory for this session
   */
  private riskAssessments: Map<number, any[]> = new Map();

  /**
   * Record a risk assessment for an audit stage
   */
  async recordRiskAssessment(data: RiskAssessmentDto): Promise<any> {
    const audit = await this.prisma.audit.findUnique({
      where: { id: data.auditId },
    });

    if (!audit) {
      throw new BadRequestException(`Audit with ID ${data.auditId} not found`);
    }

    const assessment = {
      id: Date.now(),
      auditId: data.auditId,
      stage: data.stage,
      riskLevel: data.riskLevel,
      riskFactors: data.riskFactors,
      mitigationActions: data.mitigationActions || [],
      assessedBy: data.assessedBy,
      notes: data.notes,
      createdAt: new Date(),
    };

    if (!this.riskAssessments.has(data.auditId)) {
      this.riskAssessments.set(data.auditId, []);
    }

    this.riskAssessments.get(data.auditId)!.push(assessment);

    return assessment;
  }

  /**
   * Get risk assessments for an audit
   */
  async getRiskAssessments(auditId: number): Promise<any[]> {
    return this.riskAssessments.get(auditId) || [];
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

    const riskLevels = assessments.map(a => a.metadata?.riskLevel);
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
      const stageAssessment = assessments.find(a => a.metadata?.stage === stage);
      return {
        stage,
        riskLevel: stageAssessment?.metadata?.riskLevel || 'not_assessed',
        timestamp: stageAssessment?.createdAt || null,
      };
    });
  }
}
