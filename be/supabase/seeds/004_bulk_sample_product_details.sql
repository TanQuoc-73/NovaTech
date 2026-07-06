-- Detailed variants, variant images and specifications for bulk sample products.
-- Run after:
--   001_init_commerce.sql
--   004_product_variant_images.sql
--   001_sample_catalog.sql
--   002_bulk_sample_products.sql
--
-- Safe to re-run: variants use deterministic SKUs and specs/images are upserted
-- or guarded with not exists.

with bulk_product_slugs(slug) as (
  values
    ('acer-nitro-xv272u-27-2k-180hz'),
    ('acer-predator-orion-3000-i7-rtx-4060-ti'),
    ('acer-swift-go-14-ultra-5-16gb-512gb'),
    ('airpods-pro-3-usb-c'),
    ('anker-737-power-bank-24000mah'),
    ('anker-maggo-3-in-1-charging-station'),
    ('asus-proart-pa279crv-27-4k'),
    ('asus-rog-g22ch-i7-rtx-4070-32gb-1tb'),
    ('asus-rog-zephyrus-g14-ryzen-9-32gb-1tb'),
    ('asus-zenbook-14-oled-ultra-7-16gb-1tb'),
    ('bose-quietcomfort-ultra-earbuds'),
    ('bose-soundlink-max'),
    ('dell-alienware-aw3425dw-qd-oled'),
    ('dell-inspiron-14-plus-ultra-5-16gb-512gb'),
    ('dell-latitude-7450-ultra-7-32gb-1tb'),
    ('dell-ultrasharp-u2725qe-27-4k'),
    ('google-pixel-10-pro-256gb'),
    ('hp-spectre-x360-14-ultra-7-16gb-1tb'),
    ('hp-victus-16-ryzen-7-rtx-4060-16gb-512gb'),
    ('hp-z2-tower-g9-i7-32gb-1tb'),
    ('huawei-matepad-pro-13-2-512gb'),
    ('ipad-air-11-m3-wifi-128gb'),
    ('ipad-pro-13-m4-wifi-512gb'),
    ('iphone-16-pro-256gb'),
    ('iphone-16-pro-max-512gb'),
    ('jbl-flip-7'),
    ('jbl-tour-one-m3'),
    ('keychron-k3-max-low-profile'),
    ('keychron-q1-he-wireless'),
    ('lenovo-thinkcentre-neo-50s-i5-16gb-512gb'),
    ('lenovo-thinkpad-x1-carbon-gen-13-32gb-1tb'),
    ('lenovo-yoga-slim-7x-snapdragon-x-16gb-512gb'),
    ('lg-dualup-28-nano-ips'),
    ('lg-ultragear-27-oled-240hz'),
    ('logitech-g-pro-x-superlight-3'),
    ('logitech-mx-master-4'),
    ('macbook-pro-14-m4-pro-24gb-1tb'),
    ('macbook-pro-16-m4-max-36gb-1tb'),
    ('msi-mag-infinite-s3-i5-rtx-4060-16gb-1tb'),
    ('msi-stealth-16-ai-studio-ultra-9-rtx-4070'),
    ('razer-basilisk-v3-pro'),
    ('razer-blackwidow-v4-pro'),
    ('samsung-galaxy-tab-s11-256gb'),
    ('samsung-galaxy-tab-s11-ultra-512gb'),
    ('samsung-galaxy-z-flip-7-256gb'),
    ('samsung-galaxy-z-fold-7-512gb'),
    ('samsung-odyssey-g8-oled-32'),
    ('sony-ult-field-7-portable-speaker'),
    ('sony-wf-1000xm6'),
    ('sony-xperia-1-vii-256gb'),
    ('xiaomi-15-256gb'),
    ('xiaomi-15-ultra-512gb'),
    ('xiaomi-pad-7-pro-256gb')
),
base_variants as (
  select
    p.id as product_id,
    p.slug as product_slug,
    c.slug as category_slug,
    pv.color,
    pv.price,
    pv.compare_at_price,
    pv.stock_quantity,
    pv.weight_grams
  from public.products p
  join bulk_product_slugs b on b.slug = p.slug
  join public.categories c on c.id = p.category_id
  join public.product_variants pv on pv.product_id = p.id
  where pv.sku = 'NT-' || upper(p.slug)
),
generated_variants as (
  select
    product_id,
    'NT-' || upper(product_slug) || '-PLUS' as sku,
    case category_slug
      when 'laptop' then '32GB / 1TB / ' || coalesce(color, 'Standard')
      when 'pc' then '32GB / 1TB / ' || coalesce(color, 'Standard')
      when 'smartphone' then '512GB / ' || coalesce(color, 'Standard')
      when 'tablet' then '512GB / ' || coalesce(color, 'Standard')
      when 'monitor' then 'Premium stand / ' || coalesce(color, 'Standard')
      when 'accessory' then 'Wireless / ' || coalesce(color, 'Standard')
      when 'audio' then 'Wireless / ' || coalesce(color, 'Standard')
      else 'Plus / ' || coalesce(color, 'Standard')
    end as name,
    color,
    case category_slug
      when 'laptop' then '1TB'
      when 'pc' then '1TB'
      when 'smartphone' then '512GB'
      when 'tablet' then '512GB'
      else null
    end as storage,
    case category_slug
      when 'laptop' then '32GB'
      when 'pc' then '32GB'
      when 'smartphone' then '12GB'
      when 'tablet' then '12GB'
      else null
    end as ram,
    (floor(price * 1.15 / 10000) * 10000)::numeric(12, 2) as price,
    (floor(coalesce(compare_at_price, price * 1.08) * 1.15 / 10000) * 10000)::numeric(12, 2) as compare_at_price,
    greatest(stock_quantity - 3, 3) as stock_quantity,
    5 as low_stock_threshold,
    weight_grams,
    true as is_active
  from base_variants
  union all
  select
    product_id,
    'NT-' || upper(product_slug) || '-MAX' as sku,
    case category_slug
      when 'laptop' then '64GB / 2TB / ' || coalesce(color, 'Standard')
      when 'pc' then '64GB / 2TB / ' || coalesce(color, 'Standard')
      when 'smartphone' then '1TB / ' || coalesce(color, 'Standard')
      when 'tablet' then '1TB / ' || coalesce(color, 'Standard')
      when 'monitor' then 'Pro calibration / ' || coalesce(color, 'Standard')
      when 'accessory' then 'Creator bundle / ' || coalesce(color, 'Standard')
      when 'audio' then 'Travel bundle / ' || coalesce(color, 'Standard')
      else 'Max / ' || coalesce(color, 'Standard')
    end as name,
    color,
    case category_slug
      when 'laptop' then '2TB'
      when 'pc' then '2TB'
      when 'smartphone' then '1TB'
      when 'tablet' then '1TB'
      else null
    end as storage,
    case category_slug
      when 'laptop' then '64GB'
      when 'pc' then '64GB'
      when 'smartphone' then '16GB'
      when 'tablet' then '16GB'
      else null
    end as ram,
    (floor(price * 1.35 / 10000) * 10000)::numeric(12, 2) as price,
    (floor(coalesce(compare_at_price, price * 1.1) * 1.35 / 10000) * 10000)::numeric(12, 2) as compare_at_price,
    greatest(stock_quantity - 7, 2) as stock_quantity,
    3 as low_stock_threshold,
    weight_grams,
    true as is_active
  from base_variants
)
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
select
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
from generated_variants
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

with bulk_product_slugs(slug) as (
  values
    ('acer-nitro-xv272u-27-2k-180hz'),
    ('acer-predator-orion-3000-i7-rtx-4060-ti'),
    ('acer-swift-go-14-ultra-5-16gb-512gb'),
    ('airpods-pro-3-usb-c'),
    ('anker-737-power-bank-24000mah'),
    ('anker-maggo-3-in-1-charging-station'),
    ('asus-proart-pa279crv-27-4k'),
    ('asus-rog-g22ch-i7-rtx-4070-32gb-1tb'),
    ('asus-rog-zephyrus-g14-ryzen-9-32gb-1tb'),
    ('asus-zenbook-14-oled-ultra-7-16gb-1tb'),
    ('bose-quietcomfort-ultra-earbuds'),
    ('bose-soundlink-max'),
    ('dell-alienware-aw3425dw-qd-oled'),
    ('dell-inspiron-14-plus-ultra-5-16gb-512gb'),
    ('dell-latitude-7450-ultra-7-32gb-1tb'),
    ('dell-ultrasharp-u2725qe-27-4k'),
    ('google-pixel-10-pro-256gb'),
    ('hp-spectre-x360-14-ultra-7-16gb-1tb'),
    ('hp-victus-16-ryzen-7-rtx-4060-16gb-512gb'),
    ('hp-z2-tower-g9-i7-32gb-1tb'),
    ('huawei-matepad-pro-13-2-512gb'),
    ('ipad-air-11-m3-wifi-128gb'),
    ('ipad-pro-13-m4-wifi-512gb'),
    ('iphone-16-pro-256gb'),
    ('iphone-16-pro-max-512gb'),
    ('jbl-flip-7'),
    ('jbl-tour-one-m3'),
    ('keychron-k3-max-low-profile'),
    ('keychron-q1-he-wireless'),
    ('lenovo-thinkcentre-neo-50s-i5-16gb-512gb'),
    ('lenovo-thinkpad-x1-carbon-gen-13-32gb-1tb'),
    ('lenovo-yoga-slim-7x-snapdragon-x-16gb-512gb'),
    ('lg-dualup-28-nano-ips'),
    ('lg-ultragear-27-oled-240hz'),
    ('logitech-g-pro-x-superlight-3'),
    ('logitech-mx-master-4'),
    ('macbook-pro-14-m4-pro-24gb-1tb'),
    ('macbook-pro-16-m4-max-36gb-1tb'),
    ('msi-mag-infinite-s3-i5-rtx-4060-16gb-1tb'),
    ('msi-stealth-16-ai-studio-ultra-9-rtx-4070'),
    ('razer-basilisk-v3-pro'),
    ('razer-blackwidow-v4-pro'),
    ('samsung-galaxy-tab-s11-256gb'),
    ('samsung-galaxy-tab-s11-ultra-512gb'),
    ('samsung-galaxy-z-flip-7-256gb'),
    ('samsung-galaxy-z-fold-7-512gb'),
    ('samsung-odyssey-g8-oled-32'),
    ('sony-ult-field-7-portable-speaker'),
    ('sony-wf-1000xm6'),
    ('sony-xperia-1-vii-256gb'),
    ('xiaomi-15-256gb'),
    ('xiaomi-15-ultra-512gb'),
    ('xiaomi-pad-7-pro-256gb')
),
variant_images as (
  select
    pv.id as variant_id,
    coalesce(p.thumbnail_url, '/products/placeholder.jpg') as image_url,
    p.name || ' - ' || pv.name as alt_text,
    case
      when pv.sku like '%-MAX' then 3
      when pv.sku like '%-PLUS' then 2
      else 1
    end as sort_order
  from public.products p
  join bulk_product_slugs b on b.slug = p.slug
  join public.product_variants pv on pv.product_id = p.id
)
insert into public.product_variant_images (variant_id, image_url, alt_text, sort_order)
select variant_id, image_url, alt_text, sort_order
from variant_images vi
where not exists (
  select 1
  from public.product_variant_images existing
  where existing.variant_id = vi.variant_id
    and existing.image_url = vi.image_url
);

with bulk_product_slugs(slug) as (
  values
    ('acer-nitro-xv272u-27-2k-180hz'),
    ('acer-predator-orion-3000-i7-rtx-4060-ti'),
    ('acer-swift-go-14-ultra-5-16gb-512gb'),
    ('airpods-pro-3-usb-c'),
    ('anker-737-power-bank-24000mah'),
    ('anker-maggo-3-in-1-charging-station'),
    ('asus-proart-pa279crv-27-4k'),
    ('asus-rog-g22ch-i7-rtx-4070-32gb-1tb'),
    ('asus-rog-zephyrus-g14-ryzen-9-32gb-1tb'),
    ('asus-zenbook-14-oled-ultra-7-16gb-1tb'),
    ('bose-quietcomfort-ultra-earbuds'),
    ('bose-soundlink-max'),
    ('dell-alienware-aw3425dw-qd-oled'),
    ('dell-inspiron-14-plus-ultra-5-16gb-512gb'),
    ('dell-latitude-7450-ultra-7-32gb-1tb'),
    ('dell-ultrasharp-u2725qe-27-4k'),
    ('google-pixel-10-pro-256gb'),
    ('hp-spectre-x360-14-ultra-7-16gb-1tb'),
    ('hp-victus-16-ryzen-7-rtx-4060-16gb-512gb'),
    ('hp-z2-tower-g9-i7-32gb-1tb'),
    ('huawei-matepad-pro-13-2-512gb'),
    ('ipad-air-11-m3-wifi-128gb'),
    ('ipad-pro-13-m4-wifi-512gb'),
    ('iphone-16-pro-256gb'),
    ('iphone-16-pro-max-512gb'),
    ('jbl-flip-7'),
    ('jbl-tour-one-m3'),
    ('keychron-k3-max-low-profile'),
    ('keychron-q1-he-wireless'),
    ('lenovo-thinkcentre-neo-50s-i5-16gb-512gb'),
    ('lenovo-thinkpad-x1-carbon-gen-13-32gb-1tb'),
    ('lenovo-yoga-slim-7x-snapdragon-x-16gb-512gb'),
    ('lg-dualup-28-nano-ips'),
    ('lg-ultragear-27-oled-240hz'),
    ('logitech-g-pro-x-superlight-3'),
    ('logitech-mx-master-4'),
    ('macbook-pro-14-m4-pro-24gb-1tb'),
    ('macbook-pro-16-m4-max-36gb-1tb'),
    ('msi-mag-infinite-s3-i5-rtx-4060-16gb-1tb'),
    ('msi-stealth-16-ai-studio-ultra-9-rtx-4070'),
    ('razer-basilisk-v3-pro'),
    ('razer-blackwidow-v4-pro'),
    ('samsung-galaxy-tab-s11-256gb'),
    ('samsung-galaxy-tab-s11-ultra-512gb'),
    ('samsung-galaxy-z-flip-7-256gb'),
    ('samsung-galaxy-z-fold-7-512gb'),
    ('samsung-odyssey-g8-oled-32'),
    ('sony-ult-field-7-portable-speaker'),
    ('sony-wf-1000xm6'),
    ('sony-xperia-1-vii-256gb'),
    ('xiaomi-15-256gb'),
    ('xiaomi-15-ultra-512gb'),
    ('xiaomi-pad-7-pro-256gb')
),
product_scope as (
  select p.id, p.name, c.slug as category_slug
  from public.products p
  join bulk_product_slugs b on b.slug = p.slug
  join public.categories c on c.id = p.category_id
),
spec_seed as (
  select ps.id as product_id, spec_group, spec_key, spec_value, sort_order
  from product_scope ps
  cross join lateral (
    values
      ('Tổng quan', 'Tên sản phẩm', ps.name, 1),
      ('Tổng quan', 'Loại sản phẩm',
        case ps.category_slug
          when 'laptop' then 'Laptop'
          when 'pc' then 'PC'
          when 'smartphone' then 'Smartphone'
          when 'tablet' then 'Tablet'
          when 'monitor' then 'Màn hình'
          when 'accessory' then 'Phụ kiện'
          when 'audio' then 'Âm thanh'
          else ps.category_slug
        end,
        2
      ),
      ('Hiệu năng', 'CPU',
        case ps.category_slug
          when 'laptop' then 'Intel Core Ultra / Apple Silicon / AMD Ryzen'
          when 'pc' then 'Intel Core / AMD Ryzen'
          when 'smartphone' then 'Flagship mobile chipset'
          when 'tablet' then 'Mobile productivity chipset'
          else 'Không áp dụng'
        end,
        3
      ),
      ('Hiệu năng', 'RAM',
        case ps.category_slug
          when 'laptop' then '16GB - 64GB'
          when 'pc' then '16GB - 64GB'
          when 'smartphone' then '8GB - 16GB'
          when 'tablet' then '8GB - 16GB'
          else 'Không áp dụng'
        end,
        4
      ),
      ('Lưu trữ', 'Bộ nhớ',
        case ps.category_slug
          when 'laptop' then '512GB - 2TB SSD'
          when 'pc' then '512GB - 2TB SSD'
          when 'smartphone' then '256GB - 1TB'
          when 'tablet' then '128GB - 1TB'
          else 'Không áp dụng'
        end,
        5
      ),
      ('Màn hình', 'Công nghệ',
        case ps.category_slug
          when 'laptop' then 'OLED / IPS tùy phiên bản'
          when 'smartphone' then 'AMOLED tần số quét cao'
          when 'tablet' then 'OLED / LCD độ phân giải cao'
          when 'monitor' then 'IPS / OLED / QD-OLED'
          else 'Không áp dụng'
        end,
        6
      ),
      ('Kết nối', 'Chuẩn kết nối',
        case ps.category_slug
          when 'audio' then 'Bluetooth, USB-C'
          when 'accessory' then 'Bluetooth, USB-C, 2.4GHz tùy mẫu'
          when 'monitor' then 'HDMI, DisplayPort, USB-C tùy mẫu'
          else 'Wi-Fi, Bluetooth, USB-C'
        end,
        7
      ),
      ('Bảo hành', 'Thời gian', '12 tháng chính hãng', 8)
  ) as specs(spec_group, spec_key, spec_value, sort_order)
)
insert into public.product_specs (product_id, spec_group, spec_key, spec_value, sort_order)
select product_id, spec_group, spec_key, spec_value, sort_order
from spec_seed ss
where not exists (
  select 1
  from public.product_specs existing
  where existing.product_id = ss.product_id
    and existing.spec_group = ss.spec_group
    and existing.spec_key = ss.spec_key
);
