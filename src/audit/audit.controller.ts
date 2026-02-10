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
  ForbiddenException,
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

  @UseGuards(JwtAuthGuard)
  @Get('owner')
  getForOwner(@Req() req: any) {
    const userId = req.user?.userId ?? req.user?.id;
    return this.auditService.findForOwner(Number(userId));
  }

  @Get('templates')
  getTemplates() {
    return this.auditService.findTemplates();
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
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateAuditDto, @Req() req: any) {
    if (body.status === 'Approved') {
      const user = req.user;
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
      const isCAE = roles.includes('Chief Audit Executive (CAE)') || roles.includes('CAE') || roles.includes('Chief Audit Executive');
      
      if (!isCAE) {
        throw new ForbiddenException('Only Chief Audit Executive can approve audits.');
      }
    }
    return this.auditService.update(id, body);
  }

  @Post(':id/assign')
  @Roles('Audit Manager', 'System Administrator')
  async assignAuditors(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { auditorIds: number[] },
  ) {
    const audit = await this.auditService.findOne(id);
    if (audit.status !== 'Approved') {
      throw new BadRequestException('Auditors can only be assigned after the audit plan is Approved.');
    }
    return this.auditService.update(id, { assignedAuditorIds: body.auditorIds });
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.auditService.delete(id);
  }

  @Get(':id/programs')
  async getPrograms(@Param('id', ParseIntPipe) id: number) {
    const audit = await this.auditService.findOne(id);
     
    return (audit as any).auditPrograms || [];
  }

  @Get(':id/findings')
  async getFindings(@Param('id', ParseIntPipe) id: number) {
    const audit = await this.auditService.findOne(id);
     
    return (audit as any).findings || [];
  }

  // ========== WORKFLOW STATE TRANSITIONS ==========

  @Post(':id/transition')
  async transitionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { toStatus: string; userRole?: string },
    @Req() req: any,
  ) {
    const audit = await this.auditService.findOne(id);
    const currentStatus = audit.status;
    const normalizedToStatus = body.toStatus.trim();
    const normalizedUserRole = body.userRole?.trim();

    // Validate transition
    if (!this.workflowService.canTransition(currentStatus, normalizedToStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${normalizedToStatus}`,
      );
    }

    // Check role permissions
    const permittedRoles = this.workflowService.getPermittedRoles(
      currentStatus,
      normalizedToStatus,
    );
    if (normalizedUserRole && !permittedRoles.includes(normalizedUserRole)) {
      throw new BadRequestException(
        `Role ${normalizedUserRole} is not permitted to transition from ${currentStatus} to ${normalizedToStatus}`,
      );
    }

    return this.auditService.update(id, { status: normalizedToStatus }, req.user);
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
