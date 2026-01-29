import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

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
  @Roles('Admin', 'System Administrator', 'Chief Audit Executive', 'CAE', 'Executive', 'Manager', 'Auditor')
  getDashboardStats() {
    return this.reportsService.getDashboardStats();
  }
}
