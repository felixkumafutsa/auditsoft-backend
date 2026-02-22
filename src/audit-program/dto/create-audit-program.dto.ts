import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAuditProgramDto {
  @IsNumber()
  auditId: number;

  @IsString()
  procedureName: string;

  @IsString()
  @IsOptional()
  controlReference?: string;

  @IsString()
  @IsOptional()
  expectedOutcome?: string;

  @IsString()
  @IsOptional()
  actualResult?: string;

  @IsString()
  @IsOptional()
  reviewerComment?: string;
}
