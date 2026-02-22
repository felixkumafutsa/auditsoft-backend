import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../../prisma/prisma.service';

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
  constructor(private readonly prisma: PrismaService) {}

  @Post('policy-document')
  @UseInterceptors(FileInterceptor('file', { storage }))
  async uploadPolicyDocument(
    @UploadedFile() file: UploadedFileWithMetadata,
    @Req() req: any,
    @Body('frameworkId') frameworkId?: number,
    @Body('description') description?: string,
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

    // Store file record in database if frameworkId is provided
    // TODO: Add database storage once PolicyDocument model is created
    let fileRecord = null;
    if (frameworkId) {
      // fileRecord = await this.prisma.policyDocument.create({
      //   data: {
      //     frameworkId,
      //     fileName: file.originalname,
      //     fileType: file.mimetype,
      //     fileHash: `hash_${Date.now()}`, // Generate proper hash in production
      //     uploadedById: req.user?.id || 1,
      //     description,
      //     filePath: `/uploads/policy-documents/${file.filename}`,
      //   },
      // });
      console.log(`File uploaded for framework ${frameworkId}: ${file.originalname}`);
    }

    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/policy-documents/${file.filename}`,
      fileRecord,
    };
  }
}
