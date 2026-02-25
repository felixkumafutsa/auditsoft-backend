import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuditPlanService } from './audit-plan.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-plan')
@UseGuards(JwtAuthGuard)
export class AuditPlanController {
  constructor(private readonly auditPlanService: AuditPlanService) {}

  @Get('annual/:year')
  async getAnnualPlan(@Param('year') year: string) {
    return this.auditPlanService.getAnnualPlan(parseInt(year));
  }

  @Get('recommendations')
  async getRiskBasedRecommendations(@Query('limit') limit?: string) {
    return this.auditPlanService.getRiskBasedRecommendations(
      limit ? parseInt(limit) : 10
    );
  }

  @Put('strategic/:auditId')
  async updateAuditStrategicInfo(
    @Param('auditId') auditId: string,
    @Body() data: any
  ) {
    return this.auditPlanService.updateAuditStrategicInfo(parseInt(auditId), data);
  }

  @Post('executive-approval/:auditId')
  async executiveApproval(
    @Param('auditId') auditId: string,
    @Body() body: { approverId: number; approved: boolean; comments?: string }
  ) {
    return this.auditPlanService.executiveApproval(
      parseInt(auditId),
      body.approverId,
      body.approved,
      body.comments
    );
  }

  @Get('resource-allocation/:year')
  async getResourceAllocation(@Param('year') year: string) {
    return this.auditPlanService.getResourceAllocation(parseInt(year));
  }
}
