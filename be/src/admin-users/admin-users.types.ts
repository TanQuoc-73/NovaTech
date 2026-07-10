export type AdminUserDto = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: 'customer' | 'admin' | 'staff';
  createdAt: string;
  updatedAt: string;
  orderCount: number;
};

export type AdminUpdateUserPayload = {
  fullName?: unknown;
  phone?: unknown;
  avatarUrl?: unknown;
};

export type AdminUpdateUserRolePayload = {
  role?: unknown;
};
