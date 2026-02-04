import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EvidenceStatus, EvidenceWorkflowService } from '../workflow/evidence.workflow';
import { AuditService } from '../audit/audit.service';

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
    
    return this.prisma.evidence.create({
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

        // Reviewed: Notify Manager
        if (status === EvidenceStatus.REVIEWED && audit.assignedManagerId) {
            await this.notificationService.create({
                userId: audit.assignedManagerId,
                title: 'Evidence Reviewed',
                message: `Evidence '${updatedEvidence.fileName}' in '${auditName}' marked as Reviewed.`,
                type: 'info',
                link
            });
        }

        // Approved: Notify Uploader (Auditor)
        if (status === EvidenceStatus.APPROVED) {
            await this.notificationService.create({
                userId: updatedEvidence.uploadedById,
                title: 'Evidence Approved',
                message: `Your evidence '${updatedEvidence.fileName}' in '${auditName}' has been approved.`,
                type: 'success',
                link
            });
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
