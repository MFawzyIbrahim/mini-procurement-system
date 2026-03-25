import { ApiProperty } from '@nestjs/swagger';

export class ProfileSummaryDto {
  @ApiProperty({ example: 'John Doe' })
  full_name: string;
}

export class RequestSummaryDto {
  @ApiProperty({ example: 'PR-20260325-A1B2' })
  request_no: string;
}

export class DeptSummaryDto {
  @ApiProperty({ example: 'IT' })
  name: string;
}
