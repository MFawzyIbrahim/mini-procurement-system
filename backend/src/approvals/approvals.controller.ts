import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ApprovalsService } from './approvals.service';
import { CurrentUser } from '../common/current-user.decorator';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestResponseDto } from '../requests/dto/request-response.dto';
import { ApprovalActionResponseDto } from '../common/dto/mutation-response.dto';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  @ApiOperation({ summary: 'List pending requests in the users department inbox' })
  @ApiResponse({ status: 200, type: [RequestResponseDto] })
  async getInbox(@CurrentUser() user: any) {
    return this.approvalsService.getInbox(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a request pending approval (including history)' })
  @ApiResponse({ status: 200, type: RequestResponseDto })
  async getDetail(@Param('id') id: string, @CurrentUser() user: any) {
    return this.approvalsService.getDetail(id, user);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a purchase request' })
  @ApiResponse({ status: 200, type: ApprovalActionResponseDto })
  async approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.approvalsService.approve(id, user);
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject a purchase request with a mandatory reason' })
  @ApiResponse({ status: 200, type: ApprovalActionResponseDto })
  async reject(@Param('id') id: string, @Body() dto: RejectRequestDto, @CurrentUser() user: any) {
    return this.approvalsService.reject(id, dto.reason, user);
  }
}
