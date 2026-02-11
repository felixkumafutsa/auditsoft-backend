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
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Executive', 'Manager', 'Audit Manager')
  getExecutiveReport() {
    return this.reportsService.getExecutiveReport();
  }

  @Get('operational')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Manager', 'Audit Manager')
  getOperationalReports() {
    return this.reportsService.getOperationalReports();
  }

  @Get('dashboard')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Executive', 'Manager', 'Audit Manager', 'Auditor')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }

  @Get('audit/:id/pdf')
  @Roles('Chief Audit Executive (CAE)', 'CAE')
  async downloadAuditReportPDF(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generatePDF(+id, res);
  }

  @Get('audit/:id/docx')
  @Roles('Chief Audit Executive (CAE)', 'CAE')
  async downloadAuditReportWord(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.generateWord(+id, res);
  }

  @Get('audit/:id/preview')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Manager', 'Audit Manager')
  async previewAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, false);
  }

  @Get('audit/:id/file')
  @Roles('Chief Audit Executive (CAE)',  'Manager', 'Audit Manager')
  async downloadStoredAuditReport(@Param('id') id: string, @Res() res: express.Response) {
    return this.reportsService.streamStoredPDF(+id, res, true);
  }
}
