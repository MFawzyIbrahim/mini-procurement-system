import { ApiProperty } from '@nestjs/swagger';
import { POStatus } from '../../common/enums/status.enum';
import { RequestItemResponseDto } from '../../requests/dto/request-response.dto';
import { ProfileSummaryDto, RequestSummaryDto } from '../../common/dto/summary.dto';

export class AuditLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  action: string;

  @ApiProperty({ required: false, nullable: true })
  old_values?: any;

  @ApiProperty({ required: false, nullable: true })
  new_values?: any;

  @ApiProperty()
  created_at: string;

  @ApiProperty({ type: ProfileSummaryDto })
  profiles?: ProfileSummaryDto;
}

export class POResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  po_no: string;

  @ApiProperty()
  purchase_request_id: string;

  @ApiProperty()
  procurement_officer_id: string;

  @ApiProperty()
  supplier_name: string;

  @ApiProperty({ required: false, nullable: true })
  issue_date?: string | null;

  @ApiProperty({ required: false, nullable: true })
  delivery_date?: string | null;

  @ApiProperty({ enum: POStatus })
  status: POStatus;

  @ApiProperty()
  total_amount: number;

  @ApiProperty({ type: ProfileSummaryDto })
  profiles?: ProfileSummaryDto;

  @ApiProperty({ type: RequestSummaryDto })
  purchase_requests?: RequestSummaryDto;

  @ApiProperty({ type: [RequestItemResponseDto], required: false })
  items?: RequestItemResponseDto[];

  @ApiProperty({ type: [AuditLogResponseDto], required: false })
  fulfillment_activity?: AuditLogResponseDto[];
}
