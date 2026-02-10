import { Controller, Get, Post, Body, Put, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ActionPlanService } from './action-plan.service';
import { CreateActionPlanDto } from './dto/create-action-plan.dto';
import { UpdateActionPlanDto } from './dto/update-action-plan.dto';

@Controller('action-plans')
export class ActionPlanController {
  constructor(private readonly actionPlanService: ActionPlanService) {}

  @Post()
  create(@Body() createDto: CreateActionPlanDto) {
    return this.actionPlanService.create(createDto);
  }

  @Get()
  findAll() {
    return this.actionPlanService.findAll();
  }

  @Get('overdue')
  findOverdue() {
    return this.actionPlanService.findOverdue();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.actionPlanService.findOne(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateActionPlanDto) {
    return this.actionPlanService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.actionPlanService.remove(id);
  }
}
