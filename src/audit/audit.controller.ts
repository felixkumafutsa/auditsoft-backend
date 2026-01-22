import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { AuditService, CreateAuditDto, UpdateAuditDto } from './audit.service';
import { AuditWorkflowService } from '../workflow/audit.workflow';

@Controller('audits')
export class AuditController {
  constructor(
    private auditService: AuditService,
    private workflowService: AuditWorkflowService,
  ) {}

  @Get()
  getAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findOne(id);
  }

  @Post()
  create(@Body() body: CreateAuditDto) {
    return this.auditService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateAuditDto,
  ) {
    return this.auditService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.delete(id);
  }

  // ========== WORKFLOW STATE TRANSITIONS ==========

  @Post(':id/transition')
  async transitionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { toStatus: string; userRole?: string }
  ) {
    const audit = await this.auditService.findOne(id);
    const currentStatus = audit.status;

    // Validate transition
    if (!this.workflowService.canTransition(currentStatus, body.toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${body.toStatus}`
      );
    }

    // Check role permissions
    const permittedRoles = this.workflowService.getPermittedRoles(currentStatus, body.toStatus);
    if (body.userRole && !permittedRoles.includes(body.userRole)) {
      throw new BadRequestException(
        `Role ${body.userRole} is not permitted to transition from ${currentStatus} to ${body.toStatus}`
      );
    }

    return this.auditService.update(id, { status: body.toStatus });
  }

  @Get(':id/allowed-transitions')
  getAllowedTransitions(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findOne(id).then(audit => ({
      currentStatus: audit.status,
      allowedTransitions: this.workflowService.getAllowedTransitions(audit.status),
    }));
  }
}
