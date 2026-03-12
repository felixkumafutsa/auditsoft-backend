import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query
} from '@nestjs/common';
import { AuditRiskService, RiskAssessmentDto } from './audit-risk.service';
import { CreateRiskAssessmentDto } from './dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from './dto/update-risk-assessment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('risk-assessments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RiskAssessmentController {
  constructor(private readonly auditRiskService: AuditRiskService) {}

  @Post()
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor')
  create(@Body() createRiskAssessmentDto: CreateRiskAssessmentDto) {
    return this.auditRiskService.recordRiskAssessment(createRiskAssessmentDto);
  }

  @Get()
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor', 'Manager')
  findAll() {
    return this.auditRiskService.getAllRiskAssessments();
  }

  @Get('audit/:auditId')
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor', 'Manager')
  findByAudit(@Param('auditId') auditId: string) {
    return this.auditRiskService.getRiskAssessments(+auditId);
  }

  @Get('audit/:auditId/overall-risk')
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor', 'Manager')
  getOverallRisk(@Param('auditId') auditId: string) {
    return this.auditRiskService.calculateOverallRisk(+auditId);
  }

  @Get('audit/:auditId/trend')
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor', 'Manager')
  getRiskTrend(@Param('auditId') auditId: string) {
    return this.auditRiskService.getRiskTrend(+auditId);
  }

  @Get(':id')
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor', 'Manager')
  findOne(@Param('id') id: string) {
    return this.auditRiskService.getRiskAssessments(+id);
  }

  @Patch(':id')
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager', 'Auditor')
  update(@Param('id') id: string, @Body() updateRiskAssessmentDto: UpdateRiskAssessmentDto) {
    return this.auditRiskService.updateRiskAssessment(+id, updateRiskAssessmentDto);
  }

  @Delete(':id')
  @Roles('System Administrator', 'Chief Auditor', 'Audit Manager')
  remove(@Param('id') id: string) {
    return this.auditRiskService.deleteRiskAssessment(+id);
  }
}
