import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditPlanService {
  constructor(private prisma: PrismaService) {}

  // Get annual audit plan with quarterly breakdown
  async getAnnualPlan(year: number) {
    console.log(`Getting annual plan for year: ${year}`);
    
    // Get all audits to understand the data distribution
    const allAudits = await this.prisma.audit.findMany({
      select: {
        id: true,
        auditName: true,
        year: true,
        quarter: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`Found ${allAudits.length} total audits`);
    console.log('Year distribution:', allAudits.reduce((acc, audit) => {
      acc[audit.year || 'null'] = (acc[audit.year || 'null'] || 0) + 1;
      return acc;
    }, {}));

    // Smart year filtering: if no audits exist for the requested year, 
    // return audits from the most recent year that has audits
    let targetYear = year;
    const yearsWithAudits = allAudits
      .filter(a => a.year !== null && a.year !== undefined)
      .map(a => a.year!);
    
    const uniqueYears = [...new Set(yearsWithAudits)].sort((a, b) => b - a);
    
    // If no audits have years set, or the requested year doesn't exist, use all audits
    if (uniqueYears.length === 0) {
      console.log('No audits have years set, showing all audits');
      targetYear = year; // Keep original year but will use OR condition below
    } else if (!uniqueYears.includes(year)) {
      targetYear = uniqueYears[0]; // Use the most recent year with audits
      console.log(`No audits found for year ${year}, using year ${targetYear} instead`);
    }

    // Get audits for the target year, plus any without a year set (for backward compatibility)
    // If no years are set at all, get all audits
    const whereCondition = uniqueYears.length === 0 
      ? {} // Get all audits if no years are set
      : {
          OR: [
            { year: targetYear },
            { year: null },
            { year: undefined }
          ]
        };

    const audits = await this.prisma.audit.findMany({
      where: whereCondition,
      include: {
        assignedManager: {
          select: { id: true, name: true }
        },
        auditUniverse: {
          select: { id: true, entityName: true, entityType: true, riskRating: true }
        },
        assignedAuditors: {
          select: { id: true, name: true }
        },
        executiveApprover: {
          select: { id: true, name: true }
        }
      },
      orderBy: [
        { quarter: 'asc' },
        { priority: 'desc' },
        { riskScore: 'desc' }
      ]
    });

    console.log(`Found ${audits.length} audits (using year filter strategy: ${uniqueYears.length === 0 ? 'all audits' : `year ${targetYear} + null years`})`);

    // Group by quarters
    const quarterlyPlan = {
      Q1: audits.filter(a => a.quarter === 'Q1'),
      Q2: audits.filter(a => a.quarter === 'Q2'),
      Q3: audits.filter(a => a.quarter === 'Q3'),
      Q4: audits.filter(a => a.quarter === 'Q4'),
      Unassigned: audits.filter(a => !a.quarter)
    };

    // Calculate summary statistics with defaults for empty data
    const summary = {
      totalAudits: audits.length,
      totalBudget: audits.reduce((sum, audit) => sum + (audit.budgetAllocation || 0), 0),
      totalResourceHours: audits.reduce((sum, audit) => sum + (audit.resourceHours || 0), 0),
      highRiskAudits: audits.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length,
      approvedAudits: audits.filter(a => a.executiveApproval).length,
      riskDistribution: this.calculateRiskDistribution(audits),
      quarterlyDistribution: this.calculateQuarterlyDistribution(quarterlyPlan)
    };

    return {
      year: targetYear, // Return the actual year being used
      summary,
      quarterlyPlan,
      audits
    };
  }

  // Get risk-based audit recommendations
  async getRiskBasedRecommendations(limit: number = 10) {
    try {
      const highRiskUniverse = await this.prisma.auditUniverse.findMany({
        where: {
          riskRating: {
            in: ['High', 'Critical']
          }
        },
        include: {
          audits: {
            where: {
              year: new Date().getFullYear()
            }
          }
        }
      });

      // Filter entities that haven't been audited this year
      const recommendations = highRiskUniverse
        .filter(entity => entity.audits.length === 0)
        .slice(0, limit)
        .map(entity => ({
          entity: entity,
          recommendedPriority: entity.riskRating === 'Critical' ? 'High' : 'Medium',
          suggestedQuarter: this.suggestQuarter(entity.riskRating),
          estimatedHours: this.estimateAuditHours(entity.entityType, entity.riskRating),
          riskScore: this.calculateRiskScore(entity.riskRating)
        }));

      return recommendations;
    } catch (error) {
      // Return empty array if there's any error (e.g., no audit universe data)
      console.error('Error in getRiskBasedRecommendations:', error);
      return [];
    }
  }

  // Update audit with strategic information
  async updateAuditStrategicInfo(auditId: number, data: any) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId }
    });

    if (!audit) {
      throw new NotFoundException(`Audit ${auditId} not found`);
    }

    // Auto-calculate priority based on risk score if not provided
    let priority = data.priority;
    if (data.riskScore && !data.priority) {
      priority = this.calculatePriorityFromRiskScore(data.riskScore);
    }

    // Auto-calculate risk level if not provided
    let riskLevel = data.riskLevel;
    if (data.riskScore && !data.riskLevel) {
      riskLevel = this.calculateRiskLevelFromScore(data.riskScore);
    }

    return this.prisma.audit.update({
      where: { id: auditId },
      data: {
        ...data,
        priority,
        riskLevel
      }
    });
  }

  // Executive approval workflow
  async executiveApproval(auditId: number, approverId: number, approved: boolean, comments?: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        assignedManager: {
          select: { id: true, name: true }
        }
      }
    });

    if (!audit) {
      throw new NotFoundException(`Audit ${auditId} not found`);
    }

    const updateData: any = {
      executiveApproval: approved,
      executiveApprovedById: approverId,
      executiveApprovedAt: new Date()
    };

    if (comments) {
      updateData.chiefAuditorComments = comments;
    }

    return this.prisma.audit.update({
      where: { id: auditId },
      data: updateData
    });
  }

  // Get resource allocation dashboard
  async getResourceAllocation(year: number) {
    const audits = await this.prisma.audit.findMany({
      where: {
        year: year
      },
      include: {
        assignedManager: {
          select: { id: true, name: true }
        },
        assignedAuditors: {
          select: { id: true, name: true }
        }
      }
    });

    // Calculate resource allocation by manager
    const managerAllocation = audits.reduce((acc, audit) => {
      const managerId = audit.assignedManagerId;
      if (managerId) {
        if (!acc[managerId]) {
          acc[managerId] = {
            manager: audit.assignedManager,
            totalAudits: 0,
            totalHours: 0,
            totalBudget: 0,
            audits: []
          };
        }
        acc[managerId].totalAudits++;
        acc[managerId].totalHours += audit.resourceHours || 0;
        acc[managerId].totalBudget += audit.budgetAllocation || 0;
        acc[managerId].audits.push(audit);
      }
      return acc;
    }, {});

    return {
      year,
      totalAudits: audits.length,
      totalHours: audits.reduce((sum, audit) => sum + (audit.resourceHours || 0), 0),
      totalBudget: audits.reduce((sum, audit) => sum + (audit.budgetAllocation || 0), 0),
      managerAllocation: Object.values(managerAllocation),
      quarterlyAllocation: this.calculateQuarterlyAllocation(audits)
    };
  }

  // Helper methods
  private calculateRiskDistribution(audits: any[]) {
    const distribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    audits.forEach(audit => {
      if (audit.riskLevel && distribution.hasOwnProperty(audit.riskLevel)) {
        distribution[audit.riskLevel]++;
      }
    });
    return distribution;
  }

  private calculateQuarterlyDistribution(quarterlyPlan: any) {
    return {
      Q1: quarterlyPlan.Q1.length,
      Q2: quarterlyPlan.Q2.length,
      Q3: quarterlyPlan.Q3.length,
      Q4: quarterlyPlan.Q4.length,
      Unassigned: quarterlyPlan.Unassigned.length
    };
  }

  private suggestQuarter(riskRating: string): string {
    switch (riskRating) {
      case 'Critical': return 'Q1';
      case 'High': return 'Q1';
      case 'Medium': return 'Q2';
      default: return 'Q3';
    }
  }

  private estimateAuditHours(entityType: string, riskRating: string): number {
    const baseHours = {
      'Process': 40,
      'Application': 60,
      'Infrastructure': 80,
      'Compliance': 50,
      'Financial': 120
    };

    const riskMultiplier = {
      'Low': 0.8,
      'Medium': 1.0,
      'High': 1.5,
      'Critical': 2.0
    };

    const base = baseHours[entityType] || 60;
    const multiplier = riskMultiplier[riskRating] || 1.0;
    return Math.round(base * multiplier);
  }

  private calculateRiskScore(riskRating: string): number {
    const scores = {
      'Low': 3,
      'Medium': 5,
      'High': 8,
      'Critical': 10
    };
    return scores[riskRating] || 5;
  }

  private calculatePriorityFromRiskScore(riskScore: number): string {
    if (riskScore >= 8) return 'High';
    if (riskScore >= 5) return 'Medium';
    return 'Low';
  }

  private calculateRiskLevelFromScore(riskScore: number): string {
    if (riskScore >= 9) return 'Critical';
    if (riskScore >= 7) return 'High';
    if (riskScore >= 4) return 'Medium';
    return 'Low';
  }

  private calculateQuarterlyAllocation(audits: any[]) {
    const allocation = {
      Q1: { audits: 0, hours: 0, budget: 0 },
      Q2: { audits: 0, hours: 0, budget: 0 },
      Q3: { audits: 0, hours: 0, budget: 0 },
      Q4: { audits: 0, hours: 0, budget: 0 }
    };

    audits.forEach(audit => {
      if (audit.quarter && allocation.hasOwnProperty(audit.quarter)) {
        allocation[audit.quarter].audits++;
        allocation[audit.quarter].hours += audit.resourceHours || 0;
        allocation[audit.quarter].budget += audit.budgetAllocation || 0;
      }
    });

    return allocation;
  }
}
