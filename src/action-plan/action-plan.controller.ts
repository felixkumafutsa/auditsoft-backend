import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe, Request, UnauthorizedException, BadRequestException, UseGuards } from '@nestjs/common';
import { ActionPlanService } from './action-plan.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';
import { FindingService } from '../finding/finding.service';
import { FindingWorkflowService } from '../workflow/finding.workflow';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('action-plans')
@UseGuards(JwtAuthGuard)
export class ActionPlanController {
  constructor(
    private readonly actionPlanService: ActionPlanService,
    private readonly findingService: FindingService,
    private readonly workflowService: FindingWorkflowService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: CreateActionPlanDto, @Request() req) {
    // Get current user and their role
    const currentUser = req.user;
    const userRoles = currentUser?.roles || [];

    // Check if user is Chief Auditor (including variations)
    const isChiefAuditor = userRoles.some(role => ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'].includes(role));
    if (!isChiefAuditor) {
      throw new UnauthorizedException('Only Chief Auditors can create action plans');
    }

    // Get the finding to check current status
    const finding = await this.findingService.findOne(createDto.findingId);

    if (!finding) {
      throw new BadRequestException('Finding not found');
    }

    // Check if finding is in Validated or Action Assigned status
    const allowedStatuses = ['Validated', 'Action Assigned'];
    if (!allowedStatuses.includes(finding.status)) {
      throw new BadRequestException(`Cannot create action plan for finding with status: ${finding.status}. Finding must be 'Validated' or 'Action Assigned'`);
    }

    // Create the action plan
    const actionPlan = await this.actionPlanService.create(createDto);

    // Automatically update finding status to 'Action Assigned' if it's currently 'Validated'
    if (finding.status === 'Validated') {
      await this.findingService.updateStatus(createDto.findingId, 'Action Assigned', 'Chief Auditor');
    }

    return actionPlan;
  }

  @Get()
  findAll() {
    return this.actionPlanService.findAll();
  }

  @Get('overdue')
  findOverdue() {
    return this.actionPlanService.findOverdue();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actionPlanService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateActionPlanDto, @Request() req) {
    const rawRoles = req.user?.roles || [];
    const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles];

    // Normalize roles to strings if they are objects
    const roleNames = roles.map(r => typeof r === 'string' ? r : (r?.roleName || r?.name || ''));

    const isChiefAuditor = roleNames.some(role => ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'].includes(role));
    const isManager = roleNames.some(role => ['Manager', 'Audit Manager', 'Process Owner'].includes(role));

    if (!isChiefAuditor && !isManager) {
      throw new UnauthorizedException('Only Managers and Chief Auditors can update action plans');
    }

    if (!isChiefAuditor && isManager) {
      // Manager can only update status. Check if other fields are present and NOT undefined
      const { status, ...rest } = updateDto;
      const otherFields = Object.keys(rest).filter(key => rest[key] !== undefined && rest[key] !== null);

      if (otherFields.length > 0) {
        throw new UnauthorizedException('Managers can only update the status of an action plan');
      }
      return this.actionPlanService.update(id, { status });
    }

    return this.actionPlanService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userRoles = req.user?.roles || [];
    const isChiefAuditor = userRoles.some(role => ['Chief Auditor', 'CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'].includes(role));

    if (!isChiefAuditor) {
      throw new UnauthorizedException('Only Chief Auditors can delete action plans');
    }

    return this.actionPlanService.remove(id);
  }
}
