
import { Audit } from '@prisma/client';

export interface AuditState {
  approve(audit: Audit, userId: number): Promise<void>;
  start(audit: Audit, userId: number): Promise<void>;
  review(audit: Audit, userId: number): Promise<void>;
  finalize(audit: Audit, userId: number): Promise<void>;
  close(audit: Audit, userId: number): Promise<void>;
  reject(audit: Audit, userId: number, reason: string): Promise<void>;
}
