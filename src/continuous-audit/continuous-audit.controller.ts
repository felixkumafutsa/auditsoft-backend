import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ContinuousAuditService } from './continuous-audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('continuous-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContinuousAuditController {
  constructor(private readonly continuousAuditService: ContinuousAuditService) {}

  @Post('controls')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Audit Manager', 'Manager')
  createControl(@Body() data: any) {
    return this.continuousAuditService.createControl(data);
  }

  @Get('controls')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Audit Manager', 'Manager', 'Auditor')
  findAllControls() {
    return this.continuousAuditService.findAllControls();
  }

  @Get('controls/:id/runs')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Audit Manager', 'Manager', 'Auditor')
  getControlRuns(@Param('id') id: string) {
    return this.continuousAuditService.getControlRuns(+id);
  }

  @Post('controls/:id/run')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Audit Manager', 'Manager')
  runControl(@Param('id') id: string) {
    return this.continuousAuditService.runControl(+id);
  }

  @Put('controls/:id')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'System Admin', 'System Administrator', 'Audit Manager', 'Manager')
  updateControl(@Param('id') id: string, @Body() data: any) {
    return this.continuousAuditService.updateControl(+id, data);
  }

  @Delete('controls/:id')
  @Roles('Chief Audit Executive (CAE)', 'CAE', 'Audit Manager', 'Manager')
  deleteControl(@Param('id') id: string) {
    return this.continuousAuditService.deleteControl(+id);
  }
}
