import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EvidenceService } from './evidence.service';
import { EvidenceWorkflowService } from '../workflow/evidence.workflow';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Res } from '@nestjs/common';
import { type Response } from 'express';

@Controller('evidence')
@UseGuards(JwtAuthGuard)
export class EvidenceController {
  constructor(
    private readonly evidenceService: EvidenceService,
    private readonly workflowService: EvidenceWorkflowService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: any,
    @Body('auditProgramId', ParseIntPipe) auditProgramId: number,
    @Body('description') description: string | undefined,
    @Req() req: any,
  ) {
    return this.evidenceService.create(auditProgramId, file, description, req.user?.id, req.user);
  }

  @Get()
  async findAll(@Req() req: any) {
    const status = req.query.status;
    return this.evidenceService.findAllGlobal(status);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.evidenceService.remove(id);
  }

  @Post(':id/transition')
  async transitionStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { toStatus: string; userRole?: string },
    @Req() req: any,
  ) {
    const evidence = await this.evidenceService.findOne(id);
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }
    const currentStatus = evidence.status;
    const normalizedToStatus = body.toStatus.trim();
    // Try to get role from body, then from request user (JWT), then default to 'Auditor'
    let normalizedUserRole = body.userRole?.trim();
    if (!normalizedUserRole && req.user?.roles) {
      const roles = Array.isArray(req.user.roles) ? req.user.roles : [req.user.roles];
      normalizedUserRole = roles[0]; // Take the first role as primary
    }

    // Validate transition
    if (!this.workflowService.canTransition(currentStatus, normalizedToStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${normalizedToStatus}`,
      );
    }

    // Check role permissions
    const permittedRoles = this.workflowService.getPermittedRoles(
      currentStatus,
      normalizedToStatus,
    );
    if (!permittedRoles.includes(normalizedUserRole || 'Auditor')) {
      throw new BadRequestException(
        `Role ${normalizedUserRole || 'Auditor'} is not permitted to transition from ${currentStatus} to ${normalizedToStatus}`,
      );
    }

    return this.evidenceService.updateStatus(id, normalizedToStatus, req.user?.id);
  }

  @Post(':id/versions')
  @UseInterceptors(FileInterceptor('file'))
  async createVersion(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body('changeDescription') changeDescription: string,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.evidenceService.createVersion(id, file, req.user?.id || 1, changeDescription);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.evidenceService.findOne(id);
  }

  @Get(':id/allowed-transitions')
  async getAllowedTransitions(@Param('id', ParseIntPipe) id: number) {
    const evidence = await this.evidenceService.findOne(id);
    if (!evidence) {
      throw new NotFoundException(`Evidence with ID ${id} not found`);
    }
    return {
      currentStatus: evidence.status,
      allowedTransitions: this.workflowService.getAllowedTransitions(evidence.status),
    };
  }

  @Get(':id/file')
  async downloadFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    try {
      const info = await this.evidenceService.getFileInfo(id);

      // Check if file exists on disk
      const fs = require('fs');
      if (!fs.existsSync(info.filePath)) {
        throw new NotFoundException(`File not found on server disk: ${info.filePath}`);
      }

      res.setHeader('Content-Type', info.fileType || 'application/octet-stream');
      // Inline to allow browser preview (PDF/images). Users can still download from the preview.
      res.setHeader('Content-Disposition', `inline; filename="${info.fileName}"`);
      return res.sendFile(info.filePath);
    } catch (error) {
      console.error('Download error:', error.message);
      if (error instanceof NotFoundException) {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: 'Internal server error during download' });
    }
  }
}
