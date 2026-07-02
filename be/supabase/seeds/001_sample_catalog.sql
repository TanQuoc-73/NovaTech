-- NovaTech sample catalog data.
-- Run this after 001_init_commerce.sql.
-- This file is safe to re-run because it uses unique slugs/SKUs with upsert.

insert into public.categories (name, slug, description, image_url, sort_order, is_active)
values
  ('Laptop', 'laptop', 'Laptop cho hoc tap, lam viec, gaming va sang tao noi dung.', null, 1, true),
  ('PC', 'pc', 'May tinh de ban, mini PC va workstation cho lam viec hieu nang cao.', null, 2, true),
  ('Smartphone', 'smartphone', 'Dien thoai thong minh tu cac thuong hieu hang dau.', null, 3, true),
  ('Man hinh', 'monitor', 'Man hinh do hoa, van phong, gaming va giai tri.', null, 4, true),
  ('Phu kien', 'accessory', 'Ban phim, chuot, sac, tai nghe va phu kien cong nghe.', null, 5, true),
  ('Tablet', 'tablet', 'May tinh bang cho lam viec linh hoat va giai tri.', null, 6, true),
  ('Am thanh', 'audio', 'Tai nghe, loa va thiet bi am thanh ca nhan.', null, 7, true)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.brands (name, slug, logo_url, description)
values
  ('Apple', 'apple', null, 'Thiet bi cao cap cho he sinh thai sang tao va lam viec.'),
  ('Samsung', 'samsung', null, 'Smartphone, tablet va thiet bi thong minh.'),
  ('LG', 'lg', null, 'Man hinh va thiet bi hien thi chat luong cao.'),
  ('Logitech', 'logitech', null, 'Phu kien van phong va gaming.'),
  ('Dell', 'dell', null, 'Laptop va man hinh doanh nghiep.'),
  ('Sony', 'sony', null, 'Thiet bi am thanh va giai tri.'),
  ('Anker', 'anker', null, 'Sac nhanh, pin du phong va phu kien di dong.')
on conflict (slug) do update
set name = excluded.name,
    logo_url = excluded.logo_url,
    description = excluded.description,
    updated_at = now();

with category_ids as (
  select slug, id from public.categories
),
brand_ids as (
  select slug, id from public.brands
)
insert into public.products (
  category_id,
  brand_id,
  name,
  slug,
  short_description,
  description,
  thumbnail_url,
  is_active,
  is_featured
)
values
  (
    (select id from category_ids where slug = 'laptop'),
    (select id from brand_ids where slug = 'apple'),
    'MacBook Air 13 M4 16GB 512GB',
    'macbook-air-m4-13-16gb-512gb',
    'Laptop mong nhe, pin lau, hieu nang tot cho cong viec hang ngay.',
    'MacBook Air 13 M4 phu hop cho sinh vien, nhan vien van phong va creator can mot thiet bi mong nhe nhung manh me.',
    '/products/macbook-air-m4.jpg',
    true,
    true
  ),
  (
    (select id from category_ids where slug = 'smartphone'),
    (select id from brand_ids where slug = 'samsung'),
    'Samsung Galaxy S26 Ultra 5G 256GB',
    'samsung-galaxy-s26-ultra-256gb',
    'Flagship Android voi camera cao cap va hieu nang manh.',
    'Galaxy S26 Ultra danh cho nguoi dung can man hinh lon, camera linh hoat va thoi luong pin tot.',
    '/products/galaxy-s26-ultra.jpg',
    true,
    true
  ),
  (
    (select id from category_ids where slug = 'monitor'),
    (select id from brand_ids where slug = 'lg'),
    'LG UltraFine 27 inch 4K USB-C',
    'lg-ultrafine-27-4k-usb-c',
    'Man hinh 4K sac net cho setup lam viec hien dai.',
    'LG UltraFine 27 inch phu hop cho designer, developer va nguoi lam viec da nhiem.',
    '/products/lg-ultrafine-27.jpg',
    true,
    true
  ),
  (
    (select id from category_ids where slug = 'accessory'),
    (select id from brand_ids where slug = 'logitech'),
    'Logitech MX Keys S Combo',
    'logitech-mx-keys-s-combo',
    'Combo ban phim va chuot cao cap cho van phong.',
    'Logitech MX Keys S Combo mang lai trai nghiem go em, chinh xac va ket noi da thiet bi.',
    '/products/logitech-mx-keys.jpg',
    true,
    true
  ),
  (
    (select id from category_ids where slug = 'laptop'),
    (select id from brand_ids where slug = 'dell'),
    'Dell XPS 14 Ultra 7 32GB 1TB',
    'dell-xps-14-ultra-7-32gb-1tb',
    'Laptop Windows cao cap cho doanh nghiep va creator.',
    'Dell XPS 14 co thiet ke cao cap, man hinh dep va cau hinh manh cho workflow nang.',
    '/products/dell-xps-14.jpg',
    true,
    true
  ),
  (
    (select id from category_ids where slug = 'pc'),
    (select id from brand_ids where slug = 'dell'),
    'Dell Precision Compact Workstation Ultra 7',
    'dell-precision-compact-workstation-ultra-7',
    'PC workstation nho gon cho van phong, lap trinh va sang tao noi dung.',
    'Dell Precision Compact Workstation phu hop cho nguoi dung can may tinh de ban on dinh, de nang cap va hieu nang cao.',
    '/products/dell-precision-compact.jpg',
    true,
    true
  ),
  (
    (select id from category_ids where slug = 'tablet'),
    (select id from brand_ids where slug = 'apple'),
    'iPad Pro 11 M4 Wi-Fi 256GB',
    'ipad-pro-11-m4-wifi-256gb',
    'Tablet mong nhe voi chip M4 va man hinh dep.',
    'iPad Pro 11 M4 phu hop ghi chu, ve sang tao va lam viec linh hoat.',
    '/products/ipad-pro-11-m4.jpg',
    true,
    false
  ),
  (
    (select id from category_ids where slug = 'audio'),
    (select id from brand_ids where slug = 'sony'),
    'Sony WH-1000XM6 Noise Cancelling',
    'sony-wh-1000xm6-noise-cancelling',
    'Tai nghe chong on cao cap cho lam viec va di chuyen.',
    'Sony WH-1000XM6 tap trung vao chat am, chong on va thoi luong pin dai.',
    '/products/sony-wh-1000xm6.jpg',
    true,
    false
  ),
  (
    (select id from category_ids where slug = 'accessory'),
    (select id from brand_ids where slug = 'anker'),
    'Anker Prime 100W GaN Charger',
    'anker-prime-100w-gan-charger',
    'Cu sac nhanh nho gon cho laptop, tablet va smartphone.',
    'Anker Prime 100W dung cong nghe GaN, phu hop nguoi dung hay di chuyen.',
    '/products/anker-prime-100w.jpg',
    true,
    false
  )
on conflict (slug) do update
set category_id = excluded.category_id,
    brand_id = excluded.brand_id,
    name = excluded.name,
    short_description = excluded.short_description,
    description = excluded.description,
    thumbnail_url = excluded.thumbnail_url,
    is_active = excluded.is_active,
    is_featured = excluded.is_featured,
    updated_at = now();

insert into public.product_variants (
  product_id,
  sku,
  name,
  color,
  storage,
  ram,
  price,
  compare_at_price,
  stock_quantity,
  low_stock_threshold,
  weight_grams,
  is_active
)
select id, 'MBA-M4-13-16-512-MIDNIGHT', '16GB / 512GB / Midnight', 'Midnight', '512GB', '16GB', 31990000, 34990000, 18, 5, 1240, true
from public.products where slug = 'macbook-air-m4-13-16gb-512gb'
on conflict (sku) do update
set name = excluded.name,
    color = excluded.color,
    storage = excluded.storage,
    ram = excluded.ram,
    price = excluded.price,
    compare_at_price = excluded.compare_at_price,
    stock_quantity = excluded.stock_quantity,
    low_stock_threshold = excluded.low_stock_threshold,
    weight_grams = excluded.weight_grams,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'MBA-M4-13-24-1TB-SILVER', '24GB / 1TB / Silver', 'Silver', '1TB', '24GB', 42990000, 45990000, 8, 3, 1240, true
from public.products where slug = 'macbook-air-m4-13-16gb-512gb'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'SGS26U-256-TITANIUM', '256GB / Titanium Gray', 'Titanium Gray', '256GB', '12GB', 28990000, null, 24, 5, 232, true
from public.products where slug = 'samsung-galaxy-s26-ultra-256gb'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'LG-UF-27-4K-BLACK', '27 inch 4K / Black', 'Black', null, null, 11990000, 13990000, 12, 4, 6200, true
from public.products where slug = 'lg-ultrafine-27-4k-usb-c'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'LOGI-MX-KEYS-S-COMBO-GRAPHITE', 'Combo / Graphite', 'Graphite', null, null, 4290000, null, 35, 8, 1250, true
from public.products where slug = 'logitech-mx-keys-s-combo'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'DELL-XPS14-U7-32-1TB-PLATINUM', 'Ultra 7 / 32GB / 1TB', 'Platinum', '1TB', '32GB', 46990000, 49990000, 7, 3, 1680, true
from public.products where slug = 'dell-xps-14-ultra-7-32gb-1tb'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'DELL-PRECISION-COMPACT-U7-32-1TB', 'Ultra 7 / 32GB / 1TB', 'Black', '1TB', '32GB', 38990000, 42990000, 9, 3, 5200, true
from public.products where slug = 'dell-precision-compact-workstation-ultra-7'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'IPAD-PRO-11-M4-256-SILVER', 'Wi-Fi / 256GB / Silver', 'Silver', '256GB', '8GB', 28990000, null, 15, 5, 444, true
from public.products where slug = 'ipad-pro-11-m4-wifi-256gb'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'SONY-WH1000XM6-BLACK', 'Black', 'Black', null, null, 8990000, 9990000, 20, 5, 254, true
from public.products where slug = 'sony-wh-1000xm6-noise-cancelling'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_variants (product_id, sku, name, color, storage, ram, price, compare_at_price, stock_quantity, low_stock_threshold, weight_grams, is_active)
select id, 'ANKER-PRIME-100W-GAN-BLACK', '100W / Black', 'Black', null, null, 1890000, null, 42, 10, 220, true
from public.products where slug = 'anker-prime-100w-gan-charger'
on conflict (sku) do update
set name = excluded.name, color = excluded.color, storage = excluded.storage, ram = excluded.ram, price = excluded.price, compare_at_price = excluded.compare_at_price, stock_quantity = excluded.stock_quantity, low_stock_threshold = excluded.low_stock_threshold, weight_grams = excluded.weight_grams, is_active = excluded.is_active, updated_at = now();

insert into public.product_images (product_id, image_url, alt_text, sort_order)
select p.id, image_url, alt_text, sort_order
from public.products p
join (
  values
    ('macbook-air-m4-13-16gb-512gb', '/products/macbook-air-m4.jpg', 'MacBook Air 13 M4', 1),
    ('samsung-galaxy-s26-ultra-256gb', '/products/galaxy-s26-ultra.jpg', 'Samsung Galaxy S26 Ultra', 1),
    ('lg-ultrafine-27-4k-usb-c', '/products/lg-ultrafine-27.jpg', 'LG UltraFine 27 inch 4K', 1),
    ('logitech-mx-keys-s-combo', '/products/logitech-mx-keys.jpg', 'Logitech MX Keys S Combo', 1),
    ('dell-xps-14-ultra-7-32gb-1tb', '/products/dell-xps-14.jpg', 'Dell XPS 14', 1),
    ('dell-precision-compact-workstation-ultra-7', '/products/dell-precision-compact.jpg', 'Dell Precision Compact Workstation', 1),
    ('ipad-pro-11-m4-wifi-256gb', '/products/ipad-pro-11-m4.jpg', 'iPad Pro 11 M4', 1),
    ('sony-wh-1000xm6-noise-cancelling', '/products/sony-wh-1000xm6.jpg', 'Sony WH-1000XM6', 1),
    ('anker-prime-100w-gan-charger', '/products/anker-prime-100w.jpg', 'Anker Prime 100W GaN Charger', 1)
) as seed(product_slug, image_url, alt_text, sort_order)
on p.slug = seed.product_slug
where not exists (
  select 1
  from public.product_images existing
  where existing.product_id = p.id
    and existing.image_url = seed.image_url
);

insert into public.product_specs (product_id, spec_group, spec_key, spec_value, sort_order)
select p.id, spec_group, spec_key, spec_value, sort_order
from public.products p
join (
  values
    ('macbook-air-m4-13-16gb-512gb', 'Hieu nang', 'CPU', 'Apple M4', 1),
    ('macbook-air-m4-13-16gb-512gb', 'Hieu nang', 'RAM', '16GB', 2),
    ('macbook-air-m4-13-16gb-512gb', 'Luu tru', 'SSD', '512GB', 3),
    ('samsung-galaxy-s26-ultra-256gb', 'Man hinh', 'Kich thuoc', '6.9 inch', 1),
    ('samsung-galaxy-s26-ultra-256gb', 'Camera', 'Camera chinh', '200MP', 2),
    ('lg-ultrafine-27-4k-usb-c', 'Man hinh', 'Do phan giai', '4K UHD', 1),
    ('lg-ultrafine-27-4k-usb-c', 'Ket noi', 'USB-C', 'Co sac laptop', 2),
    ('logitech-mx-keys-s-combo', 'Ket noi', 'Bluetooth', 'Da thiet bi', 1),
    ('dell-xps-14-ultra-7-32gb-1tb', 'Hieu nang', 'CPU', 'Intel Core Ultra 7', 1),
    ('dell-xps-14-ultra-7-32gb-1tb', 'Luu tru', 'SSD', '1TB', 2),
    ('dell-precision-compact-workstation-ultra-7', 'Hieu nang', 'CPU', 'Intel Core Ultra 7', 1),
    ('dell-precision-compact-workstation-ultra-7', 'Do hoa', 'GPU', 'NVIDIA RTX workstation', 2),
    ('dell-precision-compact-workstation-ultra-7', 'Luu tru', 'SSD', '1TB', 3),
    ('ipad-pro-11-m4-wifi-256gb', 'Hieu nang', 'Chip', 'Apple M4', 1),
    ('sony-wh-1000xm6-noise-cancelling', 'Am thanh', 'Chong on', 'Adaptive ANC', 1),
    ('anker-prime-100w-gan-charger', 'Sac', 'Cong suat', '100W', 1)
) as seed(product_slug, spec_group, spec_key, spec_value, sort_order)
on p.slug = seed.product_slug
where not exists (
  select 1
  from public.product_specs existing
  where existing.product_id = p.id
    and existing.spec_group = seed.spec_group
    and existing.spec_key = seed.spec_key
);
