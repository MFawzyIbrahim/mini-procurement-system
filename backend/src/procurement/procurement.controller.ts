import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';
import { ProcurementService } from './procurement.service';
import { CreatePODto } from './dto/create-po.dto';
import { POResponseDto } from './dto/po-response.dto';
import { RequestResponseDto } from '../requests/dto/request-response.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { POGenerationResponseDto } from '../common/dto/mutation-response.dto';

@ApiTags('Procurement / Purchase Orders')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller()
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('procurement/approved-requests')
  @ApiOperation({ summary: 'List approved requests ready for PO generation' })
  @ApiResponse({ status: 200, type: [RequestResponseDto] })
  async getApprovedRequests(@CurrentUser() user: any) {
    return this.procurementService.getApprovedRequests(user);
  }

  @Post('purchase-orders/from-request/:requestId')
  @ApiOperation({ summary: 'Generate a new Purchase Order from an approved request' })
  @ApiResponse({ status: 201, type: POGenerationResponseDto })
  async generatePO(
    @Param('requestId') requestId: string, 
    @Body() dto: CreatePODto, 
    @CurrentUser() user: any
  ) {
    return this.procurementService.generatePO(requestId, dto, user);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'List all purchase orders' })
  @ApiResponse({ status: 200, type: [POResponseDto] })
  async getPOs(@CurrentUser() user: any) {
    return this.procurementService.getPOs(user);
  }

  @Get('purchase-orders/:id')
  @ApiOperation({ summary: 'Get details of a specific purchase order (including items and logs)' })
  @ApiResponse({ status: 200, type: POResponseDto })
  async getPO(@Param('id') id: string, @CurrentUser() user: any) {
    return this.procurementService.getPO(id, user);
  }

  @Post('purchase-orders/:id/issue')
  @ApiOperation({ summary: 'Issue a Draft purchase order' })
  @ApiResponse({ status: 200, type: POResponseDto })
  async issue(@Param('id') id: string, @CurrentUser() user: any) {
    return this.procurementService.updateStatus(id, 'Issued', user);
  }

  @Post('purchase-orders/:id/close')
  @ApiOperation({ summary: 'Close an Issued purchase order' })
  @ApiResponse({ status: 200, type: POResponseDto })
  async close(@Param('id') id: string, @CurrentUser() user: any) {
    return this.procurementService.updateStatus(id, 'Closed', user);
  }

  @Post('purchase-orders/:id/cancel')
  @ApiOperation({ summary: 'Cancel a Draft or Issued purchase order' })
  @ApiResponse({ status: 200, type: POResponseDto })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.procurementService.updateStatus(id, 'Cancelled', user);
  }
}
