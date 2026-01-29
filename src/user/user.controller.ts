import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { UserService, CreateUserDto, UpdateUserDto } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateUserDto) {
    return this.userService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userService.delete(id);
  }

  @Post(':userId/roles/:roleId')
  assignRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userService.assignRole(userId, roleId);
  }

  @Delete(':userId/roles/:roleId')
  removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.userService.removeRole(userId, roleId);
  }

  @Get(':userId/roles')
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserRoles(userId);
  }

  @Get('me/tasks')
  getTasks(@Param('userId') userId: string) {
    // In a real app, extract userId from JWT token via @User() decorator
    // For now, hardcoding to 1 or using a query param if needed, 
    // but the route 'me/tasks' suggests current user.
    // Let's assume ID 1 for testing if auth not fully wired to params yet.
    return this.userService.getTasks(1); 
  }
}
