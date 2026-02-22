import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateAuditUniverseDto {
  @IsString()
  entityType: string;

  @IsString()
  entityName: string;

  @IsString()
  @IsOptional()
  riskRating?: string;

  @IsNumber()
  @IsOptional()
  ownerId?: number;
}
