import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceStatus, EvidenceWorkflowService } from '../workflow/evidence.workflow';
import { AuditService } from '../audit/audit.service';
import * as path from 'path';
import { promises as fs } from 'fs';
import * as fsSync from 'fs';

import { NotificationService } from '../notification/notification.service';

import { AuditLogService } from '../audit-log/audit-log.service';

@Injectable()
export class EvidenceService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
    private notificationService: NotificationService,
    private workflowService: EvidenceWorkflowService,
    private auditLogService: AuditLogService,
  ) {
    // Proactively audit and fix evidence file mismatches on service startup
    this.auditAndFixEvidenceFiles();
  }

  private async auditAndFixEvidenceFiles() {
    try {
      console.log('[EVIDENCE] Starting proactive file audit...');
      
      const allEvidence = await this.prisma.evidence.findMany({
        select: { id: true, fileName: true }
      });
      
      const uploadsDir = path.join(process.cwd(), 'uploads', 'evidence');
      const existingFiles = fsSync.existsSync(uploadsDir) ? fsSync.readdirSync(uploadsDir) : [];
      
      let fixedCount = 0;
      
      for (const evidence of allEvidence) {
        const expectedPath = path.join(uploadsDir, `${evidence.id}-${evidence.fileName}`);
        
        if (!fsSync.existsSync(expectedPath)) {
          const filesWithId = existingFiles.filter(f => f.startsWith(`${evidence.id}-`));
          
          if (filesWithId.length > 0) {
            const availableFile = filesWithId[0];
            const actualFileName = availableFile.substring(`${evidence.id}-`.length);
            
            await this.prisma.evidence.update({
              where: { id: evidence.id },
              data: {
                fileName: actualFileName,
                fileType: this.getMimeTypeFromExtension(actualFileName) || 'application/octet-stream'
              }
            });
            
            fixedCount++;
            console.log(`[EVIDENCE AUTO-FIX] Evidence ${evidence.id}: "${evidence.fileName}" → "${actualFileName}"`);
          }
        }
      }
      
      if (fixedCount > 0) {
        console.log(`[EVIDENCE] Proactively fixed ${fixedCount} evidence file mismatches`);
      } else {
        console.log(`[EVIDENCE] All evidence files are correctly matched`);
      }
    } catch (error) {
      console.error('[EVIDENCE] Error during proactive audit:', error);
    }
  }

  private getMimeTypeFromExtension(fileName: string): string | null {
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeTypes[ext] || null;
  }

  async create(auditProgramId: number, file: any, description?: string, uploadedById?: number, user?: any) {
    if (user) {
      // Find the audit associated with this program
      const auditProgram = await this.prisma.auditProgram.findUnique({
        where: { id: auditProgramId },
        select: { auditId: true }
      });

      if (!auditProgram) {
        throw new BadRequestException('Invalid Audit Program ID');
      }

      // Verify access to the audit and status
      const audit = await this.auditService.findOne(auditProgram.auditId, user);
      const allowedStatuses = ['In Progress', 'Under Review', 'Execution Finished'];
      if (!allowedStatuses.includes(audit.status)) {
        throw new BadRequestException(`Evidence can only be uploaded for audits that are 'In Progress' or 'Under Review'. Current status: ${audit.status}`);
      }
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

    // Log action with request info if available
    if (user) {
      await this.auditLogService.logActionFromRequest({
        userId: (uploadedById || 1).toString(),
        action: 'UPLOAD_EVIDENCE',
        entityType: 'Evidence',
        entityId: created.id.toString(),
      }, user);
    } else {
      // Fallback for cases where request context is not available
      await this.auditLogService.logAction({
        userId: (uploadedById || 1).toString(),
        action: 'UPLOAD_EVIDENCE',
        entityType: 'Evidence',
        entityId: created.id.toString(),
      });
    }

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
    
    // Primary file path
    let filePath = path.join(process.cwd(), 'uploads', 'evidence', `${evidence.id}-${evidence.fileName}`);
    
    // If primary file doesn't exist, try to find any file with the same ID
    if (!fsSync.existsSync(filePath)) {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'evidence');
      try {
        const files = await fs.readdir(uploadsDir);
        const filesWithId = files.filter(f => f.startsWith(`${evidence.id}-`));
        
        if (filesWithId.length > 0) {
          // Use the first available file
          const availableFile = filesWithId[0];
          filePath = path.join(uploadsDir, availableFile);
          const actualFileName = availableFile.substring(`${evidence.id}-`.length);
          
          // Update the database record to reflect the actual file
          await this.prisma.evidence.update({
            where: { id },
            data: { 
              fileName: actualFileName,
              fileType: this.getMimeTypeFromExtension(actualFileName) || evidence.fileType
            }
          });
          
          console.log(`[EVIDENCE AUTO-RECOVERY] Updated evidence ${id} filename from "${evidence.fileName}" to "${actualFileName}"`);
          
          // Return the updated file info
          return { 
            filePath, 
            fileType: this.getMimeTypeFromExtension(actualFileName) || evidence.fileType, 
            fileName: actualFileName 
          };
        } else {
          // No files found for this evidence ID
          console.warn(`[EVIDENCE WARNING] No files found for evidence ID ${id} (expected: ${evidence.fileName})`);
          throw new NotFoundException(`No files found for evidence ID ${id}. Expected file: ${evidence.fileName}`);
        }
      } catch (error) {
        console.error('Error checking fallback files:', error);
        throw new NotFoundException(`File not found on server disk: ${filePath}`);
      }
    }
    
    return { filePath, fileType: evidence.fileType, fileName: evidence.fileName };
  }

  async findAll(auditProgramId: number) {
    const items = await this.prisma.evidence.findMany({
      where: { auditProgramId },
      include: {
        uploadedBy: true,
        auditProgram: {
          include: {
            audit: true
          }
        }
      },
    });
    return this.attachFileStatus(items);
  }

  async findAllGlobal(status?: string) {
    const items = await this.prisma.evidence.findMany({
      where: status ? { status } : {},
      include: {
        uploadedBy: true,
        auditProgram: {
          include: {
            audit: true
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });
    return this.attachFileStatus(items);
  }

  private attachFileStatus(items: any[]) {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'evidence');
    return items.map(item => {
      const filePath = path.join(uploadsDir, `${item.id}-${item.fileName}`);
      return {
        ...item,
        fileMissing: !fsSync.existsSync(filePath)
      };
    });
  }

  async remove(id: number) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
      select: { status: true }
    });

    if (!evidence) {
      throw new BadRequestException('Evidence not found');
    }

    if (evidence.status !== EvidenceStatus.UPLOADED) {
      throw new BadRequestException(`Evidence cannot be deleted in '${evidence.status}' status. Deletion is only allowed for 'Uploaded' evidence.`);
    }

    return this.prisma.evidence.delete({
      where: { id },
    });
  }

  async findOne(id: number) {
    const item = await this.prisma.evidence.findUnique({
      where: { id },
      include: {
        uploadedBy: true,
        auditProgram: {
          include: {
            audit: true
          }
        },
        versions: {
          orderBy: { version: 'desc' },
          include: { uploadedBy: true }
        }
      },
    });

    if (!item) return null;

    const filePath = path.join(process.cwd(), 'uploads', 'evidence', `${item.id}-${item.fileName}`);
    return {
      ...item,
      fileMissing: !fsSync.existsSync(filePath)
    };
  }

  async createVersion(id: number, file: any, uploadedById: number, changeDescription?: string, user?: any) {
    const evidence = await this.prisma.evidence.findUnique({
      where: { id },
    });

    if (!evidence) {
      throw new BadRequestException('Evidence not found');
    }

    // Create a new version
    const newVersionNumber = (await this.prisma.evidenceVersion.count({
      where: { evidenceId: id }
    })) + 1;

    const version = await this.prisma.evidenceVersion.create({
      data: {
        evidenceId: id,
        version: newVersionNumber,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileHash: 'dummy_hash_' + Date.now(),
        uploadedById,
        description: changeDescription || `Version ${newVersionNumber}`,
      }
    });

    // Update the main evidence record to point to the latest file metadata if needed
    // In this simple implementation, we'll keep the main evidence record as the current version
    await this.prisma.evidence.update({
      where: { id },
      data: {
        fileName: file.originalname,
        fileType: file.mimetype,
        fileHash: version.fileHash,
        updatedAt: new Date(),
      }
    });

    // Persist file
    try {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'evidence', 'versions');
      await fs.mkdir(uploadsDir, { recursive: true });
      const destPath = path.join(uploadsDir, `${version.id}-${version.fileName}`);
      if (file?.buffer) {
        await fs.writeFile(destPath, file.buffer);
      }
    } catch (e) {
      console.error('Failed to persist evidence version file', e);
    }

    // Log action with request info if available
    if (user) {
      await this.auditLogService.logActionFromRequest({
        userId: uploadedById.toString(),
        action: 'CREATE_EVIDENCE_VERSION',
        entityType: 'Evidence',
        entityId: id.toString(),
      }, user);
    } else {
      // Fallback for cases where request context is not available
      await this.auditLogService.logAction({
        userId: uploadedById.toString(),
        action: 'CREATE_EVIDENCE_VERSION',
        entityType: 'Evidence',
        entityId: id.toString(),
      });
    }

    return version;
  }

  async updateStatus(id: number, status: string, userId?: number, user?: any) {
    const evidence = await this.findOne(id);
    if (!evidence) throw new BadRequestException('Evidence not found');

    const auditProgram = await this.prisma.auditProgram.findUnique({
      where: { id: evidence.auditProgramId },
      select: { auditId: true }
    });
    if (auditProgram?.auditId) {
      const audit = await this.auditService.findOne(auditProgram.auditId);
      const allowedAuditStatuses = ['In Progress', 'Under Review', 'Execution Finished', 'Finalized'];
      if (!allowedAuditStatuses.includes(audit.status)) {
        throw new BadRequestException(`Evidence status cannot be changed when audit is in '${audit.status}' status.`);
      }
    }

    // Validate Transition
    if (!this.workflowService.canTransition(evidence.status, status)) {
      throw new BadRequestException(`Cannot transition evidence from ${evidence.status} to ${status}`);
    }

    const updatedEvidence = await this.prisma.evidence.update({
      where: { id },
      data: { status },
      include: { auditProgram: true }
    });

    // Log action with request info if available
    if (userId) {
      if (user) {
        await this.auditLogService.logActionFromRequest({
          userId: userId.toString(),
          action: `UPDATE_EVIDENCE_STATUS_${status}`,
          entityType: 'Evidence',
          entityId: id.toString(),
        }, user);
      } else {
        // Fallback for cases where request context is not available
        await this.auditLogService.logAction({
          userId: userId.toString(),
          action: `UPDATE_EVIDENCE_STATUS_${status}`,
          entityType: 'Evidence',
          entityId: id.toString(),
        });
      }
    }

    // Notifications
    try {
      const auditProgram = updatedEvidence.auditProgram;
      const audit = await this.auditService.findOne(auditProgram.auditId);
      const auditName = audit.auditName;
      const link = `/audits/${audit.id}`; // Or evidence specific link

      // Reviewed: Notify Manager (who reviews and approves evidence)
      if (status === EvidenceStatus.REVIEWED) {
        if (audit.assignedManagerId) {
          await this.notificationService.create({
            userId: audit.assignedManagerId,
            title: 'Evidence Ready for Review',
            message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' has been uploaded and is ready for your review.`,
            type: 'action_required',
            link
          });
        }
      }

      // Approved: Notify Auditor that evidence is approved
      if (status === EvidenceStatus.APPROVED) {
        await this.notificationService.create({
          userId: updatedEvidence.uploadedById,
          title: 'Evidence Approved',
          message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' has been approved by the Manager.`,
          type: 'success',
          link
        });
      }

      // Archived: Notify Auditor that evidence is archived
      if (status === EvidenceStatus.ARCHIVED) {
        await this.notificationService.create({
          userId: updatedEvidence.uploadedById,
          title: 'Evidence Archived',
          message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' has been archived by the Manager.`,
          type: 'info',
          link
        });
      }

      // Rejected: Notify Uploader
      if (status === EvidenceStatus.UPLOADED) {
        await this.notificationService.create({
          userId: updatedEvidence.uploadedById,
          title: 'Evidence Rejected',
          message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' was rejected.`,
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
