import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestItemDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  @IsNotEmpty()
  item_name: string;

  @ApiProperty({ example: 'High-end workstation', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty({ example: 15, default: 0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  tax_percent?: number = 0;
}

export class CreateRequestDto {
  @ApiProperty({ example: '2026-04-01' })
  @IsDateString()
  @IsNotEmpty()
  needed_by_date: string;

  @ApiProperty({ example: 'Dell Inc.' })
  @IsString()
  @IsNotEmpty()
  supplier_name: string;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency_code: string = 'USD';

  @ApiProperty({ example: 'Urgent replacement for designer team', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreateRequestItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRequestItemDto)
  items: CreateRequestItemDto[];
}

export class UpdateRequestDto extends CreateRequestDto {}
