import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class UpdateActionPlanDto {
  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  ownerId?: number;

  @IsDate()
  @IsOptional()
  dueDate?: Date;

  @IsString()
  @IsOptional()
  status?: string;
}
