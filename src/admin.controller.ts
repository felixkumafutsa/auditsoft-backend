import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('system-stats')
  async getSystemStats() {
    const [totalUsers, totalRoles, totalLogs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.role.count(),
      this.prisma.auditLog.count(),
    ]);

    return {
      totalUsers,
      totalRoles,
      totalLogs,
    };
  }
}