import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestDto } from './dto/create-request.dto';
import { RequestResponseDto } from './dto/request-response.dto';
import { CurrentUser } from '../common/current-user.decorator';
import { RequestStatus } from '../common/enums/status.enum';

@ApiTags('Requests')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}
  
  @Get()
  @ApiOperation({ summary: 'List purchase requests visible to the authenticated user' })
  @ApiResponse({ status: 200, type: [RequestResponseDto] })
  async getRequests(@CurrentUser() user: any) {
    return this.requestsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific purchase request' })
  @ApiResponse({ status: 200, type: RequestResponseDto })
  async getRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requestsService.findOne(id, user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new purchase request draft' })
  @ApiResponse({ status: 201, type: RequestResponseDto })
  async createRequest(@Body() dto: CreateRequestDto, @CurrentUser() user: any) {
    return this.requestsService.create(dto, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing purchase request draft (full form edit)' })
  @ApiResponse({ status: 200, type: RequestResponseDto })
  async updateRequest(@Param('id') id: string, @Body() dto: UpdateRequestDto, @CurrentUser() user: any) {
    return this.requestsService.update(id, dto, user);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit a purchase request for approval' })
  @ApiResponse({ status: 200, type: RequestResponseDto })
  async submitRequest(@Param('id') id: string, @CurrentUser() user: any) {
    return this.requestsService.submit(id, user);
  }
}
