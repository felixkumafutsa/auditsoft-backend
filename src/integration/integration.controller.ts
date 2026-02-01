import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, UseGuards } from '@nestjs/common';
import { IntegrationService } from './integration.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @Post()
  @Roles('Admin', 'System Admin', 'System Administrator', 'Manager')
  create(@Body() data: Prisma.IntegrationCreateInput) {
    return this.integrationService.create(data);
  }

  @Get()
  @Roles('Admin', 'System Admin', 'System Administrator', 'CAE', 'Manager')
  findAll() {
    return this.integrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.integrationService.findOne(id);
  }

  @Put(':id')
  @Roles('Admin', 'System Admin', 'System Administrator', 'Manager')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Prisma.IntegrationUpdateInput) {
    return this.integrationService.update(id, data);
  }

  @Delete(':id')
  @Roles('Admin', 'System Admin', 'System Administrator')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.integrationService.remove(id);
  }
}
