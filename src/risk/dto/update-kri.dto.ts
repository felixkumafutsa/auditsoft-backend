import { PartialType } from '@nestjs/mapped-types';
import { CreateKriDto, KriStatus } from './create-kri.dto';
import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateKriDto extends PartialType(CreateKriDto) {
  @IsOptional()
  @IsEnum(KriStatus)
  status?: KriStatus | string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentValue?: number;
}
