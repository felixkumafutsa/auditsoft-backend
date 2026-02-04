import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller';
import { MessagingService } from './messaging.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MessagingGateway } from './messaging.gateway';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, PrismaService, MessagingGateway],
})
export class MessagingModule {}
