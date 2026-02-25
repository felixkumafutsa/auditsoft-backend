import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards, Req, Delete, Query, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { promises as fs } from 'fs';
import { join, basename } from 'path';

interface UploadedFileWithMetadata {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

const storage = diskStorage({
  destination: './uploads/policy-documents',
  filename: (req, file: UploadedFileWithMetadata, cb) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    const randomName = `${uuidv4()}-${name.replace(/\s/g, '_')}${fileExtName}`;
    cb(null, randomName);
  },
});

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly prisma: PrismaService) { }

  @Post('policy-document')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadPolicyDocument(
    @UploadedFile() file: UploadedFileWithMetadata,
    @Req() req: any,
    @Body('frameworkId') frameworkId?: any,
    @Body('description') description?: string,
    @Body('version') version?: string,
    @Body('policyName') policyName?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, DOC, and DOCX files are allowed.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 10MB.');
    }

    // Create a Policy record in the database
    const uploaderId = req.user?.id || 1;
    const policyData = {
      policyName: (policyName || file.originalname),
      version: version || '1.0',
      description: description || null,
      fileUrl: `/uploads/policy-documents/${file.filename}`,
      status: 'Draft',
      effectiveDate: new Date(),
    };

    const createdPolicy = await this.prisma.policy.create({
      data: policyData as any,
    });

    // If frameworkId provided, create a mapping
    const frameworkIdNum = frameworkId ? Number(frameworkId) : undefined;
    if (frameworkIdNum) {
      try {
        await this.prisma.policyMapping.create({
          data: {
            policyId: createdPolicy.id,
            frameworkId: frameworkIdNum,
          },
        });
      } catch (err) {
        // ignore mapping errors for now (e.g., unique constraint)
      }
    }

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/policy-documents/${file.filename}`,
      policy: createdPolicy,
    };
  }

  @Delete('policy-document')
  async deletePolicyDocument(
    @Query('filename') filename?: string,
  ) {
    if (!filename) {
      throw new BadRequestException('filename is required');
    }

    const safeName = basename(filename);
    const filePath = join(process.cwd(), 'uploads', 'policy-documents', safeName);

    try {
      await fs.stat(filePath);
    } catch (err) {
      throw new NotFoundException('File not found');
    }

    try {
      await fs.unlink(filePath);
    } catch (err) {
      throw new BadRequestException('Failed to delete file');
    }

    return { message: 'File deleted successfully', filename: safeName };
  }
}
