import { IsOptional, IsEnum } from 'class-validator';
import { CoverageStatus } from './create-control-mapping.dto';

export class UpdateControlMappingDto {
  @IsOptional()
  @IsEnum(CoverageStatus)
  coverageStatus?: CoverageStatus | string;
}
