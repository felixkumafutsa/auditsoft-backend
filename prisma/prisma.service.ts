import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient | null = null;

  private getPrisma(): PrismaClient {
    if (!this.prisma) {
      this.prisma = new (PrismaClient as any)({
        errorFormat: 'pretty'
      }) as PrismaClient;
    }
    return this.prisma;
  }

  async onModuleInit() {
    try {
      await this.getPrisma().$connect();
    } catch (error) {
      console.error('Failed to connect to Prisma:', error);
    }
  }

  async onModuleDestroy() {
    if (this.prisma) {
      try {
        await this.prisma.$disconnect();
      } catch (error) {
        console.error('Failed to disconnect from Prisma:', error);
      }
    }
  }

  // Proxy all Prisma client methods
  get user() {
    return this.getPrisma().user;
  }

  get role() {
    return this.getPrisma().role;
  }

  get userRole() {
    return this.getPrisma().userRole;
  }

  get auditUniverse() {
    return this.getPrisma().auditUniverse;
  }

  get audit() {
    return this.getPrisma().audit;
  }

  get auditProgram() {
    return this.getPrisma().auditProgram;
  }

  get evidence() {
    return this.getPrisma().evidence;
  }

  get finding() {
    return this.getPrisma().finding;
  }

  get actionPlan() {
    return this.getPrisma().actionPlan;
  }

  get auditLog() {
    return this.getPrisma().auditLog;
  }

  get complianceFramework() {
    return this.getPrisma().complianceFramework;
  }

  get controlMapping() {
    return this.getPrisma().controlMapping;
  }

  get integration() {
    return this.getPrisma().integration;
  }

  get $connect() {
    return this.getPrisma().$connect.bind(this.getPrisma());
  }

  get $disconnect() {
    return this.getPrisma().$disconnect.bind(this.getPrisma());
  }
}
