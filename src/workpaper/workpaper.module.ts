import { Module } from '@nestjs/common';
import { WorkpaperService } from './workpaper.service';
import { WorkpaperController } from './workpaper.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
    controllers: [WorkpaperController],
    providers: [WorkpaperService, PrismaService],
})
export class WorkpaperModule { }
