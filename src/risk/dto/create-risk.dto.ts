import { IsString, IsOptional, IsNumber, MaxLength, IsEnum } from 'class-validator';

export enum ImpactLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export enum LikelihoodLevel {
  RARE = 'Rare',
  UNLIKELY = 'Unlikely',
  POSSIBLE = 'Possible',
  LIKELY = 'Likely',
  CERTAIN = 'Certain'
}

export enum RiskStatus {
  IDENTIFIED = 'Identified',
  ASSESSED = 'Assessed',
  MITIGATED = 'Mitigated',
  ACCEPTED = 'Accepted',
  CLOSED = 'Closed'
}

export class CreateRiskDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @MaxLength(100)
  category: string;

  @IsEnum(ImpactLevel)
  impact: string;

  @IsEnum(LikelihoodLevel)
  likelihood: string;

  @IsOptional()
  @IsNumber()
  ownerId?: number;

  @IsOptional()
  @IsEnum(ImpactLevel)
  inherentImpact?: string;

  @IsOptional()
  @IsEnum(LikelihoodLevel)
  inherentLikelihood?: string;

  @IsOptional()
  @IsEnum(ImpactLevel)
  residualImpact?: string;

  @IsOptional()
  @IsEnum(LikelihoodLevel)
  residualLikelihood?: string;

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: string;
}
