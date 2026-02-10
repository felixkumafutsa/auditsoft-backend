import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async findAll() {
    return this.auditLogService.findAll();
  }

  @Post('search')
  async search(@Body() filters: any) {
    return this.auditLogService.findAll();
  }
}