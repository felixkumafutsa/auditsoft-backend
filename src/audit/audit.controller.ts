import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { AuditService, CreateAuditDto, UpdateAuditDto } from './audit.service';

@Controller('audits')
export class AuditController {
  constructor(private auditService: AuditService) {}

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
}
