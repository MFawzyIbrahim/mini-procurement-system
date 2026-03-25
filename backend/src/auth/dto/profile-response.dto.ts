import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  full_name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  department_id?: string | null;

  @ApiProperty({ enum: ['REQUESTER', 'APPROVER', 'PROCUREMENT', 'ADMIN'] })
  role_code: string;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty()
  created_at: string;
}
