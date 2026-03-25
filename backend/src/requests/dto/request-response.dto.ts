import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '../../common/enums/status.enum';
import { ProfileSummaryDto, DeptSummaryDto } from '../../common/dto/summary.dto';

export class RequestItemResponseDto {
// ... items same ...
}

export class ApprovalHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiProperty({ required: false, nullable: true })
  rejection_reason?: string | null;

  @ApiProperty()
  created_at: string;

  @ApiProperty({ type: ProfileSummaryDto })
  profiles?: ProfileSummaryDto;
}

export class RequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  request_no: string;

  @ApiProperty()
  needed_by_date: string;

  @ApiProperty()
  supplier_name: string;

  @ApiProperty()
  currency_code: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ enum: RequestStatus })
  status: RequestStatus;

  @ApiProperty()
  total_before_tax: number;

  @ApiProperty()
  total_tax: number;

  @ApiProperty()
  grand_total: number;

  @ApiProperty({ type: [RequestItemResponseDto] })
  items?: RequestItemResponseDto[];

  @ApiProperty({ type: ProfileSummaryDto })
  profiles?: ProfileSummaryDto;

  @ApiProperty({ type: DeptSummaryDto, required: false, nullable: true })
  departments?: DeptSummaryDto | null;
  
  @ApiProperty()
  created_at: string;

  @ApiProperty({ type: [ApprovalHistoryDto], required: false })
  approval_history?: ApprovalHistoryDto[];
}
