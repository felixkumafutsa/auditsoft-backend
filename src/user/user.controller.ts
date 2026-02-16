import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UserService, CreateUserDto, UpdateUserDto, CreateProcessOwnerDto } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) { }

  @Get('me')
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Get('me/tasks')
  @UseGuards(JwtAuthGuard)
  getTasks(@Request() req) {
    return this.userService.getTasks(req.user.id);
  }

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

  @Post('process-owner')
  @Roles('System Administrator')
  createProcessOwner(@Body() data: CreateProcessOwnerDto) {
    return this.userService.createProcessOwner(data);
  }

  @Get(':userId/roles')
  getUserRoles(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.getUserRoles(userId);
  }
}
