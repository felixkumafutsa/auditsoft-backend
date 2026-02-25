import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UserService, CreateUserDto, UpdateUserDto, CreateProcessOwnerDto } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

const profileStorage = diskStorage({
  destination: './uploads/profile-pictures',
  filename: (req, file: any, cb) => {
    const name = file.originalname.split('.')[0];
    const fileExt = extname(file.originalname);
    const randomName = `${uuidv4()}-${name.replace(/\s/g, '_')}${fileExt}`;
    cb(null, randomName);
  },
});

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private userService: UserService) { }

  @Get('me')
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Post('me')
  @UseInterceptors(FileInterceptor('profilePicture', {
    storage: profileStorage,
    fileFilter: (req, file, cb) => {
      const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('Invalid file type. Only images are allowed.'), false as any);
      }
      cb(null, true as any);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async updateProfile(@UploadedFile() file: Express.Multer.File, @Body() data: UpdateUserDto, @Request() req) {
    const profilePictureUrl = file ? `/uploads/profile-pictures/${file.filename}` : undefined;
    const updateData: any = { ...data };
    if (profilePictureUrl) updateData.profilePicture = profilePictureUrl;
    return this.userService.update(req.user.id, updateData);
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
