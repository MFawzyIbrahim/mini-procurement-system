import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseGuard } from './supabase.guard';
import { ProfileResponseDto } from './dto/profile-response.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('auth')
export class AuthController {

  @Get('me')
  @ApiOperation({ summary: 'Get verified profile of the authenticated user' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async getMe(@Request() req) {
    return req.user;
  }
}
