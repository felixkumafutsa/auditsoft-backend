import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService, AuditLogService],
  exports: [UserService],
})
export class UserModule {}
