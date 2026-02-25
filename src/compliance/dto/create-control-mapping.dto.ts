import { IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum CoverageStatus {
  Covered = 'Covered',
  Partial = 'Partial',
  NotCovered = 'Not Covered',
}

export class CreateControlMappingDto {
  @Type(() => Number)
  @IsNumber()
  auditProgramId: number;

  @Type(() => Number)
  @IsNumber()
  frameworkId: number;

  @IsEnum(CoverageStatus)
  coverageStatus: CoverageStatus | string;
}
