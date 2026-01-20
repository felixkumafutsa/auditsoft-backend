import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { RoleService, CreateRoleDto, UpdateRoleDto } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private roleService: RoleService) {}

  @Get()
  getAll() {
    return this.roleService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateRoleDto) {
    return this.roleService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateRoleDto) {
    return this.roleService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.delete(id);
  }
}
