import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePODto {
  @ApiProperty({ example: 'PO-2026-001' })
  @IsString()
  @IsNotEmpty()
  po_no: string;

  @ApiProperty({ example: 'Dell Inc.' })
  @IsString()
  @IsNotEmpty()
  supplier_name: string;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  @Min(0)
  total_amount: number;
}
