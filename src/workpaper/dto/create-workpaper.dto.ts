import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateWorkpaperDto {
    @IsNumber()
    auditProgramId: number;

    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    conclusion?: string;

    @IsString()
    @IsOptional()
    testResults?: string;

    @IsString()
    @IsOptional()
    status?: string;

    @IsNumber()
    @IsOptional()
    preparedById?: number;
}
