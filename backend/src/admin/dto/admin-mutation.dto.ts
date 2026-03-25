import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsUUID, IsIn } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ enum: ['REQUESTER', 'APPROVER', 'PROCUREMENT', 'ADMIN'], required: false })
  @IsOptional()
  @IsIn(['REQUESTER', 'APPROVER', 'PROCUREMENT', 'ADMIN'])
  role_code?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  department_id?: string;
}

export class CreateDepartmentDto {
  @ApiProperty({ example: 'IT' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Information Technology' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateDepartmentDto {
  @ApiProperty({ example: 'Information Technology', description: 'Updated name of the department. Note: Department Code is immutable.' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
