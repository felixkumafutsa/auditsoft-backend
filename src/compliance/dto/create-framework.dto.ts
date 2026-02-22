import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateFrameworkDto {
  @IsString()
  @MaxLength(255)
  frameworkName: string;

  @IsString()
  @MaxLength(50)
  version: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
