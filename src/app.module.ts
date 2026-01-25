import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditModule } from './audit/audit.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin.module';
import { AuditLogModule } from './audit-log.module';
import { FindingModule } from './finding/finding.module';
import { AuditProgramModule } from './audit-program/audit-program.module';
import { ActionPlanModule } from './action-plan/action-plan.module';
import { EvidenceModule } from './evidence/evidence.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuditModule,
    AuditProgramModule,
    EvidenceModule,
    FindingModule,
    ActionPlanModule,
    UserModule,
    RoleModule,
    AuthModule,
    AdminModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
