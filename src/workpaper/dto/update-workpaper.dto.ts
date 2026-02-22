import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkpaperDto } from './create-workpaper.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateWorkpaperDto extends PartialType(CreateWorkpaperDto) {
    @IsNumber()
    @IsOptional()
    reviewedById?: number;
}
