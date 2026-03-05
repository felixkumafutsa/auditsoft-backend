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
  async generateCustomReport(@Body() dto: GenerateCustomReportDto, @Res() res: express.Response) {
    return this.reportsService.generateCustomReport(dto, res);
  }

  @Get('executive')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager', 'Board Member', 'Process Owner')
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

  @Get('audit/:id/pdf')
  @Roles('Chief Auditor', 'System Administrator', 'Audit Manager')
  async downloadAuditReportPDF(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generatePDF(+id, res);
  }

  @Get('audit/:id/docx')
  @Roles('Chief Auditor', 'System Administrator', 'Audit Manager')
  async downloadAuditReportWord(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generateWord(+id, res);
  }

  @Get('audit/:id/preview')
  @Roles('Manager', 'Audit Manager', 'Chief Auditor')
  async previewAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, false);
  }

  @Get('audit/:id/file')
  @Roles('Chief Auditor', 'System Administrator', 'Audit Manager')
  async downloadStoredAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, true);
  }

  @Post('custom/save')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async saveCustomReport(@Body() data: any) {
    // Mock save: Prisma schema doesn't have a SavedReport table yet
    return { success: true, message: 'Report template saved successfully (mock)' };
  }

  @Get('saved')
  @Roles('System Administrator', 'Chief Auditor', 'Manager', 'Audit Manager')
  async getSavedReports() {
    // Mock endpoint
    return [];
  }

  @Post('audit/:id/save')
  @Roles('Manager', 'Audit Manager')
  async saveAuditReport(@Param('id') id: string, @Request() req) {
    return this.reportsService.saveReport(+id, req.user);
  }
}
