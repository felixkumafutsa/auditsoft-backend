import { IsString, IsOptional } from 'class-validator';

export class CreateAuditUniverseDto {
  @IsString()
  entityType: string;

  @IsString()
  entityName: string;

  @IsString()
  @IsOptional()
  riskRating?: string;
}
