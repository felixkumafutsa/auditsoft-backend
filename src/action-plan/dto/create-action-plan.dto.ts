import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';

export class CreateActionPlanDto {
  @IsNumber()
  findingId: number;

  @IsString()
  description: string;

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
