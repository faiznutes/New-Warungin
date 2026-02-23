import { IsString, IsOptional, IsNumber, Max, IsObject, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOutletDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  shiftConfig?: any;

  @IsOptional()
  @IsObject()
  operatingHours?: any;
}

export class UpdateOutletDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  shiftConfig?: any;

  @IsOptional()
  @IsObject()
  operatingHours?: any;

  @IsOptional()
  isActive?: boolean;
}

export class GetOutletsDto {
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  isActive?: string; // 'true' or 'false'
}
