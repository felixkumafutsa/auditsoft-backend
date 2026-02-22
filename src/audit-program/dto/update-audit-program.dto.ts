import { IsString, IsOptional } from 'class-validator';

export class UpdateAuditProgramDto {
  @IsString()
  @IsOptional()
  procedureName?: string;

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
