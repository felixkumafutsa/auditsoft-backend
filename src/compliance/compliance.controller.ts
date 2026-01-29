import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { CreateFrameworkDto } from './dto/create-framework.dto';
import { UpdateFrameworkDto } from './dto/update-framework.dto';
import { CreateControlMappingDto } from './dto/create-control-mapping.dto';
import { UpdateControlMappingDto } from './dto/update-control-mapping.dto';

@Controller()
export class ComplianceController {
  constructor(private readonly complianceService: ComplianceService) {}

  @Get('compliance-stats')
  getCoverageStats() {
    return this.complianceService.getCoverageStats();
  }

  // --- Compliance Frameworks ---

  @Get('compliance-frameworks')
  findAllFrameworks() {
    return this.complianceService.findAllFrameworks();
  }

  @Get('compliance-frameworks/:id')
  findOneFramework(@Param('id', ParseIntPipe) id: number) {
    return this.complianceService.findOneFramework(id);
  }

  @Post('compliance-frameworks')
  createFramework(@Body() createDto: CreateFrameworkDto) {
    return this.complianceService.createFramework(createDto);
  }

  @Put('compliance-frameworks/:id')
  updateFramework(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFrameworkDto,
  ) {
    return this.complianceService.updateFramework(id, updateDto);
  }

  @Delete('compliance-frameworks/:id')
  deleteFramework(@Param('id', ParseIntPipe) id: number) {
    return this.complianceService.deleteFramework(id);
  }

  // --- Control Mappings ---

  @Get('audit-programs/:programId/controls')
  findMappingsByProgram(@Param('programId', ParseIntPipe) programId: number) {
    return this.complianceService.findMappingsByProgram(programId);
  }

  @Post('control-mappings')
  createControlMapping(@Body() createDto: CreateControlMappingDto) {
    return this.complianceService.createControlMapping(createDto);
  }

  @Put('control-mappings/:id')
  updateControlMapping(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateControlMappingDto,
  ) {
    return this.complianceService.updateControlMapping(id, updateDto);
  }

  @Delete('control-mappings/:id')
  deleteControlMapping(@Param('id', ParseIntPipe) id: number) {
    return this.complianceService.deleteControlMapping(id);
  }
}
