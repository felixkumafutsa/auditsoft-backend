import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getExecutiveReport() {
    // 1. Audit Status Distribution
    const auditStatus = await this.prisma.audit.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // 2. Findings by Severity
    const findingsSeverity = await this.prisma.finding.groupBy({
      by: ['severity'],
      _count: { severity: true },
    });

    // 3. Open High Risk Findings
    const highRiskFindings = await this.prisma.finding.findMany({
      where: {
        severity: { in: ['High', 'Critical'] },
        status: { notIn: ['Closed', 'Remediated'] },
      },
      select: {
        id: true,
        description: true,
        severity: true,
        status: true,
        audit: { select: { auditName: true } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // 4. Audit Plan Progress (Planned vs Completed)
    const totalAudits = await this.prisma.audit.count();
    const completedAudits = await this.prisma.audit.count({
      where: { status: 'Closed' },
    });

    // 5. Risk Overview (by Impact)
    const riskStats = await this.prisma.risk.groupBy({
      by: ['impact'],
      _count: { impact: true },
    });

    return {
      auditStatusDistribution: auditStatus.map(s => ({ status: s.status, count: s._count.status })),
      findingsBySeverity: findingsSeverity.map(f => ({ severity: f.severity, count: f._count.severity })),
      criticalOpenFindings: highRiskFindings,
      auditProgress: {
        total: totalAudits,
        completed: completedAudits,
        percentage: totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0,
      },
      riskOverview: riskStats.map(r => ({ level: r.impact, count: r._count.impact })),
    };
  }

  async getDashboardStats() {
    // Reusing similar logic or expanding for general dashboard
    const [audits, findings, users] = await Promise.all([
        this.prisma.audit.count(),
        this.prisma.finding.count({ where: { status: 'Open' } }),
        this.prisma.user.count(),
    ]);

    return {
        totalAudits: audits,
        openFindings: findings,
        activeUsers: users
    };
  }
}
