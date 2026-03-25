import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePODto } from './dto/create-po.dto';

@Injectable()
export class ProcurementService {
  constructor(private supabaseService: SupabaseService) {}

  private checkProcurement(user: any) {
    if (user.role_code !== 'PROCUREMENT' && user.role_code !== 'ADMIN') {
      throw new ForbiddenException('Procurement or Admin role required');
    }
  }

  async getApprovedRequests(user: any) {
    this.checkProcurement(user);
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_requests')
      .select('*, profiles(full_name), departments(name)')
      .eq('status', 'Approved')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async generatePO(requestId: string, dto: CreatePODto, user: any) {
    this.checkProcurement(user);
    const client = this.supabaseService.getClient();
    
    // Call RPC: create_purchase_order_and_convert_request(p_request_id, p_po_no, p_supplier_name, p_total_amount)
    const { data, error } = await client.rpc('create_purchase_order_and_convert_request', {
      p_request_id: requestId,
      p_po_no: dto.po_no,
      p_supplier_name: dto.supplier_name,
      p_total_amount: dto.total_amount
    });

    if (error) throw new BadRequestException(error.message);
    return { id: data, message: 'PO generated successfully' };
  }

  async getPOs(user: any) {
    this.checkProcurement(user);
    const client = this.supabaseService.getClient();
    const { data, error } = await client
      .from('purchase_orders')
      .select('*, profiles(full_name), purchase_requests(request_no)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getPO(id: string, user: any) {
    this.checkProcurement(user);
    const client = this.supabaseService.getClient();
    const { data: po, error } = await client
      .from('purchase_orders')
      .select('*, profiles:procurement_officer_id(full_name), purchase_requests(*)')
      .eq('id', id)
      .single();

    if (error || !po) throw new NotFoundException('Purchase order not found');

    // Fetch items from the linked request
    const { data: items } = await client
      .from('purchase_request_items')
      .select('*')
      .eq('purchase_request_id', po.purchase_request_id);

    // Fetch audit logs for this PO
    const { data: logs } = await client
      .from('audit_logs')
      .select('*, profiles:actor_id(full_name)')
      .eq('entity_id', id)
      .eq('entity_type', 'purchase_order')
      .order('created_at', { ascending: true });

    return {
      ...po,
      items: items || [],
      fulfillment_activity: logs || []
    };
  }

  async updateStatus(id: string, status: string, user: any) {
    this.checkProcurement(user);
    const client = this.supabaseService.getClient();
    
    const { data, error } = await client
      .from('purchase_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
