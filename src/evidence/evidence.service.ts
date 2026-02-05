import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceStatus, EvidenceWorkflowService } from '../workflow/evidence.workflow';
import { AuditService } from '../audit/audit.service';
import * as path from 'path';
import { promises as fs } from 'fs';

import { NotificationService } from '../notification/notification.service';

@Injectable()
export class EvidenceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    private workflowService: EvidenceWorkflowService,
  ) {}

  async create(auditProgramId: number, file: any, description?: string, uploadedById?: number, user?: any) {
    // In a real application, you would upload the file to S3 or local storage here
    // and get the URL/path and hash.

    if (user) {
      // Find the audit associated with this program
      const auditProgram = await this.prisma.auditProgram.findUnique({
        where: { id: auditProgramId },
        select: { auditId: true }
      });

      if (!auditProgram) {
        throw new BadRequestException('Invalid Audit Program ID');
      }

      // Verify access to the audit
      await this.auditService.findOne(auditProgram.auditId, user);
    }
    
    const created = await this.prisma.evidence.create({
      data: {
        auditProgramId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileHash: 'dummy_hash_' + Date.now(), // Placeholder
        uploadedById: uploadedById || 1, // Default to admin/system user if not provided
        description,
        status: EvidenceStatus.UPLOADED,
      },
    });

    // Persist file to local storage for download/preview
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'evidence');
      await fs.mkdir(uploadsDir, { recursive: true });
      const destPath = path.join(uploadsDir, `${created.id}-${created.fileName}`);
      if (file?.buffer) {
        await fs.writeFile(destPath, file.buffer);
      } else if (file?.path) {
        // Multer disk storage fallback
        await fs.copyFile(file.path, destPath);
      }
    } catch (e) {
      // Non-fatal: file persistence failure should not break metadata creation
      console.error('Failed to persist evidence file', e);
    }

    try {
      const ap = await this.prisma.auditProgram.findUnique({
        where: { id: auditProgramId },
        select: { auditId: true }
      });
      if (ap?.auditId) {
        const audit = await this.auditService.findOne(ap.auditId) as any;
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'New Evidence Uploaded',
            message: `Evidence '${created.fileName}' was uploaded for audit '${audit.auditName}'. Review is required.`,
            type: 'action_required',
            link: `/audits/${audit.id}`
          });
        }
      }
    } catch (e) {
      console.error('Failed to send upload notification', e);
    }

    return created;
  }

  async getFileInfo(id: number) {
    const evidence = await this.findOne(id);
    if (!evidence) throw new BadRequestException('Evidence not found');
    const filePath = path.join(process.cwd(), 'uploads', 'evidence', `${evidence.id}-${evidence.fileName}`);
    console.log('Accessing file at:', filePath);
    return { filePath, fileType: evidence.fileType, fileName: evidence.fileName };
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

  async findOne(id: number) {
    return this.prisma.evidence.findUnique({
      where: { id },
      include: { uploadedBy: true },
    });
  }

  async updateStatus(id: number, status: string) {
    const evidence = await this.findOne(id);
    if (!evidence) throw new BadRequestException('Evidence not found');

    // Validate Transition
    if (!this.workflowService.canTransition(evidence.status, status)) {
        throw new BadRequestException(`Cannot transition evidence from ${evidence.status} to ${status}`);
    }

    const updatedEvidence = await this.prisma.evidence.update({
      where: { id },
      data: { status },
      include: { auditProgram: true }
    });

    // Notifications
    try {
        const auditProgram = updatedEvidence.auditProgram;
        const audit = await this.auditService.findOne(auditProgram.auditId);
        const auditName = audit.auditName;
        const link = `/audits/${audit.id}`; // Or evidence specific link

        // Reviewed: Notify CAE to approve
        if (status === EvidenceStatus.REVIEWED) {
            const caes = await this.prisma.user.findMany({
              where: {
                userRoles: {
                  some: {
                    role: {
                      roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                    }
                  }
                }
              }
            });
            for (const cae of caes) {
              await this.notificationService.create({
                userId: cae.id,
                title: 'Evidence Reviewed',
                message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' is ready for approval.`,
                type: 'action_required',
                link
              });
            }
        }

        // Approved: Notify CAE to archive
        if (status === EvidenceStatus.APPROVED) {
            const caes = await this.prisma.user.findMany({
              where: {
                userRoles: {
                  some: {
                    role: {
                      roleName: { in: ['CAE', 'Chief Audit Executive', 'Chief Audit Executive (CAE)'] }
                    }
                  }
                }
              }
            });
            for (const cae of caes) {
              await this.notificationService.create({
                userId: cae.id,
                title: 'Evidence Approved',
                message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' has been approved. Archiving is pending.`,
                type: 'info',
                link
              });
            }
        }

        // Rejected (Back to Uploaded from Reviewed): Notify Uploader
        if (evidence.status === EvidenceStatus.REVIEWED && status === EvidenceStatus.UPLOADED) {
             await this.notificationService.create({
                userId: updatedEvidence.uploadedById,
                title: 'Evidence Rejected',
                message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' was rejected/returned.`,
                type: 'warning',
                link
            });
        }

    } catch (e) {
      console.error('Failed to send evidence notification', e);
    }

    return updatedEvidence;
  }
}
