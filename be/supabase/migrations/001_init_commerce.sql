-- NovaTech commerce schema for Supabase/Postgres.
-- Run this in Supabase SQL Editor or through Supabase CLI migrations.

create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin', 'staff');
create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);
create type public.payment_status as enum ('unpaid', 'paid', 'failed', 'refunded');
create type public.payment_method as enum ('cod', 'bank_transfer', 'momo', 'vnpay', 'stripe');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  province text not null,
  district text not null,
  ward text not null,
  line1 text not null,
  line2 text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  thumbnail_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  name text not null,
  color text,
  storage text,
  ram text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price numeric(12, 2) check (cost_price is null or cost_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  spec_group text not null,
  spec_key text not null,
  spec_value text not null,
  sort_order integer not null default 0
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  payment_method public.payment_method not null default 'cod',
  subtotal_amount numeric(12, 2) not null default 0 check (subtotal_amount >= 0),
  shipping_amount numeric(12, 2) not null default 0 check (shipping_amount >= 0),
  discount_amount numeric(12, 2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  shipping_province text not null,
  shipping_district text not null,
  shipping_ward text not null,
  shipping_line1 text not null,
  shipping_line2 text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text not null,
  sku text not null,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  total_price numeric(12, 2) not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null,
  provider_transaction_id text,
  status public.payment_status not null default 'unpaid',
  amount numeric(12, 2) not null check (amount >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  title text,
  content text,
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index idx_categories_parent_id on public.categories(parent_id);
create index idx_products_category_id on public.products(category_id);
create index idx_products_brand_id on public.products(brand_id);
create index idx_products_is_active on public.products(is_active);
create index idx_products_is_featured on public.products(is_featured);
create index idx_product_variants_product_id on public.product_variants(product_id);
create index idx_product_variants_is_active on public.product_variants(is_active);
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order_id on public.order_items(order_id);
create index idx_reviews_product_id on public.reviews(product_id);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_addresses_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger set_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger set_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger set_carts_updated_at
before update on public.carts
for each row execute function public.set_updated_at();

create trigger set_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create trigger set_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create trigger set_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.carts (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'staff')
  );
$$;

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_specs enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.wishlists enable row level security;
alter table public.reviews enable row level security;

create policy "Public can read active categories"
on public.categories for select
using (is_active = true or public.is_admin());

create policy "Public can read brands"
on public.brands for select
using (true);

create policy "Public can read active products"
on public.products for select
using (is_active = true or public.is_admin());

create policy "Public can read product images"
on public.product_images for select
using (
  exists (
    select 1 from public.products
    where products.id = product_images.product_id
      and (products.is_active = true or public.is_admin())
  )
);

create policy "Public can read active variants"
on public.product_variants for select
using (
  (
    is_active = true
    and exists (
      select 1 from public.products
      where products.id = product_variants.product_id
        and products.is_active = true
    )
  )
  or public.is_admin()
);

create policy "Public can read product specs"
on public.product_specs for select
using (
  exists (
    select 1 from public.products
    where products.id = product_specs.product_id
      and (products.is_active = true or public.is_admin())
  )
);

create policy "Users can read own profile"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "Users can update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid());

create policy "Users can manage own addresses"
on public.addresses for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Users can manage own cart"
on public.carts for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Users can manage own cart items"
on public.cart_items for all
using (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and (carts.user_id = auth.uid() or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.carts
    where carts.id = cart_items.cart_id
      and (carts.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Users can read own orders"
on public.orders for select
using (user_id = auth.uid() or public.is_admin());

create policy "Users can create own orders"
on public.orders for insert
with check (user_id = auth.uid() or public.is_admin());

create policy "Users can read own order items"
on public.order_items for select
using (
  exists (
    select 1 from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Users can read own payments"
on public.payments for select
using (
  exists (
    select 1 from public.orders
    where orders.id = payments.order_id
      and (orders.user_id = auth.uid() or public.is_admin())
  )
);

create policy "Users can manage own wishlist"
on public.wishlists for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "Public can read approved reviews"
on public.reviews for select
using (is_approved = true or user_id = auth.uid() or public.is_admin());

create policy "Users can create own reviews"
on public.reviews for insert
with check (user_id = auth.uid());

create policy "Users can update own unapproved reviews"
on public.reviews for update
using (user_id = auth.uid() and is_approved = false)
with check (user_id = auth.uid());

create policy "Admins can manage catalog"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage brands"
on public.brands for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage product images"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage product variants"
on public.product_variants for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage product specs"
on public.product_specs for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage orders"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage order items"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage payments"
on public.payments for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can manage reviews"
on public.reviews for all
using (public.is_admin())
with check (public.is_admin());
