import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateFrameworkDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  frameworkName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  version?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
