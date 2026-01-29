import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RiskService } from './risk.service';
import { CreateRiskDto } from './dto/create-risk.dto';
import { UpdateRiskDto } from './dto/update-risk.dto';
import { CreateKriDto } from './dto/create-kri.dto';
import { UpdateKriDto } from './dto/update-kri.dto';

@Controller('risks')
export class RiskController {
  constructor(private readonly riskService: RiskService) {}

  // Risk Endpoints
  @Post()
  createRisk(@Body() createRiskDto: CreateRiskDto) {
    return this.riskService.createRisk(createRiskDto);
  }

  @Get()
  findAllRisks() {
    return this.riskService.findAllRisks();
  }

  @Get(':id')
  findOneRisk(@Param('id') id: string) {
    return this.riskService.findOneRisk(+id);
  }

  @Patch(':id')
  updateRisk(@Param('id') id: string, @Body() updateRiskDto: UpdateRiskDto) {
    return this.riskService.updateRisk(+id, updateRiskDto);
  }

  @Delete(':id')
  removeRisk(@Param('id') id: string) {
    return this.riskService.removeRisk(+id);
  }

  // KRI Endpoints - Nested under /risks/kri or separate?
  // Let's use /risks/kri/xxx for now or /kris/xxx if we want top level.
  // The user asked for "Risk Management Pages" -> Register, KRI, Heatmap.
  // KRI page is separate.
  // Let's make KRI endpoints accessible via /risks/kri for now to keep module cohesive.
  
  @Post('kri')
  createKri(@Body() createKriDto: CreateKriDto) {
    return this.riskService.createKri(createKriDto);
  }

  @Get('kri/all')
  findAllKris() {
    return this.riskService.findAllKris();
  }

  @Get('kri/:id')
  findOneKri(@Param('id') id: string) {
    return this.riskService.findOneKri(+id);
  }

  @Patch('kri/:id')
  updateKri(@Param('id') id: string, @Body() updateKriDto: UpdateKriDto) {
    return this.riskService.updateKri(+id, updateKriDto);
  }

  @Delete('kri/:id')
  removeKri(@Param('id') id: string) {
    return this.riskService.removeKri(+id);
  }
}
