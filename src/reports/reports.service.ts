import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Response } from 'express';
import { NotificationService } from '../notification/notification.service';
import * as fs from 'fs';
import * as path from 'path';

export class GenerateCustomReportDto {
  fields: string[]; // ['auditName', 'status', 'assignedManager', ...]
  filters: {
    auditType?: string;
    status?: string;
    dateRange?: { start: Date; end: Date };
  };
  format: 'pdf' | 'csv';
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) { }

  // ... existing methods ...

  async generateCustomReport(dto: GenerateCustomReportDto, res: Response) {
    // 1. Fetch Data
    const where: any = {};
    if (dto.filters?.auditType && dto.filters.auditType !== 'All') {
      where.auditType = dto.filters.auditType;
    }
    if (dto.filters?.status && dto.filters.status !== 'All') {
      where.status = dto.filters.status;
    }
    if (dto.filters?.dateRange) {
      where.createdAt = {
        gte: new Date(dto.filters.dateRange.start),
        lte: new Date(dto.filters.dateRange.end),
      };
    }

    const audits = await this.prisma.audit.findMany({
      where,
      include: {
        assignedManager: true,
        auditUniverse: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Generate Output
    if (dto.format === 'csv') {
      return this.generateCustomCSV(audits, dto.fields, res);
    } else {
      return this.generateCustomPDF(audits, dto.fields, res);
    }
  }

  private async generateCustomCSV(data: any[], fields: string[], res: Response) {
    const headers = fields.map(f => this.getFieldLabel(f)).join(',');
    const rows = data.map(row => {
      return fields.map(field => {
        let val = this.getFieldValue(row, field);
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=Custom_Report_${Date.now()}.csv`);
    res.send(csvContent);
  }

  private async generateCustomPDF(data: any[], fields: string[], res: Response) {
    const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Custom_Report_${Date.now()}.pdf`);

    doc.pipe(res);

    // Title
    doc.fontSize(18).text('Custom Audit Report', { align: 'center' });
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown();

    // Table Header
    const tableTop = 100;
    let currentY = tableTop;
    const colWidth = (842 - 60) / fields.length; // A4 Landscape width approx 842pt

    doc.fontSize(10).font('Helvetica-Bold');
    fields.forEach((field, i) => {
      doc.text(this.getFieldLabel(field), 30 + (i * colWidth), currentY, { width: colWidth, align: 'left' });
    });

    // Draw Header Line
    currentY += 15;
    doc.moveTo(30, currentY).lineTo(812, currentY).stroke();
    currentY += 10;

    // Table Rows
    doc.font('Helvetica').fontSize(9);

    for (const row of data) {
      // Check pagination
      if (currentY > 550) {
        doc.addPage({ layout: 'landscape', margin: 30 });
        currentY = 50;
      }

      fields.forEach((field, i) => {
        const val = this.getFieldValue(row, field);
        doc.text(String(val).substring(0, 50), 30 + (i * colWidth), currentY, { width: colWidth, align: 'left', height: 15 });
      });

      currentY += 20; // Row height
    }

    doc.end();
  }

  private getFieldLabel(field: string): string {
    const map: any = {
      id: 'ID',
      auditName: 'Audit Name',
      auditType: 'Type',
      status: 'Status',
      startDate: 'Start Date',
      endDate: 'End Date',
      entityName: 'Entity',
      assignedTo: 'Manager'
    };
    return map[field] || field;
  }

  private getFieldValue(row: any, field: string): string {
    if (field === 'assignedTo') return row.assignedManager?.name || 'Unassigned';
    if (field === 'entityName') return row.auditUniverse?.entityName || 'N/A';
    if (field === 'startDate' || field === 'endDate') return row[field] ? new Date(row[field]).toLocaleDateString() : '-';
    return row[field] || '';
  }

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

  async getOperationalReports() {
    const [auditStats, findingStats, remediationStats] = await Promise.all([
      this.prisma.audit.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.finding.groupBy({
        by: ['severity', 'status'],
        _count: { id: true },
      }),
      this.prisma.actionPlan.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const auditsByMonth = await this.prisma.audit.findMany({
      select: { createdAt: true },
      where: {
        createdAt: {
          gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        },
      },
    });

    const monthlyAudits = auditsByMonth.reduce((acc, audit) => {
      const month = audit.createdAt.toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return {
      auditsByStatus: auditStats.map(s => ({ status: s.status, count: s._count.id })),
      findingsBySeverity: findingStats.map(f => ({ severity: f.severity, status: f.status, count: f._count.id })),
      remediationProgress: remediationStats.map(r => ({ status: r.status, count: r._count.id })),
      auditVolume: Object.keys(monthlyAudits).map(month => ({ month, count: monthlyAudits[month] })),
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

  async getReportsList(user: any) {
    // Audit Managers see reports for audits they manage or all if they are generic managers (depending on business rule, assuming all for now or restricted)
    // Chief Auditor sees all.
    // For simplicity based on prompt "available to audit manager and the Chief Auditor", we return all reports for closed audits.
    // We can add filtering if needed later.

    const reports = await this.prisma.report.findMany({
      where: {
        audit: {
          status: { in: ['Finalized', 'Pending Chief Auditor Approval', 'Process Owner Review', 'Closed'] }
        }
      },
      include: {
        audit: {
          select: { auditName: true, status: true }
        },
        generator: {
          select: { name: true }
        }
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });

    return reports.map(report => ({
      id: report.id,
      auditId: report.auditId,
      title: report.title,
      auditName: report.audit.auditName,
      auditStatus: report.audit.status,
      generatedBy: report.generator.name,
      generatedAt: report.generatedAt,
      fileUrl: report.fileUrl,
      fileType: report.fileType
    }));
  }

  async getAuditReportData(auditId: number) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
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

  private async buildPDF(doc: PDFKit.PDFDocument, audit: any) {
    // Title
    doc.fontSize(20).text(`Audit Report: ${audit.auditName}`, { align: 'center' });
    doc.moveDown();

    // Metadata
    doc.fontSize(14).text('General Information', { underline: true });
    doc.fontSize(12).text(`Status: ${audit.status}`);
    doc.text(`Type: ${audit.auditType}`);
    doc.text(`Business Entity: ${audit.auditUniverse?.entityName || 'N/A'} (${audit.auditUniverse?.entityType || 'N/A'})`);
    doc.text(`Audit Manager: ${audit.assignedManager?.name || 'Unassigned'}`);

    const auditors = audit.assignedAuditors?.map(a => a.name).join(', ') || 'Unassigned';
    doc.text(`Assigned Auditor(s): ${auditors}`);

    doc.text(`Dates: ${audit.startDate ? new Date(audit.startDate).toDateString() : 'N/A'} - ${audit.endDate ? new Date(audit.endDate).toDateString() : 'N/A'}`);
    doc.moveDown();

    // Audit Programs
    doc.fontSize(14).text('Audit Programs', { underline: true });
    if (audit.auditPrograms && audit.auditPrograms.length > 0) {
      audit.auditPrograms.forEach((program, index) => {
        doc.fontSize(12).text(`${index + 1}. ${program.procedureName}`);
        doc.fontSize(10).text(`   Control Reference: ${program.controlReference || 'N/A'}`);
        doc.text(`   Expected Outcome: ${program.expectedOutcome || 'N/A'}`);
        doc.text(`   Actual Result: ${program.actualResult || 'In Progress'}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(12).text('No audit programs defined.');
    }
    doc.moveDown();

    // Findings
    doc.fontSize(14).text('Detailed Findings', { underline: true });
    if (audit.findings && audit.findings.length > 0) {
      audit.findings.forEach((finding, index) => {
        doc.fontSize(12).text(`${index + 1}. ${finding.description} (${finding.severity})`);
        doc.fontSize(10).text(`   Status: ${finding.status}`);
        if (finding.rootCause) doc.text(`   Root Cause: ${finding.rootCause}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(12).text('No findings identified.');
    }
    doc.moveDown();

    // Evidence
    doc.fontSize(14).text('Evidence Summary', { underline: true });
    let totalEvidence = 0;
    audit.auditPrograms?.forEach(program => {
      totalEvidence += program.evidence?.length || 0;
    });
    doc.fontSize(12).text(`Total Evidence Files Uploaded: ${totalEvidence}`);

    doc.end();
  }

  async generatePDF(auditId: number, res: Response) {
    const audit = await this.getAuditReportData(auditId);
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Audit_Report_${auditId}.pdf`);

    doc.pipe(res);
    await this.buildPDF(doc, audit);

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
        link: `/reports/audit/${auditId}/pdf`
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

    await this.buildPDF(doc, audit);

    await new Promise<void>((resolve, reject) => {
      writeStream.on('finish', () => resolve());
      writeStream.on('error', reject);
    });

    // Notify Manager (review-only) and Chief Auditor (download)
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
    // Notify Chief Auditors
    const chiefAuditors = await this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              roleName: { in: ['Chief Auditor'] }
            }
          }
        }
      }
    });
    for (const chiefAuditor of chiefAuditors) {
      await this.notificationService.create({
        userId: chiefAuditor.id,
        title: 'Audit Report Ready',
        message: `Audit report for '${audit.auditName}' is ready to download.`,
        type: 'REPORT_READY',
        link: `/reports/audit/${auditId}/download`,
      });
    }

    return filePath;
  }

  /**
   * Stream a stored PDF file
   */
  async streamStoredPDF(auditId: number, res: Response, attachment: boolean = false) {
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'reports', `Audit_Report_${auditId}.pdf`);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Report file not found');
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

  /**
   * Save audit report to database and notify CAE for approval
   */
  async saveReport(auditId: number, user: any) {
    const audit = await this.prisma.audit.findUnique({
      where: { id: auditId },
      include: {
        assignedManager: true,
      }
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${auditId} not found`);
    }

    // Check if report file exists
    const filePath = path.join(__dirname, '..', '..', 'uploads', 'reports', `Audit_Report_${auditId}.pdf`);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Report file not found. Please ensure the audit has been finalized.');
    }

    // Check if report already exists for this audit
    const existingReport = await this.prisma.report.findFirst({
      where: { auditId }
    });

    let report;
    if (existingReport) {
      // Update existing report
      report = await this.prisma.report.update({
        where: { id: existingReport.id },
        data: {
          generatedBy: user.id || user.sub,
          generatedAt: new Date(),
          fileUrl: `/uploads/reports/Audit_Report_${auditId}.pdf`,
          fileType: 'pdf',
        }
      });
    } else {
      // Create new report record
      report = await this.prisma.report.create({
        data: {
          auditId,
          title: `Audit Report - ${audit.auditName}`,
          generatedBy: user.id || user.sub,
          fileUrl: `/uploads/reports/Audit_Report_${auditId}.pdf`,
          fileType: 'pdf',
        }
      });
    }

    // Update audit status to indicate report is pending Chief Auditor approval
    await this.prisma.audit.update({
      where: { id: auditId },
      data: { status: 'Pending Chief Auditor Approval' }
    });

    // Notify all Chief Auditors to preview and approve the report
    const chiefAuditors = await this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              roleName: { in: ['Chief Auditor'] }
            }
          }
        }
      }
    });

    for (const chiefAuditor of chiefAuditors) {
      await this.notificationService.create({
        userId: chiefAuditor.id,
        title: 'Audit Report Pending Approval',
        message: `The audit report for '${audit.auditName}' has been saved by ${user.name || 'a Manager'} and is awaiting your approval.`,
        type: 'action_required',
        link: `/reports/audit/${auditId}/preview`,
      });
    }

    return {
      success: true,
      message: 'Report saved successfully. Chief Auditor has been notified for approval.',
      report,
    };
  }
}

