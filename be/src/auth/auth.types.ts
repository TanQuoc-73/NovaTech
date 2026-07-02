import type { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'admin' | 'staff';

export type AuthenticatedUser = User;

export type AuthenticatedProfile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type UpdateProfilePayload = {
  fullName?: unknown;
  phone?: unknown;
  avatarUrl?: unknown;
};

export type AddressDto = {
  id: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  line1: string;
  line2: string | null;
  isDefault: boolean;
};

export type AddressPayload = {
  recipientName?: unknown;
  phone?: unknown;
  province?: unknown;
  district?: unknown;
  ward?: unknown;
  line1?: unknown;
  line2?: unknown;
  isDefault?: unknown;
};
