import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateUserDto, CreateDepartmentDto, UpdateDepartmentDto } from './dto/admin-mutation.dto';

@Injectable()
export class AdminService {
  constructor(private supabaseService: SupabaseService) {}

  private checkAdmin(user: any) {
    if (user.role_code !== 'ADMIN') {
      throw new ForbiddenException('Admin role required');
    }
  }

  async getUsers(user: any) {
    this.checkAdmin(user);
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*, departments(name)')
      .order('full_name');
    
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, dto: UpdateUserDto, actor: any) {
    this.checkAdmin(actor);
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('profiles')
      .update({
        ...dto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDepartments(user: any) {
    this.checkAdmin(user);
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('departments')
      .select('*')
      .order('code');
    
    if (error) throw error;
    return data;
  }

  async createDepartment(dto: CreateDepartmentDto, actor: any) {
    this.checkAdmin(actor);
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('departments')
      .insert([dto])
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async updateDepartment(id: string, dto: UpdateDepartmentDto, actor: any) {
    this.checkAdmin(actor);
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('departments')
      .update({
        ...dto,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
