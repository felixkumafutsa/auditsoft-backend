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
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: CreateActionPlanDto, @Request() req) {
    // Get current user and their role
    const currentUser = req.user;
    const userRoles = currentUser?.roles || [];
    
    // Check if user is Chief Auditor
    if (!userRoles.includes('Chief Auditor')) {
      throw new UnauthorizedException('Only Chief Auditors can create action plans');
    }

    // Get the finding to check current status
    const finding = await this.findingService.findOne(createDto.findingId);
    
    if (!finding) {
      throw new BadRequestException('Finding not found');
    }

    // Check if finding is in Validated status
    if (finding.status !== 'Validated') {
      throw new BadRequestException(`Cannot create action plan for finding with status: ${finding.status}. Finding must be 'Validated'`);
    }

    // Create the action plan
    const actionPlan = await this.actionPlanService.create(createDto);

    // Automatically update finding status to 'Action Assigned'
    await this.findingService.updateStatus(createDto.findingId, 'Action Assigned', 'Chief Auditor');

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
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateActionPlanDto) {
    return this.actionPlanService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actionPlanService.remove(id);
  }
}
