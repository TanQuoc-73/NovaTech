-- Variant image gallery.
-- Each product variant can have multiple images, useful for color/configuration
-- specific product photos stored in Supabase Storage.

create table if not exists public.product_variant_images (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_variant_images_variant_id
on public.product_variant_images(variant_id);

alter table public.product_variant_images enable row level security;

create policy "Public can read active variant images"
on public.product_variant_images for select
using (
  exists (
    select 1
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = product_variant_images.variant_id
      and pv.is_active = true
      and p.is_active = true
  )
  or public.is_admin()
);

create policy "Admins can manage variant images"
on public.product_variant_images for all
using (public.is_admin())
with check (public.is_admin());
