import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RejectRequestDto {
  @ApiProperty({ example: 'Budget exceeded or incorrect specifications provided.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  reason: string;
}
