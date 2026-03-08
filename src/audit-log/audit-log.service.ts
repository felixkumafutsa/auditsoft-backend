/*
 * Copyright (c) 2026 Auditsoft
 * All rights reserved.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { extractRequestInfo, RequestInfo } from '../common/helpers/request-info.helper';

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

  async logActionFromRequest(
    data: {
      userId: string;
      action: string;
      entityType: string;
      entityId: string;
    },
    req: any
  ) {
    const requestInfo = extractRequestInfo(req);
    return this.logAction({
      ...data,
      ...requestInfo,
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
