import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Response } from 'express';
import { NotificationService } from '../notification/notification.service';
import * as fs from 'fs';
import * as path from 'path';

import { IsArray, IsString, IsOptional, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

class DateRangeDto {
  @IsString()
  start: Date;
  @IsString()
  end: Date;
}

class CustomReportFiltersDto {
  @IsOptional()
  @IsString()
  auditType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;
}

export class GenerateCustomReportDto {
  @IsArray()
  @IsString({ each: true })
  fields: string[]; // ['auditName', 'status', 'assignedManager', ...]

  @IsOptional()
  @ValidateNested()
  @Type(() => CustomReportFiltersDto)
  filters?: CustomReportFiltersDto;

  @IsString()
  @IsIn(['pdf', 'csv'])
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
        // Draw footer on new page
        this.drawFooter(doc, 'AUDITSOFT — Internal Audit Management System');
      }

      fields.forEach((field, i) => {
        const val = this.getFieldValue(row, field);
        doc.text(String(val).substring(0, 50), 30 + (i * colWidth), currentY, { width: colWidth, align: 'left', height: 15 });
      });

      currentY += 20; // Row height
    }

    // Wait for the PDF to finish generating before ending the response
    return new Promise<void>((resolve, reject) => {
      doc.on('end', () => {
        resolve();
      });
      
      doc.on('error', (error) => {
        reject(error);
      });

      doc.end();
    });
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
          status: { in: ['Finalized', 'Closed'] }
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
        auditUniverse: {
          include: {
            owner: true
          }
        },
        auditPrograms: {
          include: {
            findings: {
              include: {
                actionPlans: {
                  include: {
                    owner: true
                  }
                }
              }
            },
            evidence: {
              include: {
                uploadedBy: true,
                versions: true
              }
            },
            controlMappings: {
              include: {
                framework: true
              }
            }
          }
        },
        findings: {
          include: {
            actionPlans: {
              include: {
                owner: true
              }
            }
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

  /**
   * Helper to draw a heading (bold + underlined) in the PDF
   */
  private drawHeading(doc: PDFKit.PDFDocument, text: string, fontSize = 14) {
    doc.font('Helvetica-Bold').fontSize(fontSize).text(text, { underline: true });
    doc.font('Helvetica');
  }

  /**
   * Draw the system footer on the current page
   */
  private drawFooter(doc: PDFKit.PDFDocument, systemName: string) {
    const pageHeight = doc.page.height;
    const pageWidth = doc.page.width;
    const margin = doc.page.margins.left;
    const bottomMargin = 50; // Consistent bottom margin

    doc.save();
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#555555')
      .text(
        systemName,
        margin,
        pageHeight - bottomMargin,
        { width: pageWidth - margin * 2, align: 'center', lineBreak: false }
      );
    doc.restore();
  }

  private async buildPDF(doc: PDFKit.PDFDocument, audit: any) {
    const SYSTEM_NAME = 'AUDITSOFT — Internal Audit Management System';
    const MARGIN = doc.page.margins.left;
    const PAGE_WIDTH = doc.page.width;
    const PAGE_HEIGHT = doc.page.height;

    // ──────────────────────────────────────────────────────────────
    // COVER PAGE
    // ──────────────────────────────────────────────────────────────
    const logoPath = path.join(__dirname, '..', '..', '..', '..', 'auditsoft-frontend', 'public', 'logo.png');
    const coverCenterY = PAGE_HEIGHT / 2;

    // Logo - positioned higher to avoid overlap
    if (fs.existsSync(logoPath)) {
      const logoWidth = 100;
      const logoY = coverCenterY - 180;
      doc.image(logoPath, (PAGE_WIDTH - logoWidth) / 2, logoY, {
        width: logoWidth,
      });
    }

    // Report title - positioned lower to avoid logo overlap
    const titleY = coverCenterY - 40;
    doc
      .font('Helvetica-Bold')
      .fontSize(28)
      .fillColor('#0F1A2B')
      .text('AUDIT REPORT', MARGIN, titleY, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 });

    // Audit name
    doc
      .font('Helvetica')
      .fontSize(18)
      .fillColor('#334155')
      .text(audit.auditName, MARGIN, titleY + 45, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 });

    // Generated date
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor('#64748b')
      .text(`Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`, MARGIN, titleY + 80, { align: 'center', width: PAGE_WIDTH - MARGIN * 2 });

    // Horizontal rule
    doc
      .moveTo(MARGIN, titleY + 110)
      .lineTo(PAGE_WIDTH - MARGIN, titleY + 110)
      .lineWidth(1)
      .strokeColor('#cbd5e1')
      .stroke();

    // Cover page footer – system name
    doc.fillColor('#000000');
    this.drawFooter(doc, SYSTEM_NAME);

    // ──────────────────────────────────────────────────────────────
    // PAGE 2 onward – reset colour and font for body text
    // ──────────────────────────────────────────────────────────────
    doc.addPage();
    doc.fillColor('#000000').font('Helvetica');

    // Draw footer on the first body page (page 2) that was just added
    this.drawFooter(doc, SYSTEM_NAME);

    // Track current Y position and manage pagination properly
    let currentY = doc.y;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > PAGE_HEIGHT - 80) {
        doc.addPage();
        currentY = doc.y;
        this.drawFooter(doc, SYSTEM_NAME);
        return true;
      }
      return false;
    };

    // ──────────────────────────────────────────────────────────────
    // SECTION 1 – EXECUTIVE SUMMARY  (first section after cover)
    // ──────────────────────────────────────────────────────────────
    const actionPlansSummaryForExec = audit.findings?.flatMap(f => f.actionPlans || []) || [];
    let totalEvidenceForExec = 0;
    audit.auditPrograms?.forEach(program => { totalEvidenceForExec += program.evidence?.length || 0; });

    checkPageBreak(100);
    this.drawHeading(doc, '1. Executive Summary');
    currentY = doc.y + 10;
    doc.fontSize(12);
    doc.text(`Audit:              ${audit.auditName}`);
    currentY = doc.y + 5;
    doc.text(`Status:             ${audit.status}`);
    currentY = doc.y + 5;
    doc.text(`Audit Period:       ${audit.startDate ? new Date(audit.startDate).toDateString() : 'N/A'} — ${audit.endDate ? new Date(audit.endDate).toDateString() : 'N/A'}`);
    currentY = doc.y + 5;
    doc.text(`Audit Manager:      ${audit.assignedManager?.name || 'Unassigned'}`);
    currentY = doc.y + 5;
    doc.text(`Assigned Auditor(s): ${audit.assignedAuditors?.map(a => a.name).join(', ') || 'Unassigned'}`);
    currentY = doc.y + 10;
    doc.text(`Programs Completed: ${audit.auditPrograms?.filter(p => p.actualResult === 'Completed').length || 0} of ${audit.auditPrograms?.length || 0}`);
    currentY = doc.y + 5;
    doc.text(`Findings Identified: ${audit.findings?.length || 0} total findings`);
    currentY = doc.y + 5;
    doc.text(`Action Plans Required: ${actionPlansSummaryForExec.length} remediation items`);
    currentY = doc.y + 5;
    doc.text(`Evidence Collected:  ${totalEvidenceForExec} evidence files`);
    currentY = doc.y + 15;

    // ──────────────────────────────────────────────────────────────
    // SECTION 2 – GENERAL INFORMATION
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(80);
    this.drawHeading(doc, '2. General Information');
    currentY = doc.y + 10;
    doc.fontSize(12);
    doc.text(`Audit Type:      ${audit.auditType}`);
    currentY = doc.y + 5;
    doc.text(`Business Entity: ${audit.auditUniverse?.entityName || 'N/A'} (${audit.auditUniverse?.entityType || 'N/A'})`);
    currentY = doc.y + 5;
    if (audit.auditUniverse?.owner) {
      doc.text(`Entity Owner:    ${audit.auditUniverse.owner?.name || 'N/A'} (${audit.auditUniverse.owner?.email || 'N/A'})`);
      currentY = doc.y + 5;
    }
    if ((audit.auditUniverse as any)?.riskRating) {
      doc.text(`Entity Risk Rating: ${(audit.auditUniverse as any).riskRating}`);
      currentY = doc.y + 5;
    }
    if (audit.chiefAuditorComments) {
      currentY = doc.y + 5;
      doc.font('Helvetica-Bold').text('Chief Auditor Comments:');
      currentY = doc.y + 5;
      doc.font('Helvetica').text(audit.chiefAuditorComments);
      currentY = doc.y + 10;
    }

    // ──────────────────────────────────────────────────────────────
    // SECTION 3 – AUDIT PROGRAMS & REVIEWER COMMENTS
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(100);
    this.drawHeading(doc, '3. Audit Programs');
    currentY = doc.y + 10;
    if (audit.auditPrograms && audit.auditPrograms.length > 0) {
      audit.auditPrograms.forEach((program, index) => {
        checkPageBreak(80);
        // Sub-heading for each program (bold, underlined via Helvetica-Bold + underline)
        doc.font('Helvetica-Bold').fontSize(12).text(`${index + 1}. ${program.procedureName}`, { underline: true });
        currentY = doc.y + 5;
        doc.font('Helvetica').fontSize(10);

        doc.text(`   Control Reference:     ${program.controlReference || 'N/A'}`);
        currentY = doc.y + 3;
        doc.text(`   Expected Outcome:      ${program.expectedOutcome || 'N/A'}`);
        currentY = doc.y + 3;
        doc.text(`   Actual Result:         ${program.actualResult || 'In Progress'}`);
        currentY = doc.y + 5;

        // Reviewer comment
        if (program.reviewerComment) {
          doc.font('Helvetica-Bold').text('   Reviewer Comment:', { continued: false });
          doc.font('Helvetica').fillColor('#1e3a5f').text(`   "${program.reviewerComment}"`).fillColor('#000000');
          currentY = doc.y + 5;
        }

        // Control Mappings
        if (program.controlMappings && program.controlMappings.length > 0) {
          doc.font('Helvetica-Bold').text('   Control Mappings:');
          currentY = doc.y + 3;
          doc.font('Helvetica');
          program.controlMappings.forEach((mapping: any) => {
            const fwName = mapping.framework?.frameworkName || 'Unnamed Framework';
            doc.text(`     - ${fwName} : ${mapping.coverageStatus}`);
            currentY = doc.y + 3;
          });
        } else {
          doc.text('   Control Mappings: None');
          currentY = doc.y + 3;
        }

        // Evidence summary for program
        const evidenceCount = program.evidence?.length || 0;
        doc.text(`   Evidence Files: ${evidenceCount}`);
        currentY = doc.y + 3;
        if (evidenceCount > 0) {
          program.evidence.forEach((ev: any, ei: number) => {
            if (ei < 5) { // Limit to first 5 evidence files to save space
              doc.fontSize(9).text(`     ${ei + 1}. ${ev.fileName} (Uploaded by: ${ev.uploadedBy?.name || 'Unknown'})`);
              currentY = doc.y + 2;
            }
          });
          if (evidenceCount > 5) {
            doc.fontSize(9).text(`     ... and ${evidenceCount - 5} more files`);
            currentY = doc.y + 2;
          }
        }

        doc.fontSize(10);
        currentY = doc.y + 10;
      });
    } else {
      doc.fontSize(12).text('No audit programs defined.');
      currentY = doc.y + 10;
    }

    // ──────────────────────────────────────────────────────────────
    // SECTION 4 – DETAILED FINDINGS
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(100);
    this.drawHeading(doc, '4. Detailed Findings');
    currentY = doc.y + 10;
    if (audit.findings && audit.findings.length > 0) {
      audit.findings.forEach((finding, index) => {
        checkPageBreak(80);
        doc.font('Helvetica-Bold').fontSize(12).text(`${index + 1}. ${finding.description} (${finding.severity})`);
        currentY = doc.y + 5;
        doc.font('Helvetica').fontSize(10);
        doc.text(`   Status: ${finding.status}`);
        currentY = doc.y + 3;
        if (finding.rootCause) {
          doc.text(`   Root Cause: ${finding.rootCause}`);
          currentY = doc.y + 3;
        }

        // Action Plans
        if (finding.actionPlans && finding.actionPlans.length > 0) {
          finding.actionPlans.forEach((plan, planIndex) => {
            doc.font('Helvetica-Bold').text(`   Action Plan ${planIndex + 1}:`);
            currentY = doc.y + 3;
            doc.font('Helvetica');
            doc.text(`     Description: ${plan.description}`);
            currentY = doc.y + 3;
            doc.text(`     Assigned To: ${plan.owner?.name || 'Unassigned'}`);
            currentY = doc.y + 3;
            doc.text(`     Due Date:    ${plan.dueDate ? new Date(plan.dueDate).toDateString() : 'Not Set'}`);
            currentY = doc.y + 3;
            doc.text(`     Status:      ${plan.status}`);
            currentY = doc.y + 3;
            doc.text(`     Created:     ${new Date(plan.createdAt).toDateString()}`);
            currentY = doc.y + 3;
            if (planIndex < finding.actionPlans.length - 1) {
              doc.text('');
              currentY = doc.y + 3;
            }
          });
        } else {
          doc.fontSize(10).text('   No action plans assigned.');
          currentY = doc.y + 5;
        }

        currentY = doc.y + 10;
      });
    } else {
      doc.fontSize(12).text('No findings identified.');
      currentY = doc.y + 10;
    }

    // ──────────────────────────────────────────────────────────────
    // SECTION 5 – ACTION PLANS SUMMARY
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(120);
    this.drawHeading(doc, '5. Action Plans Summary');
    currentY = doc.y + 10;
    const actionPlansSummary = audit.findings?.flatMap(f => f.actionPlans || []) || [];
    if (actionPlansSummary.length > 0) {
      const totalPlans = actionPlansSummary.length;
      const openPlans = actionPlansSummary.filter(p => p.status === 'Open').length;
      const inProgressPlans = actionPlansSummary.filter(p => p.status === 'In Progress').length;
      const completedPlans = actionPlansSummary.filter(p => p.status === 'Completed').length;
      const overdueCount = actionPlansSummary.filter(p => p.dueDate && new Date(p.dueDate) < new Date()).length;

      doc.fontSize(12).text(`Total Action Plans: ${totalPlans}`);
      currentY = doc.y + 5;
      doc.text(`Open: ${openPlans} | In Progress: ${inProgressPlans} | Completed: ${completedPlans}`);
      currentY = doc.y + 5;
      doc.text(`Overdue: ${overdueCount}`);
      currentY = doc.y + 10;

      // By Status
      doc.font('Helvetica-Bold').fontSize(12).text('By Status:', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      doc.text(`  Open: ${openPlans} plans`);
      currentY = doc.y + 3;
      doc.text(`  In Progress: ${inProgressPlans} plans`);
      currentY = doc.y + 3;
      doc.text(`  Completed: ${completedPlans} plans`);
      currentY = doc.y + 3;
      doc.text(`  Overdue: ${overdueCount} plans`);
      currentY = doc.y + 10;

      // By Assignee
      doc.font('Helvetica-Bold').fontSize(12).text('By Assignee:', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      const plansByAssignee = actionPlansSummary.reduce((acc: any, plan: any) => {
        const assignee = plan.owner?.name || 'Unassigned';
        if (!acc[assignee]) acc[assignee] = [];
        acc[assignee].push(plan);
        return acc;
      }, {});
      Object.entries(plansByAssignee).forEach(([assignee, plans]: [string, any]) => {
        doc.text(`  ${assignee}: ${plans.length} plans`);
        currentY = doc.y + 3;
      });
      currentY = doc.y + 10;

      // Overdue list
      if (overdueCount > 0) {
        doc.font('Helvetica-Bold').fontSize(12).text('Overdue Items:', { underline: true });
        currentY = doc.y + 5;
        doc.font('Helvetica').fontSize(10);
        actionPlansSummary
          .filter((p: any) => p.dueDate && new Date(p.dueDate) < new Date())
          .forEach((plan: any) => {
            doc.text(`  ${plan.description} — ${plan.owner?.name || 'Unassigned'} (Due: ${new Date(plan.dueDate).toDateString()})`);
            currentY = doc.y + 3;
          });
        currentY = doc.y + 10;
      }
    } else {
      doc.fontSize(12).text('No action plans defined.');
      currentY = doc.y + 10;
    }

    // ──────────────────────────────────────────────────────────────
    // SECTION 6 – EVIDENCE SUMMARY
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(60);
    this.drawHeading(doc, '6. Evidence Summary');
    currentY = doc.y + 10;
    let totalEvidence = 0;
    audit.auditPrograms?.forEach(program => { totalEvidence += program.evidence?.length || 0; });
    doc.fontSize(12).text(`Total Evidence Files Uploaded: ${totalEvidence}`);
    currentY = doc.y + 15;

    // ──────────────────────────────────────────────────────────────
    // SECTION 7 – REMEDIATION STATUS SUMMARY
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(120);
    this.drawHeading(doc, '7. Remediation Status Summary');
    currentY = doc.y + 10;
    if (actionPlansSummary.length > 0) {
      const remediationStats = {
        total: actionPlansSummary.length,
        completed: actionPlansSummary.filter(p => p.status === 'Completed').length,
        inProgress: actionPlansSummary.filter(p => p.status === 'In Progress').length,
        overdue: actionPlansSummary.filter(p => p.dueDate && new Date(p.dueDate) < new Date()).length,
        onTime: actionPlansSummary.filter(p => p.dueDate && new Date(p.dueDate) >= new Date()).length,
      };

      doc.fontSize(12).text(`Total Remediation Items: ${remediationStats.total}`);
      currentY = doc.y + 5;
      doc.text(`Completion Rate:       ${Math.round((remediationStats.completed / remediationStats.total) * 100)}%`);
      currentY = doc.y + 5;
      doc.text(`On-Time Completion:    ${Math.round((remediationStats.onTime / remediationStats.total) * 100)}%`);
      currentY = doc.y + 5;
      doc.text(`Overdue Items:         ${remediationStats.overdue} (${Math.round((remediationStats.overdue / remediationStats.total) * 100)}%)`);
      currentY = doc.y + 10;

      // Timeline
      doc.font('Helvetica-Bold').fontSize(12).text('Remediation Timeline (latest 5):', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      const sortedPlans = [...actionPlansSummary].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      sortedPlans.slice(0, 5).forEach((plan: any, index: number) => {
        doc.text(`  ${index + 1}. ${plan.description} — Created: ${new Date(plan.createdAt).toDateString()}`);
        currentY = doc.y + 3;
      });
      currentY = doc.y + 10;

      // Risk-Based Findings
      const highRisk = audit.findings?.filter(f => f.severity === 'High' || f.severity === 'Critical').length || 0;
      const mediumRisk = audit.findings?.filter(f => f.severity === 'Medium').length || 0;
      const lowRisk = audit.findings?.filter(f => f.severity === 'Low').length || 0;

      doc.font('Helvetica-Bold').fontSize(12).text('Risk-Based Findings:', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      doc.text(`  Critical / High Risk: ${highRisk} findings`);
      currentY = doc.y + 3;
      doc.text(`  Medium Risk:          ${mediumRisk} findings`);
      currentY = doc.y + 3;
      doc.text(`  Low Risk:             ${lowRisk} findings`);
      currentY = doc.y + 10;
    } else {
      doc.fontSize(12).text('No remediation activities defined.');
      currentY = doc.y + 10;
    }

    // End the document to properly close the PDF stream
    doc.end();
  }

  async generatePDF(auditId: number, res: Response) {
    const audit = await this.getAuditReportData(auditId);
    const doc = new PDFDocument({ margins: { top: 50, bottom: 60, left: 50, right: 50 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Audit_Report_${auditId}.pdf`);

    doc.pipe(res);
    
    // Wait for PDF to finish generating before ending response
    await new Promise<void>((resolve, reject) => {
      doc.on('end', () => {
        resolve();
      });
      
      doc.on('error', (error) => {
        reject(error);
      });

      this.buildPDF(doc, audit);
    });

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
    const doc = new PDFDocument({ margins: { top: 50, bottom: 60, left: 50, right: 50 } });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Wait for PDF to finish generating and file to be written
    await new Promise<void>((resolve, reject) => {
      doc.on('end', () => {
        resolve();
      });
      
      doc.on('error', (error) => {
        reject(error);
      });

      writeStream.on('error', reject);
      
      this.buildPDF(doc, audit);
    });

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

    // Report generation no longer changes audit status - audit remains Finalized for Chief Auditor review

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

