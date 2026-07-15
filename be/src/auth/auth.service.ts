import { BadRequestException, Injectable } from '@nestjs/common';

import type {
  AddressDto,
  AuthenticatedProfile,
  AuthenticatedUser,
} from './auth.types';
import type { AddressDto as AddressPayloadDto } from './dto/address.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { SupabaseService } from '../infrastructure/supabase/supabase.service';

type AddressRow = {
  id: string;
  recipient_name: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  line1: string;
  line2: string | null;
  is_default: boolean;
};

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async syncProfile(user: AuthenticatedUser): Promise<AuthenticatedProfile> {
    const metadata = user.user_metadata ?? {};
    const fullName =
      this.readMetadataValue(metadata, 'full_name') ??
      this.readMetadataValue(metadata, 'name');
    const avatarUrl = this.readMetadataValue(metadata, 'avatar_url');

    const { data: profile, error: profileError } =
      await this.supabaseService.client
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email ?? '',
            full_name: fullName,
            avatar_url: avatarUrl,
          },
          {
            onConflict: 'id',
          },
        )
        .select(
          'id, email, full_name, phone, avatar_url, role, created_at, updated_at',
        )
        .single();

    if (profileError) {
      throw profileError;
    }

    const { error: cartError } = await this.supabaseService.client
      .from('carts')
      .upsert(
        {
          user_id: user.id,
        },
        {
          onConflict: 'user_id',
        },
      );

    if (cartError) {
      throw cartError;
    }

    return profile;
  }

  async getProfile(userId: string): Promise<AuthenticatedProfile> {
    const { data: profile, error } = await this.supabaseService.client
      .from('profiles')
      .select(
        'id, email, full_name, phone, avatar_url, role, created_at, updated_at',
      )
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return profile;
  }

  async updateProfile(
    user: AuthenticatedUser,
    payload: UpdateProfileDto,
  ): Promise<AuthenticatedProfile> {
    const updates: Record<string, string | null> = {
      email: user.email ?? '',
      full_name: this.readOptionalProfileValue(payload.fullName),
      phone: this.readOptionalProfileValue(payload.phone),
      avatar_url: this.readOptionalProfileValue(payload.avatarUrl),
    };

    const { data: profile, error } = await this.supabaseService.client
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select(
        'id, email, full_name, phone, avatar_url, role, created_at, updated_at',
      )
      .single();

    if (error) {
      throw error;
    }

    return profile;
  }

  async getAddresses(userId: string): Promise<AddressDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('addresses')
      .select(
        'id, recipient_name, phone, province, district, ward, line1, line2, is_default',
      )
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as unknown as AddressRow[]).map((address) =>
      this.mapAddress(address),
    );
  }

  async createAddress(userId: string, payload: AddressPayloadDto) {
    const isDefault = this.readOptionalBoolean(payload.isDefault) ?? false;

    if (isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    const { error } = await this.supabaseService.client
      .from('addresses')
      .insert({
        user_id: userId,
        recipient_name: this.readRequiredProfileValue(
          payload.recipientName,
          'recipientName',
        ),
        phone: this.readRequiredProfileValue(payload.phone, 'phone'),
        province: this.readRequiredProfileValue(payload.province, 'province'),
        district: this.readRequiredProfileValue(payload.district, 'district'),
        ward: this.readRequiredProfileValue(payload.ward, 'ward'),
        line1: this.readRequiredProfileValue(payload.line1, 'line1'),
        line2: this.readOptionalProfileValue(payload.line2),
        is_default: isDefault,
      });

    if (error) {
      throw error;
    }

    return this.getAddresses(userId);
  }

  async updateAddress(userId: string, id: string, payload: AddressPayloadDto) {
    const updates: Record<string, unknown> = {};

    this.assignRequiredProfileValue(
      updates,
      'recipient_name',
      payload.recipientName,
    );
    this.assignRequiredProfileValue(updates, 'phone', payload.phone);
    this.assignRequiredProfileValue(updates, 'province', payload.province);
    this.assignRequiredProfileValue(updates, 'district', payload.district);
    this.assignRequiredProfileValue(updates, 'ward', payload.ward);
    this.assignRequiredProfileValue(updates, 'line1', payload.line1);
    this.assignOptionalProfileValue(updates, 'line2', payload.line2);

    const isDefault = this.readOptionalBoolean(payload.isDefault);

    if (isDefault === true) {
      await this.clearDefaultAddresses(userId);
      updates.is_default = true;
    } else if (isDefault === false) {
      updates.is_default = false;
    }

    const { error } = await this.supabaseService.client
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return this.getAddresses(userId);
  }

  async deleteAddress(userId: string, id: string) {
    const { error } = await this.supabaseService.client
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return this.getAddresses(userId);
  }

  private readMetadataValue(metadata: Record<string, unknown>, key: string) {
    const value = metadata[key];

    return typeof value === 'string' && value.trim() ? value : undefined;
  }

  private readOptionalProfileValue(value: unknown) {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value !== 'string') {
      throw new BadRequestException('Profile value must be a string.');
    }

    return value.trim() || null;
  }

  private readRequiredProfileValue(value: unknown, field: string) {
    if (typeof value !== 'string' || !value.trim()) {
      throw new BadRequestException(`${field} is required.`);
    }

    return value.trim();
  }

  private readOptionalBoolean(value: unknown) {
    return typeof value === 'boolean' ? value : undefined;
  }

  private assignRequiredProfileValue(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ) {
    if (value !== undefined) {
      target[key] = this.readRequiredProfileValue(value, key);
    }
  }

  private assignOptionalProfileValue(
    target: Record<string, unknown>,
    key: string,
    value: unknown,
  ) {
    if (value !== undefined) {
      target[key] = this.readOptionalProfileValue(value);
    }
  }

  private async clearDefaultAddresses(userId: string) {
    const { error } = await this.supabaseService.client
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  private mapAddress(address: AddressRow): AddressDto {
    return {
      id: address.id,
      recipientName: address.recipient_name,
      phone: address.phone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      line1: address.line1,
      line2: address.line2,
      isDefault: address.is_default,
    };
  }
}
