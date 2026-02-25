import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

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

  // Enhanced Operational Fields
  @IsString()
  @IsOptional()
  samplingApproach?: string;

  @IsNumber()
  @IsOptional()
  sampleSize?: number;

  @IsNumber()
  @IsOptional()
  confidenceLevel?: number;

  @IsNumber()
  @IsOptional()
  materialityThreshold?: number;

  @IsString()
  @IsOptional()
  testMethod?: string;

  @IsString()
  @IsOptional()
  evidenceRequired?: string;

  @IsString()
  @IsOptional()
  documentationReq?: string;

  @IsString()
  @IsOptional()
  stepByStepProcedure?: string;
}
