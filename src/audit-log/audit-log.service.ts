import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async logAction(data: {
    userId: string;
    action: string;
    entityType: string;
    entityId: string;
    ipAddress?: string;
    deviceInfo?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        userId: Number(data.userId),
        action: data.action,
        entityType: data.entityType,
        entityId: Number(data.entityId),
        ipAddress: data.ipAddress,
        deviceInfo: data.deviceInfo,
      },
    });
  }

  async findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }
}
