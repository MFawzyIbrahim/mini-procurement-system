import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateRequestDto, UpdateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(user: any) {
    const client = this.supabaseService.getClient();
    let query = client.from('purchase_requests').select('*, profiles(full_name), departments(name)');

    if (user.role_code === 'REQUESTER') {
      query = query.eq('requester_id', user.id);
    } else if (user.role_code === 'APPROVER') {
      query = query.or(`requester_id.eq.${user.id},and(status.neq.Draft,department_id.eq.${user.department_id})`);
    } else if (user.role_code === 'PROCUREMENT') {
      query = query.in('status', ['Approved', 'Converted to PO']);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async findOne(id: string, user: any) {
    const client = this.supabaseService.getClient();
    const { data: request, error } = await client
      .from('purchase_requests')
      .select('*, items:purchase_request_items(*), profiles(full_name), departments(name)')
      .eq('id', id)
      .single();

    if (error || !request) throw new NotFoundException('Purchase request not found');

    if (user.role_code === 'REQUESTER' && request.requester_id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return request;
  }

  async create(dto: CreateRequestDto, user: any) {
    const client = this.supabaseService.getClient();
    
    // Generate request number (backend side for consistency)
    const requestNo = `PR-${new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 12)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 1. Create Request Header
    const { data: request, error: reqErr } = await client
      .from('purchase_requests')
      .insert([{
        request_no: requestNo,
        requester_id: user.id,
        department_id: user.department_id,
        needed_by_date: dto.needed_by_date,
        supplier_name: dto.supplier_name,
        currency_code: dto.currency_code,
        notes: dto.notes,
        status: 'Draft'
      }])
      .select()
      .single();

    if (reqErr) throw reqErr;

    // 2. Insert Items
    const itemsToInsert = dto.items.map((item, idx) => ({
      purchase_request_id: request.id,
      line_no: idx + 1,
      item_name: item.item_name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: item.tax_percent
    }));

    const { error: itemErr } = await client
      .from('purchase_request_items')
      .insert(itemsToInsert);

    if (itemErr) throw itemErr;

    return this.findOne(request.id, user);
  }

  async update(id: string, dto: UpdateRequestDto, user: any) {
    const client = this.supabaseService.getClient();
    const request = await this.findOne(id, user);

    if (request.status !== 'Draft') {
      throw new BadRequestException('Only Draft requests can be modified');
    }

    // 1. Update Header
    const { error: reqErr } = await client
      .from('purchase_requests')
      .update({
        needed_by_date: dto.needed_by_date,
        supplier_name: dto.supplier_name,
        currency_code: dto.currency_code,
        notes: dto.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (reqErr) throw reqErr;

    // 2. Replace Items (Delete + Insert)
    await client.from('purchase_request_items').delete().eq('purchase_request_id', id);

    const itemsToInsert = dto.items.map((item, idx) => ({
      purchase_request_id: id,
      line_no: idx + 1,
      item_name: item.item_name,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_percent: item.tax_percent
    }));

    await client.from('purchase_request_items').insert(itemsToInsert);

    return this.findOne(id, user);
  }

  async submit(id: string, user: any) {
    const client = this.supabaseService.getClient();
    const request = await this.findOne(id, user);

    if (request.status !== 'Draft') {
      throw new BadRequestException('Request is not in Draft state');
    }

    const { data, error } = await client
      .from('purchase_requests')
      .update({ status: 'Submitted', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
