-- Marketing content and vouchers.

create table if not exists public.hero_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  label text,
  tag text,
  device_type text,
  price_text text,
  highlight_label text,
  highlight text,
  image_url text,
  href text,
  gradient text not null default 'from-[#09090B] via-[#0E7490] to-[#06B6D4]',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  category text,
  image_url text,
  href text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  title text not null,
  description text,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value > 0),
  min_order_amount numeric(12, 2) not null default 0 check (min_order_amount >= 0),
  max_discount_amount numeric(12, 2) check (max_discount_amount is null or max_discount_amount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit >= 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_hero_banners_updated_at
before update on public.hero_banners
for each row execute function public.set_updated_at();

create trigger set_news_articles_updated_at
before update on public.news_articles
for each row execute function public.set_updated_at();

create trigger set_vouchers_updated_at
before update on public.vouchers
for each row execute function public.set_updated_at();

create index if not exists idx_hero_banners_active_sort
on public.hero_banners(is_active, sort_order);

create index if not exists idx_news_articles_published_at
on public.news_articles(is_published, published_at desc);

create index if not exists idx_vouchers_code
on public.vouchers(code);

alter table public.hero_banners enable row level security;
alter table public.news_articles enable row level security;
alter table public.vouchers enable row level security;

drop policy if exists "Public can read active hero banners" on public.hero_banners;
create policy "Public can read active hero banners"
on public.hero_banners for select
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Public can read published news" on public.news_articles;
create policy "Public can read published news"
on public.news_articles for select
using (is_published = true);

drop policy if exists "Public can read active vouchers" on public.vouchers;
create policy "Public can read active vouchers"
on public.vouchers for select
using (
  is_active = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "Admins can manage hero banners" on public.hero_banners;
create policy "Admins can manage hero banners"
on public.hero_banners for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage news articles" on public.news_articles;
create policy "Admins can manage news articles"
on public.news_articles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage vouchers" on public.vouchers;
create policy "Admins can manage vouchers"
on public.vouchers for all
using (public.is_admin())
with check (public.is_admin());

insert into public.hero_banners (
  title,
  subtitle,
  label,
  tag,
  device_type,
  price_text,
  highlight_label,
  highlight,
  image_url,
  href,
  gradient,
  sort_order,
  is_active
)
values
  (
    'MacBook Air M4 đã có tại NovaTech',
    'Dòng laptop mỏng nhẹ cho sinh viên, dân văn phòng và creator cần pin lâu, máy gọn, hiệu năng ổn định.',
    'Tech Week 07/2026',
    'Hàng mới về',
    'Laptop',
    'Từ 31.990.000đ',
    'Tin nhanh',
    'Có sẵn nhiều cấu hình, hỗ trợ giao nhanh',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    '/news',
    'from-[#09090B] via-[#0E7490] to-[#06B6D4]',
    1,
    true
  ),
  (
    'Voucher TECHWEEK giảm ngay cho đơn công nghệ',
    'Áp dụng nhanh tại checkout cho đơn đủ điều kiện, số lượng có hạn trong tuần.',
    'Ưu đãi tuần này',
    'Voucher',
    'Deal',
    'Giảm đến 500.000đ',
    'Mã giảm giá',
    'Nhập TECHWEEK tại thanh toán',
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80',
    '/checkout',
    'from-[#18181B] via-[#92400E] to-[#F59E0B]',
    2,
    true
  )
on conflict do nothing;

insert into public.news_articles (
  title,
  slug,
  excerpt,
  content,
  category,
  image_url,
  href,
  is_published
)
values
  (
    'Tech Week: laptop AI, smartphone flagship và setup làm việc',
    'tech-week-laptop-ai-smartphone-setup',
    'NovaTech tổng hợp các cấu hình đáng chú ý, voucher và combo nâng cấp bàn làm việc.',
    'Theo dõi các sản phẩm mới lên kệ, ưu đãi đang chạy và gợi ý chọn thiết bị theo nhu cầu sử dụng thực tế.',
    'NovaTech Update',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    '/products',
    true
  )
on conflict (slug) do nothing;

insert into public.vouchers (
  code,
  title,
  description,
  discount_type,
  discount_value,
  min_order_amount,
  max_discount_amount,
  usage_limit,
  is_active
)
values
  (
    'TECHWEEK',
    'Tech Week giảm 5%',
    'Giảm 5% cho đơn hàng công nghệ, tối đa 500.000đ.',
    'percent',
    5,
    10000000,
    500000,
    200,
    true
  )
on conflict (code) do nothing;
