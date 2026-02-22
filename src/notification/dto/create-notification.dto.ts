import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateNotificationDto {
  @IsNumber()
  userId: number;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  link?: string;
}
