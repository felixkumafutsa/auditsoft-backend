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
  @Roles('System Administrator', 'Chief Audit Executive (CAE)', 'Manager', 'Audit Manager')
  async generateCustomReport(@Body() dto: GenerateCustomReportDto, @Res() res: express.Response) {
    return this.reportsService.generateCustomReport(dto, res);
  }

  @Get('executive')
  @Roles('System Administrator', 'Chief Audit Executive (CAE)', 'Executive', 'Manager', 'Audit Manager')
  getExecutiveReport() {
    return this.reportsService.getExecutiveReport();
  }

  @Get('operational')
  @Roles('System Administrator', 'Chief Audit Executive (CAE)', 'Manager', 'Audit Manager')
  getOperationalReports() {
    return this.reportsService.getOperationalReports();
  }

  @Get('dashboard')
  @Roles('System Administrator', 'Chief Audit Executive (CAE)', 'Executive', 'Manager', 'Audit Manager', 'Auditor')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('list')
  @Roles('Audit Manager', 'Chief Audit Executive (CAE)', 'System Administrator')
  async getReportsList(@Param() params, @Request() req) {
    return this.reportsService.getReportsList(req?.user);
  }

  @Get('audit/:id/pdf')
  @Roles('Chief Audit Executive (CAE)', 'System Administrator')
  async downloadAuditReportPDF(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generatePDF(+id, res);
  }

  @Get('audit/:id/docx')
  @Roles('Chief Audit Executive (CAE)', 'System Administrator')
  async downloadAuditReportWord(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generateWord(+id, res);
  }

  @Get('audit/:id/preview')
  @Roles('Manager', 'Audit Manager', 'Chief Audit Executive (CAE)')
  async previewAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, false);
  }

  @Get('audit/:id/file')
  @Roles('Chief Audit Executive (CAE)', 'System Administrator')
  async downloadStoredAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, true);
  }
}
