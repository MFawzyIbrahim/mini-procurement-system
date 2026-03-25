import { ApiProperty } from '@nestjs/swagger';
import { RequestResponseDto } from '../../requests/dto/request-response.dto';

export class ApprovalActionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: RequestResponseDto })
  data: RequestResponseDto;
}

export class POGenerationResponseDto {
  @ApiProperty({ example: '7d563914-f08a-4b9e-9788-293623709b4d' })
  id: string;

  @ApiProperty({ example: 'PO generated successfully' })
  message: string;
}
