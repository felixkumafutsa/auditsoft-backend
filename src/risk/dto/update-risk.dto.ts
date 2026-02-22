import { IsOptional, IsEnum } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateRiskDto, RiskStatus } from './create-risk.dto';

export class UpdateRiskDto extends PartialType(CreateRiskDto) {
  @IsOptional()
  @IsEnum(RiskStatus)
  status?: string;
}
