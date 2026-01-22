import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('search')
  async search(@Body() filters: any) {
    const limit = filters.limit ? Number(filters.limit) : undefined;
    
    return this.prisma.auditLog.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}