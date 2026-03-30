import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ApprovalsService {
  constructor(private supabaseService: SupabaseService) { }

  async getInbox(user: any) {
    if (user.role_code !== 'APPROVER' && user.role_code !== 'ADMIN') {
      throw new ForbiddenException('Only approvers or admins can access the approval inbox');
    }

    const client = this.supabaseService.getClient();
    let query = client
      .from('purchase_requests')
      .select('*, profiles(full_name), departments(name)')
      .eq('status', 'Submitted');

    // Approvers only see their own department's pending requests
    if (user.role_code === 'APPROVER') {
      query = query.eq('department_id', user.department_id);
    }

    const { data, error } = await query.order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  }

  async getDetail(id: string, user: any) {
    const client = this.supabaseService.getClient();
    const { data: request, error } = await client
      .from('purchase_requests')
      .select(`
        *, 
        items:purchase_request_items(*), 
        profiles(full_name), 
        departments(name),
        approval_history:approvals(*, profiles:approver_id(full_name))
      `)
      .eq('id', id)
      .single();

    if (error || !request) throw new NotFoundException('Purchase request not found');

    if (request.status !== 'Submitted') {
      throw new BadRequestException('Request is not in Submitted state');
    }

    // Role check
    if (user.role_code === 'APPROVER' && request.department_id !== user.department_id) {
      throw new ForbiddenException('Access denied to this department request');
    }

    return request;
  }

  async approve(id: string, user: any, accessToken: string) {
    const serviceClient = this.supabaseService.getClient();

    // 1. Pre-check: Request exists and is in Submitted state
    const { data: request, error: fetchError } = await serviceClient
      .from('purchase_requests')
      .select('status, department_id')
      .eq('id', id)
      .single();

    if (fetchError || !request) throw new NotFoundException('Purchase request not found');
    if (request.status !== 'Submitted') {
      throw new BadRequestException(`Request is in ${request.status} state, not Submitted`);
    }

    // 2. Pre-check: APPROVER belongs to the same department
    if (user.role_code === 'APPROVER' && request.department_id !== user.department_id) {
      throw new ForbiddenException('You can only approve requests from your own department');
    }

    // 3. Call RPC using user-scoped client to provide auth context (auth.uid())
    const userClient = this.supabaseService.getUserClient(accessToken);
    const { data, error } = await userClient.rpc('approve_request', {
      p_request_id: id
    });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data };
  }

  async reject(id: string, reason: string, user: any, accessToken: string) {
    const serviceClient = this.supabaseService.getClient();

    // 1. Pre-check: Request exists and is in Submitted state
    const { data: request, error: fetchError } = await serviceClient
      .from('purchase_requests')
      .select('status, department_id')
      .eq('id', id)
      .single();

    if (fetchError || !request) throw new NotFoundException('Purchase request not found');
    if (request.status !== 'Submitted') {
      throw new BadRequestException(`Request is in ${request.status} state, not Submitted`);
    }

    // 2. Pre-check: APPROVER belongs to the same department
    if (user.role_code === 'APPROVER' && request.department_id !== user.department_id) {
      throw new ForbiddenException('You can only reject requests from your own department');
    }

    // 3. Call RPC using user-scoped client to provide auth context (auth.uid())
    const userClient = this.supabaseService.getUserClient(accessToken);
    const { data, error } = await userClient.rpc('reject_request', {
      p_request_id: id,
      p_reason: reason
    });

    if (error) throw new BadRequestException(error.message);
    return { success: true, data };
  }
}
