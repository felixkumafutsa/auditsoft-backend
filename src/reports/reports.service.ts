import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Response } from 'express';
import { NotificationService } from '../notification/notification.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) {}

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

    // Audit Planning Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const auditsTrend = await this.prisma.audit.groupBy({
        by: ['createdAt'],
        where: {
            createdAt: {
                gte: sixMonthsAgo
            }
        },
        _count: {
            id: true
        }
    });

    // Process trend data to group by month
    const monthlyTrend = auditsTrend.reduce((acc, curr) => {
        const month = curr.createdAt.toLocaleString('default', { month: 'short' });
        acc[month] = (acc[month] || 0) + curr._count.id;
        return acc;
    }, {});

    const trendData = Object.keys(monthlyTrend).map(key => ({ name: key, audits: monthlyTrend[key] }));

    // Audit Status Distribution for Pie Chart
    const auditStatus = await this.prisma.audit.groupBy({
        by: ['status'],
        _count: { status: true },
    });

    return {
        totalAudits: audits,
        openFindings: findings,
        activeUsers: users,
        auditTrend: trendData,
        auditStatusDistribution: auditStatus.map(s => ({ name: s.status, value: s._count.status }))
    };
  }

  async getAuditReportData(auditId: number) {
    const audit = await this.prisma.audit.findUnique({      where: { id: auditId },
      include: {
        assignedManager: true,
        assignedAuditors: true,
        auditUniverse: true,
        auditPrograms: {
            include: {
                findings: true,
                evidence: true
            }
        },
        findings: {
            include: {
                actionPlans: true
            }
        },
        risks: true
      }
    });

    if (!audit) {
        throw new Error('Audit not found');
    }

    return audit;
  }

  async generatePDF(auditId: number, res: Response) {
    const audit = await this.getAuditReportData(auditId);
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Audit_Report_${auditId}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(20).text(`Audit Report: ${audit.auditName}`, { align: 'center' });
    doc.moveDown();

    // Metadata
    doc.fontSize(12).text(`Status: ${audit.status}`);
    doc.text(`Type: ${audit.auditType}`);
    doc.text(`Manager: ${audit.assignedManager?.name || 'Unassigned'}`);
    doc.text(`Dates: ${audit.startDate ? new Date(audit.startDate).toDateString() : 'N/A'} - ${audit.endDate ? new Date(audit.endDate).toDateString() : 'N/A'}`);
    doc.moveDown();

    // Executive Summary (Placeholder based on findings)
    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.fontSize(12).text(`This audit identified ${audit.findings.length} findings.`);
    doc.moveDown();

    // Findings
    doc.fontSize(16).text('Detailed Findings', { underline: true });
    audit.findings.forEach((finding, index) => {
        doc.fontSize(14).text(`${index + 1}. ${finding.description} (${finding.severity})`);
        doc.fontSize(12).text(`Status: ${finding.status}`);
        if (finding.rootCause) doc.text(`Root Cause: ${finding.rootCause}`);
        doc.moveDown();
    });

    doc.end();

    // Notify relevant users (Manager and Auditors)
    const recipients = [
        ...(audit.assignedManagerId ? [audit.assignedManagerId] : []),
        ...audit.assignedAuditors.map(a => a.id)
    ];

    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)];

    for (const userId of uniqueRecipients) {
        await this.notificationService.create({
            userId,
            title: 'Report Generated',
            message: `New Audit Report generated for ${audit.auditName}. You can download it now.`,
            type: 'REPORT_GENERATED',
            link: `/reports/audit/${auditId}/pdf` // Or a frontend link to view
        });
    }
  }

  async generatePDFToFile(auditId: number): Promise<string> {
    const audit = await this.getAuditReportData(auditId);
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'reports');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, `Audit_Report_${auditId}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(20).text(`Audit Report: ${audit.auditName}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Status: ${audit.status}`);
    doc.text(`Type: ${audit.auditType}`);
    doc.text(`Manager: ${audit.assignedManager?.name || 'Unassigned'}`);
    doc.text(`Dates: ${audit.startDate ? new Date(audit.startDate).toDateString() : 'N/A'} - ${audit.endDate ? new Date(audit.endDate).toDateString() : 'N/A'}`);
    doc.moveDown();
    doc.fontSize(16).text('Executive Summary', { underline: true });
    doc.fontSize(12).text(`This audit identified ${audit.findings.length} findings.`);
    doc.moveDown();
    doc.fontSize(16).text('Detailed Findings', { underline: true });
    audit.findings.forEach((finding, index) => {
      doc.fontSize(14).text(`${index + 1}. ${finding.description} (${finding.severity})`);
      doc.fontSize(12).text(`Status: ${finding.status}`);
      if (finding.rootCause) doc.text(`Root Cause: ${finding.rootCause}`);
      doc.moveDown();
    });
    doc.end();

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    // Notify Manager (review-only) and CAE (download)
    const recipientsReview = audit.assignedManagerId ? [audit.assignedManagerId] : [];
    for (const userId of recipientsReview) {
      await this.notificationService.create({
        userId,
        title: 'Audit Report Ready for Review',
        message: `Audit report for '${audit.auditName}' is ready. View it now.`,
        type: 'REPORT_READY',
        link: `/reports/audit/${auditId}/preview`,
      });
    }
    const caes = await this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
            }
          }
        }
      }
    });
    for (const cae of caes) {
      await this.notificationService.create({
        userId: cae.id,
        title: 'Audit Report Ready',
        message: `Audit report for '${audit.auditName}' is ready to download.`,
        type: 'REPORT_READY',
        link: `/reports/audit/${auditId}/file`,
      });
    }

    return filePath;
  }

  async streamStoredPDF(auditId: number, res: Response, attachment: boolean) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'reports', `Audit_Report_${auditId}.pdf`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Report file not found. Try regenerating.');
    }
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${attachment ? 'attachment' : 'inline'}; filename=Audit_Report_${auditId}.pdf`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }

  async generateWord(auditId: number, res: Response) {
    const audit = await this.getAuditReportData(auditId);
    
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                new Paragraph({
                    text: `Audit Report: ${audit.auditName}`,
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: `Status: ${audit.status}`,
                    heading: HeadingLevel.HEADING_2,
                }),
                 new Paragraph({
                    text: `Manager: ${audit.assignedManager?.name || 'Unassigned'}`,
                }),
                 new Paragraph({
                    text: `Findings Count: ${audit.findings.length}`,
                }),
                // Add more sections as needed
            ],
        }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=Audit_Report_${auditId}.docx`);
    res.send(buffer);

    // Notify relevant users (Manager and Auditors)
    const recipients = [
        ...(audit.assignedManagerId ? [audit.assignedManagerId] : []),
        ...audit.assignedAuditors.map(a => a.id)
    ];

    // Remove duplicates
    const uniqueRecipients = [...new Set(recipients)];

    for (const userId of uniqueRecipients) {
        await this.notificationService.create({
            userId,
            title: 'Report Generated',
            message: `New Audit Report generated for ${audit.auditName}. You can download it now.`,
            type: 'REPORT_GENERATED',
            link: `/reports/audit/${auditId}/docx` // Or a frontend link to view
        });
    }
  }
}

