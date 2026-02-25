import { IsString, IsOptional, IsNumber, MaxLength, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum MetricType {
  Number = 'Number',
  Percentage = 'Percentage',
  Currency = 'Currency',
}

export enum KriFrequency {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Quarterly = 'Quarterly',
}

export enum KriStatus {
  Green = 'green',
  Amber = 'amber',
  Red = 'red',
}

export class CreateKriDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(MetricType)
  metricType: MetricType | string;

  @Type(() => Number)
  @IsNumber()
  targetValue: number;

  @Type(() => Number)
  @IsNumber()
  warningThreshold: number;

  @Type(() => Number)
  @IsNumber()
  criticalThreshold: number;

  @Type(() => Number)
  @IsNumber()
  currentValue: number;

  @IsEnum(KriFrequency)
  frequency: KriFrequency | string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  riskId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ownerId?: number;

  @IsOptional()
  @IsEnum(KriStatus)
  status?: KriStatus | string;
}
