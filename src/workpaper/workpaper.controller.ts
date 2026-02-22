import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { WorkpaperService } from './workpaper.service';
import { CreateWorkpaperDto } from './dto/create-workpaper.dto';
import { UpdateWorkpaperDto } from './dto/update-workpaper.dto';

@Controller('workpapers')
export class WorkpaperController {
    constructor(private readonly workpaperService: WorkpaperService) { }

    @Post()
    create(@Body() createWorkpaperDto: CreateWorkpaperDto) {
        return this.workpaperService.create(createWorkpaperDto);
    }

    @Get()
    findAll() {
        return this.workpaperService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.workpaperService.findOne(id);
    }

    @Get('audit-program/:id')
    findByAuditProgram(@Param('id', ParseIntPipe) auditProgramId: number) {
        return this.workpaperService.findByAuditProgram(auditProgramId);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateWorkpaperDto: UpdateWorkpaperDto) {
        return this.workpaperService.update(id, updateWorkpaperDto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.workpaperService.remove(id);
    }
}
