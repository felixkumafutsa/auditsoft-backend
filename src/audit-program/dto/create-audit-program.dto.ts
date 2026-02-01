export class CreateAuditProgramDto {
  auditId: number;
  procedureName: string;
  controlReference?: string;
  expectedOutcome?: string;
  actualResult?: string;
  reviewerComment?: string;
}
