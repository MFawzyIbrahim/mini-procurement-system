import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SupabaseGuard } from '../auth/supabase.guard';
import { AdminService } from './admin.service';
import { CurrentUser } from '../common/current-user.decorator';
import { UpdateUserDto, CreateDepartmentDto, UpdateDepartmentDto } from './dto/admin-mutation.dto';
import { ProfileResponseDto } from '../auth/dto/profile-response.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(SupabaseGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users in the system (Admin only)' })
  @ApiResponse({ status: 200, type: [ProfileResponseDto] })
  async getUsers(@CurrentUser() admin: any) {
    return this.adminService.getUsers(admin);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user role or status (Admin only)' })
  @ApiResponse({ status: 200, type: ProfileResponseDto })
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() admin: any) {
    return this.adminService.updateUser(id, dto, admin);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List all departments (Admin only)' })
  @ApiResponse({ status: 200, type: [DepartmentResponseDto] })
  async getDepartments(@CurrentUser() admin: any) {
    return this.adminService.getDepartments(admin);
  }

  @Post('departments')
  @ApiOperation({ summary: 'Create a new department (Admin only)' })
  @ApiResponse({ status: 201, type: DepartmentResponseDto })
  async createDepartment(@Body() dto: CreateDepartmentDto, @CurrentUser() admin: any) {
    return this.adminService.createDepartment(dto, admin);
  }

  @Patch('departments/:id')
  @ApiOperation({ summary: 'Update an existing department name (Admin only). Note: Code is immutable.' })
  @ApiResponse({ status: 200, type: DepartmentResponseDto })
  async updateDepartment(@Param('id') id: string, @Body() dto: UpdateDepartmentDto, @CurrentUser() admin: any) {
    return this.adminService.updateDepartment(id, dto, admin);
  }
}
