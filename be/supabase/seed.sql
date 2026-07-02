insert into public.categories (name, slug, sort_order)
values
  ('Laptop', 'laptop', 1),
  ('Smartphone', 'smartphone', 2),
  ('Man hinh', 'monitor', 3),
  ('Phu kien', 'accessory', 4)
on conflict (slug) do update
set name = excluded.name,
    sort_order = excluded.sort_order;

insert into public.brands (name, slug)
values
  ('Apple', 'apple'),
  ('Samsung', 'samsung'),
  ('LG', 'lg'),
  ('Logitech', 'logitech')
on conflict (slug) do update
set name = excluded.name;

with laptop_category as (
  select id from public.categories where slug = 'laptop'
),
smartphone_category as (
  select id from public.categories where slug = 'smartphone'
),
monitor_category as (
  select id from public.categories where slug = 'monitor'
),
accessory_category as (
  select id from public.categories where slug = 'accessory'
),
apple_brand as (
  select id from public.brands where slug = 'apple'
),
samsung_brand as (
  select id from public.brands where slug = 'samsung'
),
lg_brand as (
  select id from public.brands where slug = 'lg'
),
logitech_brand as (
  select id from public.brands where slug = 'logitech'
)
insert into public.products (
  category_id,
  brand_id,
  name,
  slug,
  short_description,
  is_active,
  is_featured
)
values
  (
    (select id from laptop_category),
    (select id from apple_brand),
    'MacBook Air 13 M4 16GB 512GB',
    'macbook-air-m4-13-16gb-512gb',
    'Laptop mong nhe cho lam viec va sang tao noi dung.',
    true,
    true
  ),
  (
    (select id from smartphone_category),
    (select id from samsung_brand),
    'Samsung Galaxy S26 Ultra 5G 256GB',
    'samsung-galaxy-s26-ultra-256gb',
    'Flagship smartphone hieu nang cao.',
    true,
    true
  ),
  (
    (select id from monitor_category),
    (select id from lg_brand),
    'LG UltraFine 27 inch 4K USB-C',
    'lg-ultrafine-27-4k-usb-c',
    'Man hinh 4K cho khong gian lam viec hien dai.',
    true,
    true
  ),
  (
    (select id from accessory_category),
    (select id from logitech_brand),
    'Logitech MX Keys S Combo',
    'logitech-mx-keys-s-combo',
    'Bo ban phim chuot cao cap cho van phong.',
    true,
    true
  )
on conflict (slug) do update
set name = excluded.name,
    short_description = excluded.short_description,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured;

insert into public.product_variants (
  product_id,
  sku,
  name,
  price,
  compare_at_price,
  stock_quantity,
  is_active
)
select id, 'MBA-M4-13-16-512', '16GB / 512GB', 31990000, 34990000, 18, true
from public.products where slug = 'macbook-air-m4-13-16gb-512gb'
on conflict (sku) do update
set price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    stock_quantity = excluded.stock_quantity,
    is_active = excluded.is_active;

insert into public.product_variants (
  product_id,
  sku,
  name,
  price,
  stock_quantity,
  is_active
)
select id, 'SGS26U-256', '256GB', 28990000, 24, true
from public.products where slug = 'samsung-galaxy-s26-ultra-256gb'
on conflict (sku) do update
set price = excluded.price,
    stock_quantity = excluded.stock_quantity,
    is_active = excluded.is_active;

insert into public.product_variants (
  product_id,
  sku,
  name,
  price,
  compare_at_price,
  stock_quantity,
  is_active
)
select id, 'LG-UF-27-4K', '27 inch 4K', 11990000, 13990000, 12, true
from public.products where slug = 'lg-ultrafine-27-4k-usb-c'
on conflict (sku) do update
set price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    stock_quantity = excluded.stock_quantity,
    is_active = excluded.is_active;

insert into public.product_variants (
  product_id,
  sku,
  name,
  price,
  stock_quantity,
  is_active
)
select id, 'LOGI-MX-KEYS-S-COMBO', 'Combo', 4290000, 35, true
from public.products where slug = 'logitech-mx-keys-s-combo'
on conflict (sku) do update
set price = excluded.price,
    stock_quantity = excluded.stock_quantity,
    is_active = excluded.is_active;
