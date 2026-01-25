import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EvidenceService {
  constructor(private prisma: PrismaService) {}

  async create(auditProgramId: number, file: any, description?: string, uploadedById?: number) {
    // In a real application, you would upload the file to S3 or local storage here
    // and get the URL/path and hash.
    
    return this.prisma.evidence.create({
      data: {
        auditProgramId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileHash: 'dummy_hash_' + Date.now(), // Placeholder
        uploadedById: uploadedById || 1, // Default to admin/system user if not provided
        description,
        status: 'active',
      },
    });
  }

  async findAll(auditProgramId: number) {
    return this.prisma.evidence.findMany({
      where: { auditProgramId },
      include: { uploadedBy: true },
    });
  }

  async remove(id: number) {
    return this.prisma.evidence.delete({
      where: { id },
    });
  }
}
