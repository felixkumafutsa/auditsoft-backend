import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuditProgramService } from './audit-program.service';
import { CreateAuditProgramDto } from './dto/create-audit-program.dto';
import { UpdateAuditProgramDto } from './dto/update-audit-program.dto';
import { EvidenceService } from '../evidence/evidence.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('audit-programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditProgramController {
  constructor(
    private readonly auditProgramService: AuditProgramService,
    private readonly evidenceService: EvidenceService,
  ) {}

  @Post()
  @Roles('Manager', 'Audit Manager', 'Chief Auditor')
  create(@Body() createDto: CreateAuditProgramDto) {
    return this.auditProgramService.create(createDto);
  }

  @Get()
  findAll() {
    return this.auditProgramService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditProgramService.findOne(id);
  }

  @Get(':id/evidence')
  getEvidence(@Param('id', ParseIntPipe) id: number) {
    return this.evidenceService.findAll(id);
  }

  @Put(':id')
  // Auditors can update actualResult and reviewerComment, so we might need more granular control or allow Update for execution
  // For now, let's assume update is allowed for execution (Auditor) but create is restricted
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAuditProgramDto,
  ) {
    return this.auditProgramService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('Manager', 'Audit Manager', 'Chief Auditor')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auditProgramService.remove(id);
  }
}
