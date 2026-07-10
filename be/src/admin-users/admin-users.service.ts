import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';

import { SupabaseService } from '../infrastructure/supabase/supabase.service';
import type {
  AdminUpdateUserPayload,
  AdminUpdateUserRolePayload,
  AdminUserDto,
} from './admin-users.types';

const validRoles = ['customer', 'admin', 'staff'] as const;

@Injectable()
export class AdminUsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async listUsers(q?: string, role?: string): Promise<AdminUserDto[]> {
    let query = this.supabaseService.client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      const roleList = role.split(',').filter(
        (r) => (validRoles as readonly string[]).includes(r),
      );

      if (roleList.length === 1) {
        query = query.eq('role', roleList[0]);
      } else if (roleList.length > 1) {
        query = query.in('role', roleList);
      }
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(
        `email.ilike.${term},full_name.ilike.${term},phone.ilike.${term}`,
      );
    }

    const { data, error } = await query;

    if (error) {
      if (error.code === 'PGRST205') return [];
      throw error;
    }

    const userIds = (data ?? []).map((row) => row.id);

    const orderCounts = await this.getOrderCounts(userIds);

    return (data ?? []).map((row) => this.toDto(row, orderCounts));
  }

  async getUser(id: string): Promise<AdminUserDto | null> {
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const orderCounts = await this.getOrderCounts([data.id]);

    return this.toDto(data, orderCounts);
  }

  async updateUser(id: string, payload: AdminUpdateUserPayload): Promise<AdminUserDto | null> {
    const updates: Record<string, unknown> = {};

    this.assignString(updates, 'full_name', payload.fullName);

    this.assignString(updates, 'phone', payload.phone);

    this.assignString(updates, 'avatar_url', payload.avatarUrl);

    if (!Object.keys(updates).length) {
      throw new BadRequestException('No valid fields to update.');
    }

    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const orderCounts = await this.getOrderCounts([data.id]);

    return this.toDto(data, orderCounts);
  }

  async updateUserRole(
    id: string,
    payload: AdminUpdateUserRolePayload,
  ): Promise<AdminUserDto | null> {
    const role = this.readUserRole(payload.role);

    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    const orderCounts = await this.getOrderCounts([data.id]);

    return this.toDto(data, orderCounts);
  }

  async deleteUser(id: string): Promise<{ success: boolean }> {
    const { error } = await this.supabaseService.client
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  }

  private async getOrderCounts(userIds: string[]): Promise<Map<string, number>> {
    if (!userIds.length) return new Map();

    const { data, error } = await this.supabaseService.client
      .from('orders')
      .select('user_id')
      .in('user_id', userIds);

    if (error) return new Map();

    const counts = new Map<string, number>();

    for (const row of data ?? []) {
      counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    }

    return counts;
  }

  private toDto(
    row: Record<string, unknown>,
    orderCounts: Map<string, number>,
  ): AdminUserDto {
    return {
      id: String(row.id ?? ''),
      email: String(row.email ?? ''),
      fullName: this.nullIfEmpty(String(row.full_name ?? '')),
      phone: this.nullIfEmpty(String(row.phone ?? '')),
      avatarUrl: this.nullIfEmpty(String(row.avatar_url ?? '')),
      role: (row.role as AdminUserDto['role']) ?? 'customer',
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? ''),
      orderCount: orderCounts.get(String(row.id)) ?? 0,
    };
  }

  private readUserRole(value: unknown): string {
    if (typeof value === 'string' && (validRoles as readonly string[]).includes(value)) {
      return value;
    }

    throw new BadRequestException(
      'Role must be one of: customer, admin, staff.',
    );
  }

  private assignString(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ) {
    if (typeof value === 'string') {
      target[key] = value.trim() || null;
    }
  }

  private nullIfEmpty(value: string): string | null {
    return value && value.trim() ? value.trim() : null;
  }
}
