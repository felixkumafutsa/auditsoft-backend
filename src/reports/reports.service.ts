import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { Response, Request } from 'express';
import { NotificationService } from '../notification/notification.service';
import * as fs from 'fs';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

import { IsArray, IsString, IsOptional, ValidateNested, IsIn, IsBoolean } from 'class-validator';
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

  @IsOptional()
  auditIds?: number[]; // Specific audits to include

  @IsString()
  @IsIn(['pdf', 'csv'])
  format: 'pdf' | 'csv';

  @IsOptional()
  @IsString()
  title?: string; // Report title

  @IsOptional()
  @IsString()
  description?: string; // Report description

  @IsOptional()
  @IsBoolean()
  saveAsTemplate?: boolean; // Whether to save as template

  @IsOptional()
  @IsString()
  templateName?: string; // Name if saving as template

  @IsOptional()
  @IsBoolean()
  saveReport?: boolean; // Whether to save the generated report
}

@Injectable()
export class ReportsService {
  private emailTransporter: nodemailer.Transporter | null;

  constructor(
    private prisma: PrismaService,
    private notificationService?: NotificationService
  ) {
    // Initialize email transporter only if credentials are available
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.log('Email credentials not configured. Email sharing will be logged only.');
      this.emailTransporter = null;
    }
  }

  // ... existing methods ...

  async generateCustomReport(dto: GenerateCustomReportDto, res: Response, user?: any) {
    // 1. Fetch Data
    const where: any = {};
    
    // Handle specific audit IDs
    if (dto.auditIds && dto.auditIds.length > 0) {
      where.id = { in: dto.auditIds };
    }
    
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
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Generate Output
    let filePath: string | undefined;
    let fileSize: number | undefined;
    
    if (dto.format === 'csv') {
      const csvData = await this.generateCustomCSVBuffer(audits, dto.fields);
      if (dto.saveReport) {
        filePath = await this.saveReportFile(csvData, 'csv', dto.title || 'Custom Report');
        fileSize = csvData.length;
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=Custom_Report_${Date.now()}.csv`);
      res.send(csvData);
    } else {
      const pdfBuffer = await this.generateCustomPDFBuffer(audits, dto.fields, dto.title);
      if (dto.saveReport) {
        filePath = await this.saveReportFile(pdfBuffer, 'pdf', dto.title || 'Custom Report');
        fileSize = pdfBuffer.length;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Custom_Report_${Date.now()}.pdf`);
      res.send(pdfBuffer);
    }

    // 3. Save report configuration and/or template
    if (dto.saveReport || dto.saveAsTemplate) {
      await this.saveCustomReport({
        title: dto.title || 'Custom Report',
        description: dto.description,
        reportData: JSON.stringify({
          fields: dto.fields,
          filters: dto.filters,
          auditIds: dto.auditIds,
          format: dto.format
        }),
        reportType: dto.saveAsTemplate ? 'template' : 'custom',
        auditId: dto.auditIds?.[0] || null,
        generatedBy: user?.id || user?.sub,
        filePath,
        fileType: dto.format,
        fileSize,
        isTemplate: dto.saveAsTemplate || false,
        templateName: dto.templateName
      });
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

  private async generateCustomCSVBuffer(data: any[], fields: string[]): Promise<Buffer> {
    const headers = fields.map(f => this.getFieldLabel(f)).join(',');
    const rows = data.map(row => {
      return fields.map(field => {
        let val = this.getFieldValue(row, field);
        return `"${String(val || '').replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    return Buffer.from(csvContent, 'utf-8');
  }

  private async saveReportFile(buffer: Buffer, fileType: string, title: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${fileType}`;
    const filePath = path.join(process.cwd(), 'uploads', 'reports', fileName);
    
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  async saveCustomReport(reportData: any): Promise<any> {
    return this.prisma.customReport.create({
      data: reportData
    });
  }

  async getTabbedReportsList(user?: any) {
    const [auditReports, customReports, templates] = await Promise.all([
      this.getReportsList(user),
      this.getCustomReports(user),
      this.getCustomReportTemplates(user)
    ]);

    return {
      auditReports: auditReports || [],
      customReports: customReports || [],
      templates: templates || []
    };
  }

  async getCustomReports(user?: any) {
    return this.prisma.customReport.findMany({
      where: {
        isTemplate: false,
        ...(user?.role !== 'System Administrator' && { generatedBy: user?.id || user?.sub })
      },
      include: {
        generator: {
          select: { name: true, email: true }
        },
        audit: {
          select: { auditName: true, status: true }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });
  }

  async getCustomReportTemplates(user?: any) {
    return this.prisma.customReport.findMany({
      where: {
        isTemplate: true,
        ...(user?.role !== 'System Administrator' && { generatedBy: user?.id || user?.sub })
      },
      include: {
        generator: {
          select: { name: true, email: true }
        },
        audit: {
          select: { auditName: true, status: true }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });
  }

  async downloadCustomReport(id: number, res: Response) {
    const report = await this.prisma.customReport.findUnique({
      where: { id }
    });

    if (!report || !report.filePath) {
      throw new NotFoundException('Custom report not found');
    }

    if (!fs.existsSync(report.filePath)) {
      throw new NotFoundException('Report file not found on server');
    }

    const fileBuffer = fs.readFileSync(report.filePath);
    
    res.setHeader('Content-Type', this.getContentType(report.fileType || 'pdf'));
    res.setHeader('Content-Disposition', `attachment; filename="${report.title}.${report.fileType || 'pdf'}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    
    res.send(fileBuffer);
  }

  private async generatePDFBuffer(auditId: number): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      const buffers: Buffer[] = [];
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Generate PDF content (await the content generation)
      await this.generatePDFContent(doc, auditId);
      doc.end();
    });
  }

  private async generatePDFContent(doc: any, auditId: number) {
    try {
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
        include: {
          assignedManager: {
            select: { name: true, email: true }
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
              }
            }
          }
        }
      });

      if (!audit) {
        throw new Error('Audit not found');
      }

      // PDF Content Generation
      doc.fontSize(20).text('Audit Report', { align: 'center' });
      doc.moveDown();
      
      doc.fontSize(14).text(`Audit Name: ${audit.auditName}`);
      doc.text(`Status: ${audit.status}`);
      doc.text(`Risk Level: ${audit.riskLevel || 'Not specified'}`);
      doc.fontSize(14).text(`Manager: ${audit.assignedManager?.name || 'Not assigned'}`);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`);
      doc.moveDown();

      doc.fontSize(16).text('Executive Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(12).text('Audit objectives and scope information would be displayed here.');
      doc.moveDown();

      doc.fontSize(16).text('Audit Programs', { underline: true });
      doc.moveDown();
      
      if (audit.auditPrograms && audit.auditPrograms.length > 0) {
        audit.auditPrograms.forEach((program: any, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${program.procedureName || `Program ${index + 1}`}`);
          if (program.expectedOutcome) {
            doc.text(`   Expected Outcome: ${program.expectedOutcome}`);
          }
          if (program.findings && program.findings.length > 0) {
            doc.text(`   Findings: ${program.findings.length} identified`);
          }
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(12).text('No audit programs found.');
      }

    } catch (error) {
      doc.fontSize(12).text('Error generating PDF content');
      console.error('PDF generation error:', error);
    }
  }

  async shareCustomReport(id: number, email: string, message?: string, user?: any) {
    try {
      const report = await this.prisma.customReport.findUnique({
        where: { id },
        include: {
          generator: {
            select: { name: true, email: true }
          }
        }
      });

      if (!report) {
        throw new NotFoundException('Custom report not found');
      }

      // Create email content
      const emailSubject = `Custom Report: ${report.title}`;
      const emailBody = message || 
        `Please find the attached custom report "${report.title}". This report contains important audit information that requires your attention.`;

      // Send email with attachment
      if (this.emailTransporter) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: emailSubject,
            text: emailBody,
            attachments: [
              {
                filename: `Custom_Report_${report.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
                content: report.filePath ? fs.readFileSync(report.filePath) : Buffer.from(''),
                contentType: 'application/pdf'
              }
            ]
          };

          await this.emailTransporter.sendMail(mailOptions);
          console.log('Custom report email sent successfully to:', email);
        } catch (emailError) {
          console.error('Failed to send custom report email:', emailError);
          console.log('Email sharing failed, but notification will be created.');
        }
      } else {
        console.log('=== CUSTOM REPORT EMAIL SHARING LOGGED (No Email Configured) ===');
        console.log('Report ID:', id);
        console.log('Report Title:', report.title);
        console.log('To:', email);
        console.log('Subject:', emailSubject);
        console.log('Body:', emailBody);
        console.log('Shared by:', user?.name || user?.email || 'Chief Auditor');
        console.log('============================================================');
      }

      // Create notification if notification service exists
      if (this.notificationService) {
        await this.notificationService.create({
          userId: user.id || user.sub,
          title: 'Custom Report Shared Successfully',
          message: `The custom report "${report.title}" has been successfully shared with ${email}.`,
          type: 'info',
        });
      }

      return {
        success: true,
        message: `Custom report successfully shared with ${email}`,
        details: {
          reportTitle: report.title,
          recipientEmail: email,
          sharedAt: new Date(),
          sharedBy: user?.name || user?.email || 'Chief Auditor'
        }
      };
    } catch (error) {
      console.error('Error sharing custom report:', error);
      throw new InternalServerErrorException('Failed to share custom report');
    }
  }

  private getContentType(fileType: string): string {
    const types: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'csv': 'text/csv',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return types[fileType] || 'application/octet-stream';
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

  private async generateCustomPDFBuffer(data: any[], fields: string[], title?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];
      const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Title
      doc.fontSize(18).text(title || 'Custom Audit Report', { align: 'center' });
      doc.moveDown();

      // Table headers
      const headers = fields.map(f => this.getFieldLabel(f));
      const tableTop = doc.y;
      const itemHeight = 20;
      const tableWidth = doc.page.width - 60;
      const columnWidth = tableWidth / headers.length;

      // Draw headers
      doc.fontSize(10).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, 30 + i * columnWidth, tableTop, { width: columnWidth - 5 });
      });

      // Draw data
      doc.fontSize(9).font('Helvetica');
      data.forEach((row, rowIndex) => {
        const y = tableTop + itemHeight + (rowIndex * itemHeight);
        if (y > doc.page.height - 50) {
          doc.addPage();
        }
        
        fields.forEach((field, colIndex) => {
          const value = this.getFieldValue(row, field);
          doc.text(value, 30 + colIndex * columnWidth, y, { width: columnWidth - 5 });
        });
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
    const [audits, findings, users, reports] = await Promise.all([
      this.prisma.audit.count(),
      this.prisma.finding.count({ 
        where: { 
          status: { 
            notIn: ['Closed', 'Remediated'] 
          } 
        } 
      }),
      this.prisma.user.count(),
      this.prisma.report.count(),
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
      totalReports: reports,
      auditTrend: trendData,
      auditStatusDistribution: auditStatus.map(s => ({ name: s.status, value: s._count.status }))
    };
  }

  async getReportsList(user: any) {
    // Get all reports and categorize them into tabs
    const auditReports = await this.prisma.report.findMany({
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

    // Transform audit reports
    const transformedAuditReports = auditReports.map(report => ({
      id: report.id,
      auditId: report.auditId,
      title: report.title,
      auditName: report.audit.auditName,
      auditStatus: report.audit.status,
      generatedBy: report.generator.name,
      generatedAt: report.generatedAt,
      fileUrl: report.fileUrl,
      fileType: report.fileType,
      type: 'audit_report'
    }));

    // Mock custom reports (would come from a SavedReport table in production)
    const customReports = [
      {
        id: 'custom_1',
        title: 'Quarterly Risk Summary',
        description: 'Custom report template for quarterly risk assessment',
        generatedAt: new Date('2024-01-15'),
        type: 'custom_report',
        fields: ['riskLevel', 'auditName', 'status', 'assignedManager']
      },
      {
        id: 'custom_2', 
        title: 'Audit Progress Dashboard',
        description: 'Real-time audit progress tracking template',
        generatedAt: new Date('2024-02-20'),
        type: 'custom_report',
        fields: ['auditName', 'status', 'startDate', 'endDate', 'completion']
      }
    ];

    // Mock report templates
    const reportTemplates = [
      {
        id: 'template_1',
        name: 'Standard Audit Report Template',
        description: 'Comprehensive audit report with all sections',
        category: 'audit',
        fields: ['auditPlan', 'auditPrograms', 'findings', 'actionPlans', 'executiveSummary']
      },
      {
        id: 'template_2',
        name: 'Executive Summary Template',
        description: 'Brief executive summary report',
        category: 'executive',
        fields: ['auditName', 'status', 'keyFindings', 'recommendations']
      },
      {
        id: 'template_3',
        name: 'Financial Audit Template',
        description: 'Specialized template for financial audits',
        category: 'financial',
        fields: ['financialData', 'compliance', 'riskAssessment', 'findings']
      }
    ];

    return {
      auditReports: transformedAuditReports,
      customReports,
      reportTemplates
    };
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
            findings: {
              include: {
                actionPlans: {
                  include: {
                    owner: true
                  }
                }
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
    // SECTION 2 – AUDIT PLAN DETAILS
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(120);
    this.drawHeading(doc, '2. Audit Plan Details');
    currentY = doc.y + 10;
    doc.fontSize(12);
    
    // Basic Audit Information
    doc.font('Helvetica-Bold').text('Basic Information:', { underline: true });
    currentY = doc.y + 5;
    doc.font('Helvetica').fontSize(10);
    doc.text(`Audit Name:        ${audit.auditName}`);
    currentY = doc.y + 3;
    doc.text(`Audit Type:        ${audit.auditType}`);
    currentY = doc.y + 3;
    doc.text(`Status:            ${audit.status}`);
    currentY = doc.y + 3;
    doc.text(`Audit Period:      ${audit.startDate ? new Date(audit.startDate).toLocaleDateString() : 'N/A'} - ${audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'N/A'}`);
    currentY = doc.y + 10;
    
    // Strategic Planning Fields
    if (audit.riskScore !== undefined || audit.riskLevel || audit.priority || audit.quarter || audit.year) {
      doc.font('Helvetica-Bold').text('Strategic Planning:', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      if (audit.riskScore !== undefined) {
        doc.text(`Risk Score:        ${audit.riskScore}`);
        currentY = doc.y + 3;
      }
      if (audit.riskLevel) {
        doc.text(`Risk Level:        ${audit.riskLevel}`);
        currentY = doc.y + 3;
      }
      if (audit.priority) {
        doc.text(`Priority:          ${audit.priority}`);
        currentY = doc.y + 3;
      }
      if (audit.quarter) {
        doc.text(`Quarter:           ${audit.quarter}`);
        currentY = doc.y + 3;
      }
      if (audit.year) {
        doc.text(`Year:              ${audit.year}`);
        currentY = doc.y + 3;
      }
      currentY = doc.y + 10;
    }
    
    // Resource Allocation
    if (audit.resourceHours !== undefined || audit.budgetAllocation !== undefined) {
      doc.font('Helvetica-Bold').text('Resource Allocation:', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      if (audit.resourceHours !== undefined) {
        doc.text(`Resource Hours:    ${audit.resourceHours}`);
        currentY = doc.y + 3;
      }
      if (audit.budgetAllocation !== undefined) {
        doc.text(`Budget Allocation: $${audit.budgetAllocation.toLocaleString()}`);
        currentY = doc.y + 3;
      }
      currentY = doc.y + 10;
    }
    
    // Executive Approval
    if (audit.executiveApproval !== undefined || audit.executiveApprovedAt || audit.justification) {
      doc.font('Helvetica-Bold').text('Executive Approval:', { underline: true });
      currentY = doc.y + 5;
      doc.font('Helvetica').fontSize(10);
      doc.text(`Approval Status:   ${audit.executiveApproval ? 'Approved' : 'Pending'}`);
      currentY = doc.y + 3;
      if (audit.executiveApprovedAt) {
        doc.text(`Approved Date:     ${new Date(audit.executiveApprovedAt).toLocaleDateString()}`);
        currentY = doc.y + 3;
      }
      if (audit.executiveApprover) {
        doc.text(`Approved By:       ${audit.executiveApprover.name}`);
        currentY = doc.y + 3;
      }
      if (audit.justification) {
        doc.text(`Justification:     ${audit.justification}`);
        currentY = doc.y + 3;
      }
      currentY = doc.y + 10;
    }
    
    // Team Assignment
    doc.font('Helvetica-Bold').text('Team Assignment:', { underline: true });
    currentY = doc.y + 5;
    doc.font('Helvetica').fontSize(10);
    doc.text(`Audit Manager:     ${audit.assignedManager?.name || 'Unassigned'}`);
    currentY = doc.y + 3;
    if (audit.assignedManager?.email) {
      doc.text(`Manager Email:     ${audit.assignedManager.email}`);
      currentY = doc.y + 3;
    }
    doc.text(`Assigned Auditors: ${audit.assignedAuditors?.map(a => a.name).join(', ') || 'Unassigned'}`);
    currentY = doc.y + 10;

    // ──────────────────────────────────────────────────────────────
    // SECTION 3 – GENERAL INFORMATION
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(80);
    this.drawHeading(doc, '3. General Information');
    currentY = doc.y + 10;
    doc.fontSize(12);
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
    // SECTION 4 – AUDIT PROGRAMS & REVIEWER COMMENTS
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(100);
    this.drawHeading(doc, '4. Audit Programs');
    currentY = doc.y + 10;
    if (audit.auditPrograms && audit.auditPrograms.length > 0) {
      audit.auditPrograms.forEach((program, index) => {
        checkPageBreak(150);
        // Sub-heading for each program (bold, underlined via Helvetica-Bold + underline)
        doc.font('Helvetica-Bold').fontSize(12).text(`${index + 1}. ${program.procedureName}`, { underline: true });
        currentY = doc.y + 5;
        doc.font('Helvetica').fontSize(10);

        // Basic Program Information
        doc.text(`   Control Reference:     ${program.controlReference || 'N/A'}`);
        currentY = doc.y + 3;
        doc.text(`   Expected Outcome:      ${program.expectedOutcome || 'N/A'}`);
        currentY = doc.y + 3;
        doc.text(`   Actual Result:         ${program.actualResult || 'In Progress'}`);
        currentY = doc.y + 3;
        
        // Testing Methodology
        if (program.testMethod || program.samplingApproach || program.sampleSize !== undefined) {
          doc.font('Helvetica-Bold').text('   Testing Methodology:', { continued: false });
          currentY = doc.y + 3;
          doc.font('Helvetica');
          if (program.testMethod) {
            doc.text(`     Test Method:         ${program.testMethod}`);
            currentY = doc.y + 3;
          }
          if (program.samplingApproach) {
            doc.text(`     Sampling Approach:   ${program.samplingApproach}`);
            currentY = doc.y + 3;
          }
          if (program.sampleSize !== undefined) {
            doc.text(`     Sample Size:         ${program.sampleSize}`);
            currentY = doc.y + 3;
          }
        }
        
        // Documentation Requirements
        if (program.documentationReq || program.evidenceRequired) {
          doc.font('Helvetica-Bold').text('   Documentation Requirements:', { continued: false });
          currentY = doc.y + 3;
          doc.font('Helvetica');
          if (program.documentationReq) {
            doc.text(`     Documentation:       ${program.documentationReq}`);
            currentY = doc.y + 3;
          }
          if (program.evidenceRequired) {
            doc.text(`     Evidence Required:   ${program.evidenceRequired}`);
            currentY = doc.y + 3;
          }
        }
        
        // Step-by-Step Procedure
        if (program.stepByStepProcedure) {
          doc.font('Helvetica-Bold').text('   Step-by-Step Procedure:', { continued: false });
          currentY = doc.y + 3;
          doc.font('Helvetica').text(`     ${program.stepByStepProcedure}`);
          currentY = doc.y + 5;
        }
        
        // Confidence Level and Materiality
        if (program.confidenceLevel !== undefined || program.materialityThreshold !== undefined) {
          doc.font('Helvetica-Bold').text('   Quality Metrics:', { continued: false });
          currentY = doc.y + 3;
          doc.font('Helvetica');
          if (program.confidenceLevel !== undefined) {
            doc.text(`     Confidence Level:    ${(program.confidenceLevel * 100).toFixed(1)}%`);
            currentY = doc.y + 3;
          }
          if (program.materialityThreshold !== undefined) {
            doc.text(`     Materiality Threshold: $${program.materialityThreshold.toLocaleString()}`);
            currentY = doc.y + 3;
          }
        }

        // Reviewer comment - highlighted
        if (program.reviewerComment) {
          currentY = doc.y + 5;
          doc.font('Helvetica-Bold').fillColor('#1e3a5f').text('   Reviewer Comments:', { continued: false });
          currentY = doc.y + 3;
          doc.font('Helvetica').fillColor('#2563eb').text(`   "${program.reviewerComment}"`);
          currentY = doc.y + 5;
          doc.fillColor('#000000'); // Reset color
        }

        // Control Mappings
        if (program.controlMappings && program.controlMappings.length > 0) {
          doc.font('Helvetica-Bold').text('   Control Mappings:');
          currentY = doc.y + 3;
          doc.font('Helvetica');
          program.controlMappings.forEach((mapping: any) => {
            const fwName = mapping.framework?.frameworkName || 'Unnamed Framework';
            doc.text(`     - ${fwName} : ${mapping.coverageStatus || 'Mapped'}`);
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
    // SECTION 5 – DETAILED FINDINGS
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(100);
    this.drawHeading(doc, '5. Detailed Findings');
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
    // SECTION 6 – ACTION PLANS SUMMARY
    // ──────────────────────────────────────────────────────────────
    checkPageBreak(120);
    this.drawHeading(doc, '6. Action Plans Summary');
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
      if (this.notificationService) {
        await this.notificationService.create({
          userId,
          title: 'Report Generated',
          message: `New Audit Report generated for ${audit.auditName}. You can download it now.`,
          type: 'REPORT_GENERATED',
          link: `/reports/audit/${auditId}/pdf`
        });
      }
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
      if (this.notificationService) {
        await this.notificationService.create({
          userId,
          title: 'Audit Report Ready for Review',
          message: `Audit report for '${audit.auditName}' is ready. View it now.`,
          type: 'REPORT_READY',
          link: `/reports/audit/${auditId}/preview`,
        });
      }
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
      if (this.notificationService) {
        await this.notificationService.create({
          userId: chiefAuditor.id,
          title: 'Audit Report Ready',
          message: `Audit report for '${audit.auditName}' is ready to download.`,
          type: 'REPORT_READY',
          link: `/reports/audit/${auditId}/download`,
        });
      }
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

    const children: any[] = [
      // Title Section
      new Paragraph({
        text: `Audit Report: ${audit.auditName}`,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Generated: ${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }), // Spacer

      // Executive Summary
      new Paragraph({
        text: '1. Executive Summary',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: `Audit Status: ${audit.status}`,
      }),
      new Paragraph({
        text: `Audit Period: ${audit.startDate ? new Date(audit.startDate).toLocaleDateString() : 'N/A'} - ${audit.endDate ? new Date(audit.endDate).toLocaleDateString() : 'N/A'}`,
      }),
      new Paragraph({
        text: `Audit Manager: ${audit.assignedManager?.name || 'Unassigned'}`,
      }),
      new Paragraph({
        text: `Assigned Auditors: ${audit.assignedAuditors?.map(a => a.name).join(', ') || 'Unassigned'}`,
      }),
      new Paragraph({
        text: `Programs Completed: ${audit.auditPrograms?.filter(p => p.actualResult === 'Completed').length || 0} of ${audit.auditPrograms?.length || 0}`,
      }),
      new Paragraph({
        text: `Findings Identified: ${audit.findings?.length || 0}`,
      }),
      new Paragraph({ text: '' }),

      // Audit Plan Details
      new Paragraph({
        text: '2. Audit Plan Details',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: 'Basic Information',
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        text: `Audit Name: ${audit.auditName}`,
      }),
      new Paragraph({
        text: `Audit Type: ${audit.auditType}`,
      }),
      new Paragraph({
        text: `Status: ${audit.status}`,
      }),
    ];

    // Add strategic planning if available
    if (audit.riskScore !== undefined || audit.riskLevel || audit.priority) {
      children.push(
        new Paragraph({
          text: 'Strategic Planning',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (audit.riskScore !== undefined) {
        children.push(new Paragraph({ text: `Risk Score: ${audit.riskScore}` }));
      }
      if (audit.riskLevel) {
        children.push(new Paragraph({ text: `Risk Level: ${audit.riskLevel}` }));
      }
      if (audit.priority) {
        children.push(new Paragraph({ text: `Priority: ${audit.priority}` }));
      }
    }

    // Add resource allocation if available
    if (audit.resourceHours !== undefined || audit.budgetAllocation !== undefined) {
      children.push(
        new Paragraph({
          text: 'Resource Allocation',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (audit.resourceHours !== undefined) {
        children.push(new Paragraph({ text: `Resource Hours: ${audit.resourceHours}` }));
      }
      if (audit.budgetAllocation !== undefined && audit.budgetAllocation !== null) {
        children.push(new Paragraph({ text: `Budget Allocation: $${audit.budgetAllocation.toLocaleString()}` }));
      }
    }

    // Add executive approval if available
    if (audit.executiveApproval !== undefined || audit.executiveApprovedAt) {
      children.push(
        new Paragraph({
          text: 'Executive Approval',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: `Approval Status: ${audit.executiveApproval ? 'Approved' : 'Pending'}`,
        })
      );
      if (audit.executiveApprovedAt) {
        children.push(new Paragraph({ text: `Approved Date: ${new Date(audit.executiveApprovedAt).toLocaleDateString()}` }));
      }
      if (audit.executiveApprovedById && (audit as any).executiveApprover) {
        children.push(new Paragraph({ text: `Approved By: ${(audit as any).executiveApprover.name}` }));
      }
      if (audit.justification) {
        children.push(new Paragraph({ text: `Justification: ${audit.justification}` }));
      }
    }

    children.push(new Paragraph({ text: '' }));

    // General Information
    children.push(
      new Paragraph({
        text: '3. General Information',
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: `Business Entity: ${audit.auditUniverse?.entityName || 'N/A'} (${audit.auditUniverse?.entityType || 'N/A'})`,
      })
    );

    if (audit.chiefAuditorComments) {
      children.push(
        new Paragraph({
          text: 'Chief Auditor Comments',
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: audit.chiefAuditorComments,
        })
      );
    }

    children.push(new Paragraph({ text: '' }));

    // Audit Programs
    children.push(
      new Paragraph({
        text: '4. Audit Programs',
        heading: HeadingLevel.HEADING_1,
      })
    );

    if (audit.auditPrograms && audit.auditPrograms.length > 0) {
      audit.auditPrograms.forEach((program, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${program.procedureName}`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Control Reference: ${program.controlReference || 'N/A'}`,
          }),
          new Paragraph({
            text: `Expected Outcome: ${program.expectedOutcome || 'N/A'}`,
          }),
          new Paragraph({
            text: `Actual Result: ${program.actualResult || 'In Progress'}`,
          })
        );

        if (program.testMethod) {
          children.push(new Paragraph({ text: `Test Method: ${program.testMethod}` }));
        }
        if (program.samplingApproach) {
          children.push(new Paragraph({ text: `Sampling Approach: ${program.samplingApproach}` }));
        }
        if (program.sampleSize !== undefined) {
          children.push(new Paragraph({ text: `Sample Size: ${program.sampleSize}` }));
        }
        if (program.confidenceLevel !== undefined && program.confidenceLevel !== null) {
          children.push(new Paragraph({ text: `Confidence Level: ${(program.confidenceLevel * 100).toFixed(1)}%` }));
        }
        if (program.materialityThreshold !== undefined && program.materialityThreshold !== null) {
          children.push(new Paragraph({ text: `Materiality Threshold: $${program.materialityThreshold.toLocaleString()}` }));
        }
        if (program.documentationReq) {
          children.push(new Paragraph({ text: `Documentation Requirements: ${program.documentationReq}` }));
        }
        if (program.evidenceRequired) {
          children.push(new Paragraph({ text: `Evidence Required: ${program.evidenceRequired}` }));
        }
        if (program.stepByStepProcedure) {
          children.push(new Paragraph({ text: `Step-by-Step Procedure: ${program.stepByStepProcedure}` }));
        }
        if (program.reviewerComment) {
          children.push(
            new Paragraph({
              text: 'Reviewer Comments:',
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: program.reviewerComment,
            })
          );
        }
        children.push(new Paragraph({ text: '' }));
      });
    } else {
      children.push(new Paragraph({ text: 'No audit programs defined.' }));
    }

    // Findings
    children.push(
      new Paragraph({
        text: '5. Detailed Findings',
        heading: HeadingLevel.HEADING_1,
      })
    );

    if (audit.findings && audit.findings.length > 0) {
      audit.findings.forEach((finding, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${finding.description} (${finding.severity})`,
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Status: ${finding.status}`,
          })
        );

        if (finding.rootCause) {
          children.push(new Paragraph({ text: `Root Cause: ${finding.rootCause}` }));
        }

        if (finding.actionPlans && finding.actionPlans.length > 0) {
          finding.actionPlans.forEach((plan, planIndex) => {
            children.push(
              new Paragraph({
                text: `Action Plan ${planIndex + 1}:`,
                heading: HeadingLevel.HEADING_3,
              }),
              new Paragraph({
                text: `Description: ${plan.description}`,
              })
            );

            if (plan.dueDate) {
              children.push(new Paragraph({ text: `Due Date: ${new Date(plan.dueDate).toLocaleDateString()}` }));
            }
            children.push(
              new Paragraph({
                text: `Status: ${plan.status}`,
              })
            );

            if (plan.owner) {
              children.push(new Paragraph({ text: `Assigned To: ${plan.owner.name}` }));
            }
          });
        }
        children.push(new Paragraph({ text: '' }));
      });
    } else {
      children.push(new Paragraph({ text: 'No findings identified.' }));
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
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
      if (this.notificationService) {
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
      if (this.notificationService) {
        await this.notificationService.create({
          userId: chiefAuditor.id,
          title: 'Audit Report Pending Approval',
          message: `The audit report for '${audit.auditName}' has been saved by ${user.name || 'a Manager'} and is awaiting your approval.`,
          type: 'action_required',
          link: `/reports/audit/${auditId}/preview`,
        });
      }
    }

    return {
      success: true,
      message: 'Report saved successfully. Chief Auditor has been notified for approval.',
      report
    };
  }

  async shareAuditReport(auditId: number, email: string, message?: string, user?: any) {
    try {
      console.log('=== SHARE AUDIT REPORT DEBUG ===');
      console.log('Audit ID:', auditId);
      console.log('Email:', email);
      console.log('User:', user);
      
      // Get audit details
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
        include: {
          assignedManager: {
            select: { name: true, email: true }
          }
        }
      });

      if (!audit) {
        throw new NotFoundException('Audit not found');
      }

      console.log('Generating PDF...');
      const pdfBuffer = await this.generatePDFBuffer(auditId);
      
      // Create email content
      const emailSubject = `Audit Report: ${audit.auditName}`;
      const emailBody = message || 
        `Please find the attached audit report for "${audit.auditName}". This report contains important audit findings and recommendations that require your attention.`;

      // Send email with attachment
      if (this.emailTransporter) {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: emailSubject,
            text: emailBody,
            attachments: [
              {
                filename: `Audit_Report_${audit.auditName.replace(/[^a-z0-9]/gi, '_')}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
              }
            ]
          };

          await this.emailTransporter.sendMail(mailOptions);
          console.log('Email sent successfully to:', email);
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
          // Don't throw error, just log it and continue with notification
          console.log('Email sharing failed, but notification will be created.');
        }
      } else {
        console.log('=== EMAIL SHARING LOGGED (No Email Configured) ===');
        console.log('To:', email);
        console.log('Subject:', emailSubject);
        console.log('Body:', emailBody);
        console.log('Attachment:', `Audit_Report_${audit.auditName.replace(/[^a-z0-9]/gi, '_')}.pdf (${pdfBuffer.length} bytes)`);
        console.log('Shared by:', user?.name || user?.email || 'Chief Auditor');
        console.log('================================================');
      }

      // Create notification if notification service exists
      if (this.notificationService && user?.id) {
        await this.notificationService.create({
          userId: user.id || user.sub,
          title: 'Audit Report Shared Successfully',
          message: `The audit report for "${audit.auditName}" has been successfully shared with ${email}.`,
          type: 'info',
        });
      }

      return {
        success: true,
        message: `Audit report successfully shared with ${email}`,
        details: {
          auditName: audit.auditName,
          recipientEmail: email,
          sharedAt: new Date(),
          sharedBy: user?.name || user?.email || 'Chief Auditor'
        }
      };
    } catch (error) {
      console.error('Error sharing audit report:', error);
      throw new InternalServerErrorException('Failed to share audit report');
    }
  }
}

