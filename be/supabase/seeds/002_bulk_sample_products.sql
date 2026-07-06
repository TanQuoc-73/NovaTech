-- NovaTech bulk sample catalog data.
-- Run this after 001_init_commerce.sql and 001_sample_catalog.sql.
-- Safe to re-run: products use unique slugs, variants use deterministic SKUs.

insert into public.brands (name, slug, logo_url, description)
values
  ('Asus', 'asus', null, 'Laptop, PC va thiet bi gaming.'),
  ('HP', 'hp', null, 'Laptop van phong, workstation va thiet bi doanh nghiep.'),
  ('Lenovo', 'lenovo', null, 'Laptop, tablet va may tram lam viec.'),
  ('MSI', 'msi', null, 'Laptop gaming, PC va linh kien hieu nang cao.'),
  ('Acer', 'acer', null, 'Laptop, man hinh va thiet bi pho thong.'),
  ('Xiaomi', 'xiaomi', null, 'Smartphone, tablet va thiet bi thong minh.'),
  ('Google', 'google', null, 'Smartphone Pixel va thiet bi thong minh.'),
  ('Huawei', 'huawei', null, 'Tablet, laptop va thiet bi di dong.'),
  ('Razer', 'razer', null, 'Phu kien va thiet bi gaming cao cap.'),
  ('Keychron', 'keychron', null, 'Ban phim co va phu kien ban lam viec.'),
  ('JBL', 'jbl', null, 'Loa, tai nghe va thiet bi am thanh.'),
  ('Bose', 'bose', null, 'Thiet bi am thanh va chong on cao cap.')
on conflict (slug) do update
set name = excluded.name,
    logo_url = excluded.logo_url,
    description = excluded.description,
    updated_at = now();

with seed_products (
  category_slug,
  brand_slug,
  name,
  slug,
  short_description,
  description,
  thumbnail_url,
  is_featured,
  variant_name,
  color,
  storage,
  ram,
  price,
  compare_at_price,
  stock_quantity,
  weight_grams
) as (
  values
    ('laptop', 'apple', 'MacBook Pro 14 M4 Pro 24GB 1TB', 'macbook-pro-14-m4-pro-24gb-1tb', 'Laptop cao cap cho creator va developer.', 'MacBook Pro 14 M4 Pro co man hinh dep, hieu nang manh va thoi luong pin tot cho cong viec nang.', '/products/macbook-pro-14-m4-pro.jpg', true, '24GB / 1TB / Space Black', 'Space Black', '1TB', '24GB', 52990000, 56990000, 10, 1550),
    ('laptop', 'apple', 'MacBook Pro 16 M4 Max 36GB 1TB', 'macbook-pro-16-m4-max-36gb-1tb', 'May tram di dong cho workflow nang.', 'MacBook Pro 16 M4 Max phu hop dung video, lap trinh va render hieu nang cao.', '/products/macbook-pro-16-m4-max.jpg', true, '36GB / 1TB / Silver', 'Silver', '1TB', '36GB', 82990000, 87990000, 6, 2140),
    ('laptop', 'dell', 'Dell Inspiron 14 Plus Ultra 5 16GB 512GB', 'dell-inspiron-14-plus-ultra-5-16gb-512gb', 'Laptop gon nhe cho hoc tap va van phong.', 'Dell Inspiron 14 Plus can bang giua hieu nang, thoi luong pin va gia ban.', '/products/dell-inspiron-14-plus.jpg', false, 'Ultra 5 / 16GB / 512GB', 'Ice Blue', '512GB', '16GB', 22990000, 24990000, 18, 1540),
    ('laptop', 'dell', 'Dell Latitude 7450 Ultra 7 32GB 1TB', 'dell-latitude-7450-ultra-7-32gb-1tb', 'Laptop doanh nghiep bao mat va ben bi.', 'Dell Latitude 7450 phu hop nhan vien doanh nghiep can may on dinh va bao mat tot.', '/products/dell-latitude-7450.jpg', false, 'Ultra 7 / 32GB / 1TB', 'Gray', '1TB', '32GB', 39990000, 42990000, 9, 1330),
    ('laptop', 'asus', 'Asus Zenbook 14 OLED Ultra 7 16GB 1TB', 'asus-zenbook-14-oled-ultra-7-16gb-1tb', 'Laptop OLED mong nhe cho cong viec.', 'Zenbook 14 OLED co man hinh ruc ro, thiet ke nhe va hieu nang tot.', '/products/asus-zenbook-14-oled.jpg', true, 'Ultra 7 / 16GB / 1TB', 'Ponder Blue', '1TB', '16GB', 30990000, 33990000, 16, 1280),
    ('laptop', 'asus', 'Asus ROG Zephyrus G14 Ryzen 9 32GB 1TB', 'asus-rog-zephyrus-g14-ryzen-9-32gb-1tb', 'Laptop gaming gon nhe cho creator.', 'ROG Zephyrus G14 ket hop hieu nang gaming va tinh di dong cao.', '/products/asus-rog-zephyrus-g14.jpg', true, 'Ryzen 9 / 32GB / 1TB', 'Eclipse Gray', '1TB', '32GB', 48990000, 52990000, 7, 1650),
    ('laptop', 'hp', 'HP Spectre x360 14 Ultra 7 16GB 1TB', 'hp-spectre-x360-14-ultra-7-16gb-1tb', 'Laptop xoay gap cao cap.', 'HP Spectre x360 14 danh cho nguoi dung can laptop linh hoat va sang trong.', '/products/hp-spectre-x360-14.jpg', false, 'Ultra 7 / 16GB / 1TB', 'Nightfall Black', '1TB', '16GB', 37990000, 40990000, 11, 1440),
    ('laptop', 'hp', 'HP Victus 16 Ryzen 7 RTX 4060 16GB 512GB', 'hp-victus-16-ryzen-7-rtx-4060-16gb-512gb', 'Laptop gaming gia tot.', 'HP Victus 16 phu hop game thu va sinh vien can cau hinh manh.', '/products/hp-victus-16.jpg', false, 'Ryzen 7 / RTX 4060 / 16GB', 'Mica Silver', '512GB', '16GB', 28990000, 31990000, 14, 2300),
    ('laptop', 'lenovo', 'Lenovo ThinkPad X1 Carbon Gen 13 32GB 1TB', 'lenovo-thinkpad-x1-carbon-gen-13-32gb-1tb', 'Laptop doanh nhan sieu nhe.', 'ThinkPad X1 Carbon Gen 13 co ban phim tot, thiet ke ben va kha nang bao mat cao.', '/products/thinkpad-x1-carbon-gen-13.jpg', true, 'Ultra 7 / 32GB / 1TB', 'Black', '1TB', '32GB', 49990000, 53990000, 8, 1120),
    ('laptop', 'lenovo', 'Lenovo Yoga Slim 7x Snapdragon X 16GB 512GB', 'lenovo-yoga-slim-7x-snapdragon-x-16gb-512gb', 'Laptop AI mong nhe pin lau.', 'Yoga Slim 7x dung Snapdragon X cho nhu cau lam viec di dong va pin dai.', '/products/lenovo-yoga-slim-7x.jpg', false, 'Snapdragon X / 16GB / 512GB', 'Cosmic Blue', '512GB', '16GB', 29990000, 32990000, 12, 1280),
    ('laptop', 'msi', 'MSI Stealth 16 AI Studio Ultra 9 RTX 4070', 'msi-stealth-16-ai-studio-ultra-9-rtx-4070', 'Laptop gaming va sang tao noi dung.', 'MSI Stealth 16 AI Studio phu hop editor, 3D artist va game thu.', '/products/msi-stealth-16-ai-studio.jpg', false, 'Ultra 9 / RTX 4070 / 32GB', 'Star Blue', '1TB', '32GB', 59990000, 64990000, 5, 1990),
    ('laptop', 'acer', 'Acer Swift Go 14 Ultra 5 16GB 512GB', 'acer-swift-go-14-ultra-5-16gb-512gb', 'Laptop van phong gia tot.', 'Acer Swift Go 14 co man hinh dep, thiet ke gon va cau hinh on dinh.', '/products/acer-swift-go-14.jpg', false, 'Ultra 5 / 16GB / 512GB', 'Silver', '512GB', '16GB', 19990000, 21990000, 20, 1320),

    ('pc', 'asus', 'Asus ROG G22CH i7 RTX 4070 32GB 1TB', 'asus-rog-g22ch-i7-rtx-4070-32gb-1tb', 'PC gaming nho gon hieu nang cao.', 'ROG G22CH co thiet ke compact, phu hop gaming va streaming.', '/products/asus-rog-g22ch.jpg', true, 'i7 / RTX 4070 / 32GB', 'Black', '1TB', '32GB', 46990000, 49990000, 6, 8000),
    ('pc', 'msi', 'MSI MAG Infinite S3 i5 RTX 4060 16GB 1TB', 'msi-mag-infinite-s3-i5-rtx-4060-16gb-1tb', 'PC gaming tam trung.', 'MSI MAG Infinite S3 dap ung tot game eSport va AAA thiet lap cao.', '/products/msi-mag-infinite-s3.jpg', false, 'i5 / RTX 4060 / 16GB', 'Black', '1TB', '16GB', 27990000, 30990000, 9, 9200),
    ('pc', 'hp', 'HP Z2 Tower G9 i7 32GB 1TB', 'hp-z2-tower-g9-i7-32gb-1tb', 'Workstation cho doanh nghiep.', 'HP Z2 Tower G9 phu hop CAD, thiet ke va cong viec chuyen nghiep.', '/products/hp-z2-tower-g9.jpg', false, 'i7 / 32GB / 1TB', 'Black', '1TB', '32GB', 42990000, 45990000, 4, 7000),
    ('pc', 'lenovo', 'Lenovo ThinkCentre Neo 50s i5 16GB 512GB', 'lenovo-thinkcentre-neo-50s-i5-16gb-512gb', 'PC van phong nho gon.', 'ThinkCentre Neo 50s tiet kiem khong gian cho doanh nghiep va phong hoc.', '/products/lenovo-thinkcentre-neo-50s.jpg', false, 'i5 / 16GB / 512GB', 'Black', '512GB', '16GB', 15990000, 17990000, 25, 4500),
    ('pc', 'acer', 'Acer Predator Orion 3000 i7 RTX 4060 Ti', 'acer-predator-orion-3000-i7-rtx-4060-ti', 'PC gaming hieu nang cao.', 'Predator Orion 3000 danh cho game thu can may dong bo manh me.', '/products/acer-predator-orion-3000.jpg', false, 'i7 / RTX 4060 Ti / 16GB', 'Black', '1TB', '16GB', 34990000, 37990000, 7, 7500),

    ('smartphone', 'apple', 'iPhone 16 Pro 256GB', 'iphone-16-pro-256gb', 'iPhone Pro nho gon voi camera manh.', 'iPhone 16 Pro phu hop nguoi dung can hieu nang cao va he sinh thai Apple.', '/products/iphone-16-pro.jpg', true, '256GB / Natural Titanium', 'Natural Titanium', '256GB', '8GB', 28990000, 30990000, 20, 199),
    ('smartphone', 'apple', 'iPhone 16 Pro Max 512GB', 'iphone-16-pro-max-512gb', 'iPhone man hinh lon cao cap.', 'iPhone 16 Pro Max co pin tot, camera manh va man hinh lon.', '/products/iphone-16-pro-max.jpg', true, '512GB / Desert Titanium', 'Desert Titanium', '512GB', '8GB', 37990000, 40990000, 12, 227),
    ('smartphone', 'samsung', 'Samsung Galaxy Z Fold 7 512GB', 'samsung-galaxy-z-fold-7-512gb', 'Dien thoai gap cho da nhiem.', 'Galaxy Z Fold 7 phu hop nguoi dung can man hinh lon trong than may gon.', '/products/galaxy-z-fold-7.jpg', true, '512GB / Silver Shadow', 'Silver Shadow', '512GB', '12GB', 44990000, 47990000, 9, 239),
    ('smartphone', 'samsung', 'Samsung Galaxy Z Flip 7 256GB', 'samsung-galaxy-z-flip-7-256gb', 'Dien thoai gap thoi trang.', 'Galaxy Z Flip 7 nho gon, camera linh hoat va man hinh ngoai tien dung.', '/products/galaxy-z-flip-7.jpg', false, '256GB / Mint', 'Mint', '256GB', '12GB', 25990000, 27990000, 15, 187),
    ('smartphone', 'xiaomi', 'Xiaomi 15 Ultra 512GB', 'xiaomi-15-ultra-512gb', 'Flagship chup anh cao cap.', 'Xiaomi 15 Ultra tap trung camera, sac nhanh va man hinh dep.', '/products/xiaomi-15-ultra.jpg', true, '512GB / Black', 'Black', '512GB', '16GB', 26990000, 29990000, 13, 229),
    ('smartphone', 'xiaomi', 'Xiaomi 15 256GB', 'xiaomi-15-256gb', 'Flagship nho gon gia tot.', 'Xiaomi 15 co hieu nang manh, camera tot va kich thuoc de dung.', '/products/xiaomi-15.jpg', false, '256GB / Green', 'Green', '256GB', '12GB', 19990000, 21990000, 18, 191),
    ('smartphone', 'sony', 'Sony Xperia 1 VII 256GB', 'sony-xperia-1-vii-256gb', 'Smartphone cho nguoi thich quay chup.', 'Xperia 1 VII co man hinh ti le rong va tinh nang camera chuyen sau.', '/products/sony-xperia-1-vii.jpg', false, '256GB / Black', 'Black', '256GB', '12GB', 29990000, 32990000, 6, 192),
    ('smartphone', 'google', 'Google Pixel 10 Pro 256GB', 'google-pixel-10-pro-256gb', 'Dien thoai Android thuan Google.', 'Pixel 10 Pro noi bat voi camera AI va trai nghiem Android sach.', '/products/google-pixel-10-pro.jpg', false, '256GB / Obsidian', 'Obsidian', '256GB', '16GB', 24990000, 26990000, 10, 207),

    ('tablet', 'apple', 'iPad Air 11 M3 Wi-Fi 128GB', 'ipad-air-11-m3-wifi-128gb', 'Tablet mong nhe cho hoc tap.', 'iPad Air 11 M3 phu hop ghi chu, giai tri va lam viec co ban.', '/products/ipad-air-11-m3.jpg', false, 'Wi-Fi / 128GB / Blue', 'Blue', '128GB', '8GB', 16990000, 18990000, 22, 462),
    ('tablet', 'apple', 'iPad Pro 13 M4 Wi-Fi 512GB', 'ipad-pro-13-m4-wifi-512gb', 'Tablet man hinh lon cho creator.', 'iPad Pro 13 M4 co man hinh dep va hieu nang rat cao.', '/products/ipad-pro-13-m4.jpg', true, 'Wi-Fi / 512GB / Space Black', 'Space Black', '512GB', '8GB', 41990000, 44990000, 8, 579),
    ('tablet', 'samsung', 'Samsung Galaxy Tab S11 Ultra 512GB', 'samsung-galaxy-tab-s11-ultra-512gb', 'Tablet Android man hinh lon.', 'Galaxy Tab S11 Ultra phu hop lam viec da nhiem va giai tri cao cap.', '/products/galaxy-tab-s11-ultra.jpg', true, '512GB / Graphite', 'Graphite', '512GB', '16GB', 32990000, 35990000, 11, 732),
    ('tablet', 'samsung', 'Samsung Galaxy Tab S11 256GB', 'samsung-galaxy-tab-s11-256gb', 'Tablet Android cao cap gon hon.', 'Galaxy Tab S11 co but S Pen va man hinh AMOLED dep.', '/products/galaxy-tab-s11.jpg', false, '256GB / Silver', 'Silver', '256GB', '12GB', 21990000, 23990000, 16, 498),
    ('tablet', 'xiaomi', 'Xiaomi Pad 7 Pro 256GB', 'xiaomi-pad-7-pro-256gb', 'Tablet gia tot cau hinh manh.', 'Xiaomi Pad 7 Pro phu hop hoc tap, giai tri va ghi chu.', '/products/xiaomi-pad-7-pro.jpg', false, '256GB / Blue', 'Blue', '256GB', '12GB', 12990000, 14990000, 24, 500),
    ('tablet', 'huawei', 'Huawei MatePad Pro 13.2 512GB', 'huawei-matepad-pro-13-2-512gb', 'Tablet man hinh lon cho sang tao.', 'MatePad Pro 13.2 co man hinh rong, phu hop ve va lam viec linh hoat.', '/products/huawei-matepad-pro-13-2.jpg', false, '512GB / Green', 'Green', '512GB', '12GB', 24990000, 27990000, 7, 580),

    ('monitor', 'lg', 'LG UltraGear 27 OLED 240Hz', 'lg-ultragear-27-oled-240hz', 'Man hinh OLED gaming 240Hz.', 'LG UltraGear OLED 27 inch co tan so quet cao va mau den sau.', '/products/lg-ultragear-27-oled.jpg', true, '27 inch / OLED / 240Hz', 'Black', null, null, 22990000, 25990000, 8, 6200),
    ('monitor', 'lg', 'LG DualUp 28 inch Nano IPS', 'lg-dualup-28-nano-ips', 'Man hinh doc la cho da nhiem.', 'LG DualUp co ti le doc rong, phu hop code, thiet ke va doc tai lieu.', '/products/lg-dualup-28.jpg', false, '28 inch / Nano IPS', 'Black', null, null, 16990000, 18990000, 9, 7900),
    ('monitor', 'dell', 'Dell UltraSharp U2725QE 27 inch 4K', 'dell-ultrasharp-u2725qe-27-4k', 'Man hinh 4K cho van phong cao cap.', 'Dell UltraSharp U2725QE co mau sac tot, USB-C va hub tien dung.', '/products/dell-ultrasharp-u2725qe.jpg', true, '27 inch / 4K / USB-C', 'Silver', null, null, 14990000, 16990000, 14, 6100),
    ('monitor', 'dell', 'Dell Alienware AW3425DW QD-OLED', 'dell-alienware-aw3425dw-qd-oled', 'Man hinh cong gaming QD-OLED.', 'Alienware AW3425DW mang lai trai nghiem gaming sieu rong va mau sac an tuong.', '/products/alienware-aw3425dw.jpg', false, '34 inch / QD-OLED', 'Lunar Light', null, null, 28990000, 31990000, 5, 9000),
    ('monitor', 'asus', 'Asus ProArt PA279CRV 27 inch 4K', 'asus-proart-pa279crv-27-4k', 'Man hinh do hoa 4K.', 'Asus ProArt PA279CRV phu hop designer can mau sac chinh xac.', '/products/asus-proart-pa279crv.jpg', false, '27 inch / 4K / USB-C', 'Black', null, null, 13990000, 15990000, 12, 5900),
    ('monitor', 'samsung', 'Samsung Odyssey G8 OLED 32 inch', 'samsung-odyssey-g8-oled-32', 'Man hinh OLED gaming 32 inch.', 'Odyssey G8 OLED co do tuong phan cao va tan so quet nhanh cho game thu.', '/products/samsung-odyssey-g8-oled.jpg', true, '32 inch / OLED / 240Hz', 'Silver', null, null, 29990000, 32990000, 7, 8400),
    ('monitor', 'acer', 'Acer Nitro XV272U 27 inch 2K 180Hz', 'acer-nitro-xv272u-27-2k-180hz', 'Man hinh gaming 2K gia tot.', 'Acer Nitro XV272U co do phan giai 2K va tan so quet cao.', '/products/acer-nitro-xv272u.jpg', false, '27 inch / 2K / 180Hz', 'Black', null, null, 6990000, 7990000, 22, 5200),

    ('accessory', 'logitech', 'Logitech MX Master 4', 'logitech-mx-master-4', 'Chuot cao cap cho van phong.', 'MX Master 4 phu hop lam viec da thiet bi va thao tac chinh xac.', '/products/logitech-mx-master-4.jpg', true, 'Graphite', 'Graphite', null, null, 3290000, 3690000, 40, 145),
    ('accessory', 'logitech', 'Logitech G Pro X Superlight 3', 'logitech-g-pro-x-superlight-3', 'Chuot gaming sieu nhe.', 'G Pro X Superlight 3 danh cho game thu can toc do va do chinh xac cao.', '/products/logitech-g-pro-x-superlight-3.jpg', false, 'White', 'White', null, null, 3990000, 4490000, 28, 63),
    ('accessory', 'keychron', 'Keychron Q1 HE Wireless', 'keychron-q1-he-wireless', 'Ban phim co magnetic switch.', 'Keychron Q1 HE co switch Hall Effect va ket noi khong day linh hoat.', '/products/keychron-q1-he.jpg', true, '75% / Black', 'Black', null, null, 5290000, 5890000, 18, 1800),
    ('accessory', 'keychron', 'Keychron K3 Max Low Profile', 'keychron-k3-max-low-profile', 'Ban phim co mong nhe.', 'Keychron K3 Max phu hop setup gon va lam viec di dong.', '/products/keychron-k3-max.jpg', false, 'Low Profile / RGB', 'Black', null, null, 2690000, 2990000, 32, 525),
    ('accessory', 'anker', 'Anker 737 Power Bank 24000mAh', 'anker-737-power-bank-24000mah', 'Pin du phong cong suat cao.', 'Anker 737 ho tro sac nhanh laptop, tablet va smartphone.', '/products/anker-737-power-bank.jpg', false, '24000mAh / Black', 'Black', null, null, 3490000, 3990000, 26, 630),
    ('accessory', 'anker', 'Anker MagGo 3-in-1 Charging Station', 'anker-maggo-3-in-1-charging-station', 'De sac 3 trong 1 cho he sinh thai Apple.', 'Anker MagGo 3-in-1 sac iPhone, Apple Watch va AirPods gon gang.', '/products/anker-maggo-3-in-1.jpg', true, 'Qi2 / White', 'White', null, null, 3290000, 3690000, 20, 410),
    ('accessory', 'razer', 'Razer BlackWidow V4 Pro', 'razer-blackwidow-v4-pro', 'Ban phim gaming cao cap.', 'Razer BlackWidow V4 Pro co led RGB, macro va switch phan hoi nhanh.', '/products/razer-blackwidow-v4-pro.jpg', false, 'Green Switch / Black', 'Black', null, null, 5790000, 6290000, 14, 1300),
    ('accessory', 'razer', 'Razer Basilisk V3 Pro', 'razer-basilisk-v3-pro', 'Chuot gaming khong day cao cap.', 'Basilisk V3 Pro co cam bien chinh xac va thiet ke cong thai hoc.', '/products/razer-basilisk-v3-pro.jpg', false, 'Black', 'Black', null, null, 3990000, 4490000, 17, 112),

    ('audio', 'apple', 'AirPods Pro 3 USB-C', 'airpods-pro-3-usb-c', 'Tai nghe true wireless chong on.', 'AirPods Pro 3 ket hop chat am tot, chong on va ket noi nhanh voi iPhone.', '/products/airpods-pro-3.jpg', true, 'USB-C / White', 'White', null, null, 6490000, 6990000, 35, 56),
    ('audio', 'sony', 'Sony WF-1000XM6', 'sony-wf-1000xm6', 'Tai nghe true wireless chong on cao cap.', 'Sony WF-1000XM6 nho gon, chong on tot va chat am chi tiet.', '/products/sony-wf-1000xm6.jpg', true, 'Black', 'Black', null, null, 6490000, 6990000, 21, 45),
    ('audio', 'sony', 'Sony ULT Field 7 Portable Speaker', 'sony-ult-field-7-portable-speaker', 'Loa Bluetooth cong suat lon.', 'Sony ULT Field 7 phu hop tiec ngoai troi va nghe nhac bass manh.', '/products/sony-ult-field-7.jpg', false, 'Black', 'Black', null, null, 9990000, 10990000, 9, 6300),
    ('audio', 'jbl', 'JBL Flip 7', 'jbl-flip-7', 'Loa Bluetooth nho gon.', 'JBL Flip 7 co am thanh manh, chong nuoc va de mang theo.', '/products/jbl-flip-7.jpg', false, 'Blue', 'Blue', null, null, 3290000, 3690000, 30, 560),
    ('audio', 'jbl', 'JBL Tour One M3', 'jbl-tour-one-m3', 'Tai nghe over-ear chong on.', 'JBL Tour One M3 co thoi luong pin dai va chong on linh hoat.', '/products/jbl-tour-one-m3.jpg', false, 'Black', 'Black', null, null, 6990000, 7990000, 16, 278),
    ('audio', 'bose', 'Bose QuietComfort Ultra Earbuds', 'bose-quietcomfort-ultra-earbuds', 'Tai nghe in-ear chong on cao cap.', 'QuietComfort Ultra Earbuds mang lai chong on tot va chat am am ap.', '/products/bose-qc-ultra-earbuds.jpg', true, 'Black', 'Black', null, null, 7490000, 8290000, 15, 60),
    ('audio', 'bose', 'Bose SoundLink Max', 'bose-soundlink-max', 'Loa di dong cao cap.', 'Bose SoundLink Max co am thanh day dan, pin lau va thiet ke ben.', '/products/bose-soundlink-max.jpg', false, 'Blue Dusk', 'Blue Dusk', null, null, 10990000, 11990000, 8, 2130)
),
upserted_products as (
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
  select
    c.id,
    b.id,
    sp.name,
    sp.slug,
    sp.short_description,
    sp.description,
    sp.thumbnail_url,
    true,
    sp.is_featured
  from seed_products sp
  join public.categories c on c.slug = sp.category_slug
  join public.brands b on b.slug = sp.brand_slug
  on conflict (slug) do update
  set category_id = excluded.category_id,
      brand_id = excluded.brand_id,
      name = excluded.name,
      short_description = excluded.short_description,
      description = excluded.description,
      thumbnail_url = excluded.thumbnail_url,
      is_active = excluded.is_active,
      is_featured = excluded.is_featured,
      updated_at = now()
  returning id, slug
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
  p.id,
  'NT-' || upper(replace(sp.slug, '-', '-')),
  sp.variant_name,
  sp.color,
  sp.storage,
  sp.ram,
  sp.price,
  sp.compare_at_price,
  sp.stock_quantity,
  5,
  sp.weight_grams,
  true
from seed_products sp
join upserted_products p on p.slug = sp.slug
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

with seed_products (slug, thumbnail_url, name) as (
  values
    ('macbook-pro-14-m4-pro-24gb-1tb', '/products/macbook-pro-14-m4-pro.jpg', 'MacBook Pro 14 M4 Pro 24GB 1TB'),
    ('macbook-pro-16-m4-max-36gb-1tb', '/products/macbook-pro-16-m4-max.jpg', 'MacBook Pro 16 M4 Max 36GB 1TB'),
    ('dell-inspiron-14-plus-ultra-5-16gb-512gb', '/products/dell-inspiron-14-plus.jpg', 'Dell Inspiron 14 Plus Ultra 5 16GB 512GB'),
    ('dell-latitude-7450-ultra-7-32gb-1tb', '/products/dell-latitude-7450.jpg', 'Dell Latitude 7450 Ultra 7 32GB 1TB'),
    ('asus-zenbook-14-oled-ultra-7-16gb-1tb', '/products/asus-zenbook-14-oled.jpg', 'Asus Zenbook 14 OLED Ultra 7 16GB 1TB'),
    ('asus-rog-zephyrus-g14-ryzen-9-32gb-1tb', '/products/asus-rog-zephyrus-g14.jpg', 'Asus ROG Zephyrus G14 Ryzen 9 32GB 1TB'),
    ('hp-spectre-x360-14-ultra-7-16gb-1tb', '/products/hp-spectre-x360-14.jpg', 'HP Spectre x360 14 Ultra 7 16GB 1TB'),
    ('hp-victus-16-ryzen-7-rtx-4060-16gb-512gb', '/products/hp-victus-16.jpg', 'HP Victus 16 Ryzen 7 RTX 4060 16GB 512GB'),
    ('lenovo-thinkpad-x1-carbon-gen-13-32gb-1tb', '/products/thinkpad-x1-carbon-gen-13.jpg', 'Lenovo ThinkPad X1 Carbon Gen 13 32GB 1TB'),
    ('lenovo-yoga-slim-7x-snapdragon-x-16gb-512gb', '/products/lenovo-yoga-slim-7x.jpg', 'Lenovo Yoga Slim 7x Snapdragon X 16GB 512GB'),
    ('msi-stealth-16-ai-studio-ultra-9-rtx-4070', '/products/msi-stealth-16-ai-studio.jpg', 'MSI Stealth 16 AI Studio Ultra 9 RTX 4070'),
    ('acer-swift-go-14-ultra-5-16gb-512gb', '/products/acer-swift-go-14.jpg', 'Acer Swift Go 14 Ultra 5 16GB 512GB'),
    ('asus-rog-g22ch-i7-rtx-4070-32gb-1tb', '/products/asus-rog-g22ch.jpg', 'Asus ROG G22CH i7 RTX 4070 32GB 1TB'),
    ('msi-mag-infinite-s3-i5-rtx-4060-16gb-1tb', '/products/msi-mag-infinite-s3.jpg', 'MSI MAG Infinite S3 i5 RTX 4060 16GB 1TB'),
    ('hp-z2-tower-g9-i7-32gb-1tb', '/products/hp-z2-tower-g9.jpg', 'HP Z2 Tower G9 i7 32GB 1TB'),
    ('lenovo-thinkcentre-neo-50s-i5-16gb-512gb', '/products/lenovo-thinkcentre-neo-50s.jpg', 'Lenovo ThinkCentre Neo 50s i5 16GB 512GB'),
    ('acer-predator-orion-3000-i7-rtx-4060-ti', '/products/acer-predator-orion-3000.jpg', 'Acer Predator Orion 3000 i7 RTX 4060 Ti'),
    ('iphone-16-pro-256gb', '/products/iphone-16-pro.jpg', 'iPhone 16 Pro 256GB'),
    ('iphone-16-pro-max-512gb', '/products/iphone-16-pro-max.jpg', 'iPhone 16 Pro Max 512GB'),
    ('samsung-galaxy-z-fold-7-512gb', '/products/galaxy-z-fold-7.jpg', 'Samsung Galaxy Z Fold 7 512GB'),
    ('samsung-galaxy-z-flip-7-256gb', '/products/galaxy-z-flip-7.jpg', 'Samsung Galaxy Z Flip 7 256GB'),
    ('xiaomi-15-ultra-512gb', '/products/xiaomi-15-ultra.jpg', 'Xiaomi 15 Ultra 512GB'),
    ('xiaomi-15-256gb', '/products/xiaomi-15.jpg', 'Xiaomi 15 256GB'),
    ('sony-xperia-1-vii-256gb', '/products/sony-xperia-1-vii.jpg', 'Sony Xperia 1 VII 256GB'),
    ('google-pixel-10-pro-256gb', '/products/google-pixel-10-pro.jpg', 'Google Pixel 10 Pro 256GB'),
    ('ipad-air-11-m3-wifi-128gb', '/products/ipad-air-11-m3.jpg', 'iPad Air 11 M3 Wi-Fi 128GB'),
    ('ipad-pro-13-m4-wifi-512gb', '/products/ipad-pro-13-m4.jpg', 'iPad Pro 13 M4 Wi-Fi 512GB'),
    ('samsung-galaxy-tab-s11-ultra-512gb', '/products/galaxy-tab-s11-ultra.jpg', 'Samsung Galaxy Tab S11 Ultra 512GB'),
    ('samsung-galaxy-tab-s11-256gb', '/products/galaxy-tab-s11.jpg', 'Samsung Galaxy Tab S11 256GB'),
    ('xiaomi-pad-7-pro-256gb', '/products/xiaomi-pad-7-pro.jpg', 'Xiaomi Pad 7 Pro 256GB'),
    ('huawei-matepad-pro-13-2-512gb', '/products/huawei-matepad-pro-13-2.jpg', 'Huawei MatePad Pro 13.2 512GB'),
    ('lg-ultragear-27-oled-240hz', '/products/lg-ultragear-27-oled.jpg', 'LG UltraGear 27 OLED 240Hz'),
    ('lg-dualup-28-nano-ips', '/products/lg-dualup-28.jpg', 'LG DualUp 28 inch Nano IPS'),
    ('dell-ultrasharp-u2725qe-27-4k', '/products/dell-ultrasharp-u2725qe.jpg', 'Dell UltraSharp U2725QE 27 inch 4K'),
    ('dell-alienware-aw3425dw-qd-oled', '/products/alienware-aw3425dw.jpg', 'Dell Alienware AW3425DW QD-OLED'),
    ('asus-proart-pa279crv-27-4k', '/products/asus-proart-pa279crv.jpg', 'Asus ProArt PA279CRV 27 inch 4K'),
    ('samsung-odyssey-g8-oled-32', '/products/samsung-odyssey-g8-oled.jpg', 'Samsung Odyssey G8 OLED 32 inch'),
    ('acer-nitro-xv272u-27-2k-180hz', '/products/acer-nitro-xv272u.jpg', 'Acer Nitro XV272U 27 inch 2K 180Hz'),
    ('logitech-mx-master-4', '/products/logitech-mx-master-4.jpg', 'Logitech MX Master 4'),
    ('logitech-g-pro-x-superlight-3', '/products/logitech-g-pro-x-superlight-3.jpg', 'Logitech G Pro X Superlight 3'),
    ('keychron-q1-he-wireless', '/products/keychron-q1-he.jpg', 'Keychron Q1 HE Wireless'),
    ('keychron-k3-max-low-profile', '/products/keychron-k3-max.jpg', 'Keychron K3 Max Low Profile'),
    ('anker-737-power-bank-24000mah', '/products/anker-737-power-bank.jpg', 'Anker 737 Power Bank 24000mAh'),
    ('anker-maggo-3-in-1-charging-station', '/products/anker-maggo-3-in-1.jpg', 'Anker MagGo 3-in-1 Charging Station'),
    ('razer-blackwidow-v4-pro', '/products/razer-blackwidow-v4-pro.jpg', 'Razer BlackWidow V4 Pro'),
    ('razer-basilisk-v3-pro', '/products/razer-basilisk-v3-pro.jpg', 'Razer Basilisk V3 Pro'),
    ('airpods-pro-3-usb-c', '/products/airpods-pro-3.jpg', 'AirPods Pro 3 USB-C'),
    ('sony-wf-1000xm6', '/products/sony-wf-1000xm6.jpg', 'Sony WF-1000XM6'),
    ('sony-ult-field-7-portable-speaker', '/products/sony-ult-field-7.jpg', 'Sony ULT Field 7 Portable Speaker'),
    ('jbl-flip-7', '/products/jbl-flip-7.jpg', 'JBL Flip 7'),
    ('jbl-tour-one-m3', '/products/jbl-tour-one-m3.jpg', 'JBL Tour One M3'),
    ('bose-quietcomfort-ultra-earbuds', '/products/bose-qc-ultra-earbuds.jpg', 'Bose QuietComfort Ultra Earbuds'),
    ('bose-soundlink-max', '/products/bose-soundlink-max.jpg', 'Bose SoundLink Max')
)
insert into public.product_images (product_id, image_url, alt_text, sort_order)
select p.id, sp.thumbnail_url, sp.name, 1
from seed_products sp
join public.products p on p.slug = sp.slug
where not exists (
  select 1
  from public.product_images existing
  where existing.product_id = p.id
    and existing.image_url = sp.thumbnail_url
);
