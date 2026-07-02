create table if not exists public.payment_qr_settings (
  id uuid primary key default gen_random_uuid(),
  provider public.payment_method not null default 'bank_transfer',
  title text not null,
  qr_image_url text not null,
  account_name text,
  account_number text,
  bank_name text,
  instructions text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_payment_qr_settings_updated_at
before update on public.payment_qr_settings
for each row execute function public.set_updated_at();

alter table public.payment_qr_settings enable row level security;

create policy "Public can read active payment QR settings"
on public.payment_qr_settings for select
using (is_active = true or public.is_admin());

create policy "Admins can manage payment QR settings"
on public.payment_qr_settings for all
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_payment_qr_settings_provider
on public.payment_qr_settings(provider);

create index if not exists idx_payment_qr_settings_is_active
on public.payment_qr_settings(is_active);
