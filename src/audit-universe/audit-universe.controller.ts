import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuditUniverseService } from './audit-universe.service';
import { CreateAuditUniverseDto } from './dto/create-audit-universe.dto';
import { UpdateAuditUniverseDto } from './dto/update-audit-universe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('audit-universe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditUniverseController {
  constructor(private readonly auditUniverseService: AuditUniverseService) {}

  @Post()
  @Roles('Chief Auditor')
  create(@Body() createAuditUniverseDto: CreateAuditUniverseDto) {
    return this.auditUniverseService.create(createAuditUniverseDto);
  }

  @Get()
  @Roles('System Administrator', 'Chief Auditor', 'Auditor', 'Audit Manager', 'Manager')
  findAll() {
    return this.auditUniverseService.findAll();
  }

  @Get(':id')
  @Roles('System Administrator', 'Chief Auditor', 'Auditor', 'Audit Manager', 'Manager')
  findOne(@Param('id') id: string) {
    return this.auditUniverseService.findOne(+id);
  }

  @Patch(':id')
  @Roles('Chief Auditor')
  update(@Param('id') id: string, @Body() updateAuditUniverseDto: UpdateAuditUniverseDto) {
    return this.auditUniverseService.update(+id, updateAuditUniverseDto);
  }

  @Delete(':id')
  @Roles('Chief Auditor')
  remove(@Param('id') id: string) {
    return this.auditUniverseService.remove(+id);
  }
}
