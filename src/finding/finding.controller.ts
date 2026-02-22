import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  FindingService,
  CreateFindingDto,
  UpdateFindingDto,
} from './finding.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('findings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FindingController {
  constructor(
    private findingService: FindingService,
    private workflowService: FindingWorkflowService,
  ) {}

  @Get()
  getAll() {
    return this.findingService.findAll();
  }

  @Get('critical')
  getCritical() {
    return this.findingService.getCriticalFindings();
  }

  @Get('overdue')
  getOverdue() {
    return this.findingService.getOverdueFindings();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.findingService.findOne(id);
  }

  @Get(':id/action-plans')
  async getActionPlans(@Param('id', ParseIntPipe) id: number) {
     
    const finding: any = await this.findingService.findOne(id);
     
    return finding.actionPlans || [];
  }

  @Get('audit/:auditId')
  getByAudit(@Param('auditId', ParseIntPipe) auditId: number) {
    return this.findingService.findByAudit(auditId);
  }

  @Post()
  create(@Body() body: CreateFindingDto, @Req() req: any) {
    return this.findingService.create(body, req.user);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFindingDto,
  ) {
    return this.findingService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.findingService.delete(id);
  }

  // ========== WORKFLOW STATE TRANSITIONS ==========

  @Post(':id/assign-action')
  @Roles('Chief Auditor')
  async assignAction(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { comment?: string },
    @Req() req: any,
  ) {
    const finding = await this.findingService.findOne(id);
    
    // Transition to Action Assigned status
    const updatedFinding = await this.findingService.transitionStatus(
      id,
      'Action Assigned',
      'Chief Auditor',
      body.comment,
    );

    // Return response with redirect information for action plan creation
    return {
      success: true,
      message: 'Finding status changed to Action Assigned',
      finding: updatedFinding,
      redirectTo: {
        path: `/action-plans/create?findingId=${id}`,
        message: 'Please create an action plan for this finding'
      }
    };
  }

  @Post(':id/transition')
  async transitionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { toStatus: string; userRole?: string; comment?: string },
  ) {
    return this.findingService.transitionStatus(
      id,
      body.toStatus,
      body.userRole,
      body.comment,
    );
  }

  @Get(':id/allowed-transitions')
  getAllowedTransitions(@Param('id', ParseIntPipe) id: number) {
    return this.findingService.findOne(id).then((finding) => ({
      currentStatus: finding.status,
      allowedTransitions: this.workflowService.getAllowedTransitions(
        finding.status,
      ),
    }));
  }

  @Post(':id/escalate')
  async escalate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string; escalatedTo: string },
  ) {
    const finding = await this.findingService.findOne(id);

    if (!this.workflowService.requiresEscalation(finding.severity)) {
      throw new BadRequestException(
        `Finding with severity ${finding.severity} does not require escalation`,
      );
    }

    // Log escalation (could be extended with audit logging)
    return {
      findingId: id,
      escalatedTo: body.escalatedTo,
      reason: body.reason,
      timestamp: new Date(),
      status: 'Escalated',
    };
  }
}
