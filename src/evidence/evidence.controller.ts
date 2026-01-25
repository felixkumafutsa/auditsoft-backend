import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Delete,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from './evidence.service';

@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('auditProgramId', ParseIntPipe) auditProgramId: number,
    @Body('description') description?: string,
  ) {
    return this.evidenceService.create(auditProgramId, file, description);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evidenceService.remove(id);
  }
}
