import { IsString, IsArray, IsOptional, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateRiskAssessmentDto {
  @IsNumber()
  @IsNotEmpty()
  auditId: number;

  @IsString()
  @IsEnum(['planning', 'execution', 'review', 'closing'])
  @IsNotEmpty()
  stage: string;

  @IsString()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsNotEmpty()
  riskLevel: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  riskFactors: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mitigationActions?: string[];

  @IsNumber()
  @IsOptional()
  assessedBy?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
