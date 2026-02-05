import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import * as express from 'express';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('executive')
  @Roles('Admin', 'System Administrator', 'Chief Audit Executive', 'CAE', 'Executive')
  getExecutiveReport() {
    return this.reportsService.getExecutiveReport();
  }

  @Get('dashboard')
  @Roles('Admin', 'System Administrator', 'Chief Audit Executive', 'CAE', 'Executive', 'Manager', 'Audit Manager', 'Auditor')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('audit/:id/pdf')
  @Roles('Chief Audit Executive', 'CAE', 'System Administrator')
  async downloadAuditReportPDF(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generatePDF(+id, res);
  }

  @Get('audit/:id/docx')
  @Roles('Chief Audit Executive', 'CAE', 'System Administrator')
  async downloadAuditReportWord(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generateWord(+id, res);
  }

  @Get('audit/:id/preview')
  @Roles('Manager', 'Audit Manager')
  async previewAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, false);
  }

  @Get('audit/:id/file')
  @Roles('Chief Audit Executive', 'CAE', 'System Administrator')
  async downloadStoredAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, true);
  }
}
