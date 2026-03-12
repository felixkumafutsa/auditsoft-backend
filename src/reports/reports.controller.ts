import { Controller, Get, Param, Res, UseGuards, Request, Body, Post } from '@nestjs/common';
import { ReportsService, GenerateCustomReportDto } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post('custom')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async generateCustomReport(@Body() dto: GenerateCustomReportDto, @Res() res: express.Response, @Request() req) {
    return this.reportsService.generateCustomReport(dto, res, req.user);
  }

  @Get('executive')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Board Member')
  getExecutiveReport() {
    return this.reportsService.getExecutiveReport();
  }

  @Get('operational')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  getOperationalReports() {
    return this.reportsService.getOperationalReports();
  }

  @Get('dashboard')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Auditor', 'Board Member')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('list')
  @Roles('Audit Manager', 'Chief Auditor', 'System Administrator')
  async getReportsList(@Param() params, @Request() req) {
    return this.reportsService.getReportsList(req?.user);
  }

  @Get('tabbed-list')
  @Roles('Audit Manager', 'Chief Auditor', 'System Administrator')
  async getTabbedReportsList(@Request() req) {
    return this.reportsService.getTabbedReportsList(req?.user);
  }

  @Get('custom-reports')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async getCustomReports(@Request() req) {
    return this.reportsService.getCustomReports(req?.user);
  }

  @Get('custom-reports/templates')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async getCustomReportTemplates(@Request() req) {
    return this.reportsService.getCustomReportTemplates(req?.user);
  }

  @Get('custom-reports/:id/download')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async downloadCustomReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.downloadCustomReport(+id, res);
  }

  @Post('custom-reports/:id/share')
  @Roles('Chief Auditor', 'System Administrator', 'Audit Manager')
  async shareCustomReport(@Param('id') id: string, @Body() body: { email: string, message?: string }, @Request() req) {
    return this.reportsService.shareCustomReport(+id, body.email, body.message, req.user);
  }

  @Post('custom/save')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async saveCustomReport(@Body() data: any, @Request() req) {
    return this.reportsService.saveCustomReport({
      title: data.name || data.title || 'Custom Report', // Handle both name and title from frontend
      description: data.description,
      reportData: JSON.stringify({
        fields: data.fields,
        filters: data.filters
      }),
      reportType: 'custom',
      auditId: null,
      generatedBy: req.user?.id || req.user?.sub,
      filePath: null,
      fileType: null,
      fileSize: null,
      isTemplate: false,
      templateName: data.templateName
    });
  }

  @Get('saved')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async getSavedReports(@Request() req) {
    return this.reportsService.getCustomReports(req?.user);
  }

  @Get('audit/:id/preview')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Auditor')
  async previewAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, false);
  }

  @Get('audit/:id/file')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Auditor')
  async downloadAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, true);
  }

  @Post('audit/:id/save')
  @Roles('System Administrator', 'Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)')
  async saveAuditReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.saveReport(+id, req.user);
  }

  @Post('audit/:id/share')
  @Roles('Chief Auditor', 'System Administrator', 'Audit Manager')
  async shareAuditReport(@Param('id') id: string, @Body() body: { email: string, message?: string }, @Request() req) {
    return this.reportsService.shareAuditReport(+id, body.email, body.message, req.user);
  }

  @Get('audit/:id/pdf')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Auditor')
  async downloadAuditReportPDF(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, true);
  }

  @Get('audit/:id/docx')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Auditor')
  async downloadAuditReportWord(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generateWord(+id, res);
  }

  // New endpoints for Chief Auditor report management
  @Post('audit/:id/generate-enhanced')
  @Roles('System Administrator', 'Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)')
  async generateEnhancedReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.generateEnhancedReport(+id, req.user);
  }

  @Post('audit/:id/finalize-report')
  @Roles('System Administrator', 'Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)')
  async finalizeReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.finalizeReport(+id, req.user);
  }

  @Get('audit/:id/report-status')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async getReportStatus(@Param('id') id: string) {
    return this.reportsService.getReportStatus(+id);
  }
}
