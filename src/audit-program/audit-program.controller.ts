import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { AuditProgramService } from './audit-program.service';
import { CreateAuditProgramDto } from './dto/create-audit-program.dto';
import { UpdateAuditProgramDto } from './dto/update-audit-program.dto';
import { EvidenceService } from '../evidence/evidence.service';

@Controller('audit-programs')
export class AuditProgramController {
  constructor(
    private readonly auditProgramService: AuditProgramService,
    private readonly evidenceService: EvidenceService,
  ) {}

  @Post()
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAuditProgramDto,
  ) {
    return this.auditProgramService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auditProgramService.remove(id);
  }
}
