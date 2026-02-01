import { Module } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { IntegrationController } from './integration.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService, PrismaService],
})
export class IntegrationModule {}
