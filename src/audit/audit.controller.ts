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
import { AuditService, CreateAuditDto, UpdateAuditDto } from './audit.service';
import { AuditWorkflowService } from '../workflow/audit.workflow';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('audits')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(
    private auditService: AuditService,
    private workflowService: AuditWorkflowService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Req() req: any) {
    return this.auditService.findAll(req.user);
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.auditService.findOne(id, req.user);
  }

  @Post()
  create(@Body() body: CreateAuditDto) {
    return this.auditService.create(body);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAuditDto) {
    return this.auditService.update(id, body);
  }

  @Post(':id/assign')
  @Roles('Audit Manager', 'System Administrator')
  assignAuditors(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { auditorIds: number[] },
  ) {
    return this.auditService.update(id, { assignedAuditorIds: body.auditorIds });
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.delete(id);
  }

  @Get(':id/programs')
  async getPrograms(@Param('id', ParseIntPipe) id: number) {
    const audit = await this.auditService.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (audit as any).auditPrograms || [];
  }

  @Get(':id/findings')
  async getFindings(@Param('id', ParseIntPipe) id: number) {
    const audit = await this.auditService.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    return (audit as any).findings || [];
  }

  // ========== WORKFLOW STATE TRANSITIONS ==========

  @Post(':id/transition')
  async transitionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { toStatus: string; userRole?: string },
  ) {
    const audit = await this.auditService.findOne(id);
    const currentStatus = audit.status;

    // Validate transition
    if (!this.workflowService.canTransition(currentStatus, body.toStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${body.toStatus}`,
      );
    }

    // Check role permissions
    const permittedRoles = this.workflowService.getPermittedRoles(
      currentStatus,
      body.toStatus,
    );
    if (body.userRole && !permittedRoles.includes(body.userRole)) {
      throw new BadRequestException(
        `Role ${body.userRole} is not permitted to transition from ${currentStatus} to ${body.toStatus}`,
      );
    }

    return this.auditService.update(id, { status: body.toStatus });
  }

  @Get(':id/allowed-transitions')
  getAllowedTransitions(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.findOne(id).then((audit) => ({
      currentStatus: audit.status,
      allowedTransitions: this.workflowService.getAllowedTransitions(
        audit.status,
      ),
    }));
  }
}
