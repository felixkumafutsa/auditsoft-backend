import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkpaperDto } from './dto/create-workpaper.dto';
import { UpdateWorkpaperDto } from './dto/update-workpaper.dto';

@Injectable()
export class WorkpaperService {
    constructor(private prisma: PrismaService) { }

    async create(createWorkpaperDto: CreateWorkpaperDto) {
        return this.prisma.workpaper.create({
            data: createWorkpaperDto,
            include: {
                auditProgram: true,
            }
        });
    }

    async findAll() {
        return this.prisma.workpaper.findMany({
            include: {
                auditProgram: true,
            }
        });
    }

    async findOne(id: number) {
        const workpaper = await this.prisma.workpaper.findUnique({
            where: { id },
            include: {
                auditProgram: {
                    include: {
                        audit: true,
                        evidence: true
                    }
                }
            }
        });

        if (!workpaper) {
            throw new NotFoundException(`Workpaper with ID ${id} not found`);
        }

        return workpaper;
    }

    async findByAuditProgram(auditProgramId: number) {
        return this.prisma.workpaper.findUnique({
            where: { auditProgramId },
            include: {
                auditProgram: true
            }
        });
    }

    async update(id: number, updateWorkpaperDto: UpdateWorkpaperDto) {
        return this.prisma.workpaper.update({
            where: { id },
            data: updateWorkpaperDto,
        });
    }

    async remove(id: number) {
        return this.prisma.workpaper.delete({
            where: { id },
        });
    }
}
