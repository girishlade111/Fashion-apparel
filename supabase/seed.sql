-- ============================================================
-- Seed Data — Fashion Apparel
-- Run once after migrations. Idempotent via TRUNCATE.
-- ============================================================

-- -------------------------
-- 0. Clean existing data
-- -------------------------
truncate table
  reviews,
  product_images,
  product_variants,
  cart_items,
  cart_sessions,
  order_items,
  orders,
  discount_codes,
  blog_posts,
  blog_categories,
  products,
  categories
cascade;

alter sequence order_number_seq restart with 1;

-- -------------------------
-- 1. Categories
-- -------------------------
insert into categories (id, name, slug, parent_id, image_url) values
  ('a0000000-0000-0000-0000-000000000001', 'Men',          'men',          null, null),
  ('a0000000-0000-0000-0000-000000000002', 'Women',        'women',        null, null),
  ('a0000000-0000-0000-0000-000000000003', 'Accessories',  'accessories',  null, null),
  ('a0000000-0000-0000-0000-000000000004', 'New Arrivals', 'new-arrivals', null, null);

-- -------------------------
-- 2. Products  (20)
-- -------------------------

-- ---- Men (5) ----
insert into products (id, name, slug, description, category_id, base_price, compare_at_price, status) values
  ('b0000000-0000-0000-0000-000000000001',
   'Tailored Oxford Shirt',
   'tailored-oxford-shirt',
   'Crisp cotton oxford cloth with a spread collar and mother-of-pearl buttons. A wardrobe essential for the modern gentleman.',
   'a0000000-0000-0000-0000-000000000001', 1899.00, 2499.00, 'active'),
  ('b0000000-0000-0000-0000-000000000002',
   'Slim-Fit Chino Pants',
   'slim-fit-chino-pants',
   'Stretch cotton twill chinos with a tailored slim fit. Mid-rise, tapered leg, and a clean finish at the hem.',
   'a0000000-0000-0000-0000-000000000001', 2499.00, null, 'active'),
  ('b0000000-0000-0000-0000-000000000003',
   'Cashmere Blend Blazer',
   'cashmere-blend-blazer',
   'A soft-shouldered blazer in a wool-cashmere blend. Notch lapels, patch pockets, and an unstructured silhouette.',
   'a0000000-0000-0000-0000-000000000001', 8499.00, 11999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000004',
   'Merino Wool Crew Neck Sweater',
   'merino-wool-crew-neck-sweater',
   'Lightweight merino wool with a fine gauge knit. Ribbed cuffs and hem. Layer it over anything.',
   'a0000000-0000-0000-0000-000000000001', 3499.00, 4499.00, 'active'),
  ('b0000000-0000-0000-0000-000000000005',
   'Classic Leather Bomber Jacket',
   'classic-leather-bomber-jacket',
   'Full-grain buffalo leather with a satin lining. Ribbed knit collar, cuffs, and hem. Zip front with snap storm flap.',
   'a0000000-0000-0000-0000-000000000001', 15999.00, 19999.00, 'active');

-- ---- Women (5) ----
insert into products (id, name, slug, description, category_id, base_price, compare_at_price, status) values
  ('b0000000-0000-0000-0000-000000000006',
   'Silk Evening Gown',
   'silk-evening-gown',
   'Luxurious charmeuse silk with a draped cowl neckline. Floor-length with a subtle back slit. Inseam pockets.',
   'a0000000-0000-0000-0000-000000000002', 12499.00, 15999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000007',
   'Tailored Wool Blazer',
   'tailored-wool-blazer',
   'Italian virgin wool with a sculpted fit. Peak lapels, flapped pockets, and a structured shoulder. Double-vented back.',
   'a0000000-0000-0000-0000-000000000002', 9499.00, 12999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000008',
   'Cashmere Wrap Cardigan',
   'cashmere-wrap-cardigan',
   'Pure Mongolian cashmere with an open-front drape. Ribbed trim, bracelet-length sleeves. Effortless layering.',
   'a0000000-0000-0000-0000-000000000002', 6999.00, 8999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000009',
   'Pleated Midi Skirt',
   'pleated-midi-skirt',
   'Crepe de chine with knife-edge pleats that hold their shape. Elasticated back waistband. Side zip closure.',
   'a0000000-0000-0000-0000-000000000002', 3999.00, 4999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000010',
   'Linen Wide-Leg Trousers',
   'linen-wide-leg-trousers',
   'European flax linen with a relaxed wide leg. Elasticated waist with drawstring. Side pockets and a loose, airy fit.',
   'a0000000-0000-0000-0000-000000000002', 3499.00, null, 'active');

-- ---- Accessories (5) ----
insert into products (id, name, slug, description, category_id, base_price, compare_at_price, status) values
  ('b0000000-0000-0000-0000-000000000011',
   'Italian Leather Belt',
   'italian-leather-belt',
   'Full-grain Tuscan leather with a brushed brass buckle. 3.5 cm width. Ages beautifully with use.',
   'a0000000-0000-0000-0000-000000000003', 2999.00, 3999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000012',
   'Silk Twill Scarf',
   'silk-twill-scarf',
   'Hand-rolled edges on pure silk twill. A versatile square scarf that can be worn as a necktie, bag charm, or headband.',
   'a0000000-0000-0000-0000-000000000003', 4499.00, 5499.00, 'active'),
  ('b0000000-0000-0000-0000-000000000013',
   'Aviator Sunglasses',
   'aviator-sunglasses',
   'Gold-toned metal frame with polarized green-glass lenses. Adjustable nose pads and bayonet temples.',
   'a0000000-0000-0000-0000-000000000003', 5999.00, 7999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000014',
   'Minimalist Leather Watch',
   'minimalist-leather-watch',
   'Japanese quartz movement in a 40 mm stainless steel case. Cognac leather strap with contrast stitching.',
   'a0000000-0000-0000-0000-000000000003', 8999.00, 10999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000015',
   'Canvas Tote Bag',
   'canvas-tote-bag',
   'Heavyweight waxed canvas with vegetable-tanned leather handles. Internal zip pocket and snap closure.',
   'a0000000-0000-0000-0000-000000000003', 3499.00, 4499.00, 'active');

-- ---- New Arrivals (5) ----
insert into products (id, name, slug, description, category_id, base_price, compare_at_price, status) values
  ('b0000000-0000-0000-0000-000000000016',
   'Cropped Denim Jacket',
   'cropped-denim-jacket',
   'Raw indigo denim with a cropped boxy silhouette. Silver hardware, chest flap pockets, and adjustable waist tabs.',
   'a0000000-0000-0000-0000-000000000004', 4499.00, 5499.00, 'active'),
  ('b0000000-0000-0000-0000-000000000017',
   'Asymmetric Hem Dress',
   'asymmetric-hem-dress',
   'Viscose crepe with a sculptural asymmetric hem. Short sleeves, concealed back zip, and a flattering draped neckline.',
   'a0000000-0000-0000-0000-000000000004', 4999.00, 6499.00, 'active'),
  ('b0000000-0000-0000-0000-000000000018',
   'Oversized Knit Cardigan',
   'oversized-knit-cardigan',
   'Chunky alpaca-wool blend in a relaxed oversized silhouette. Shawl collar, ribbed cuffs, and side seam pockets.',
   'a0000000-0000-0000-0000-000000000004', 5499.00, 6999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000019',
   'Pleated Wide-Leg Pant',
   'pleated-wide-leg-pant',
   'Lightweight wool-blend suiting with centre crease and double pleats. High-rise, cropped wide leg. Side pockets.',
   'a0000000-0000-0000-0000-000000000004', 3999.00, 4999.00, 'active'),
  ('b0000000-0000-0000-0000-000000000020',
   'Structured Shoulder Bag',
   'structured-shoulder-bag',
   'Saffiano leather with gold-tone hardware. Top zip closure, detachable shoulder strap, and three interior card slots.',
   'a0000000-0000-0000-0000-000000000004', 7499.00, 9499.00, 'active');

-- -------------------------
-- 3. Product Variants (2-4 per product)
-- -------------------------
insert into product_variants (product_id, size, color, sku, stock_quantity, price_override) values
  -- Product 1: Oxford Shirt
  ('b0000000-0000-0000-0000-000000000001', 'S',  'White',   'OXF-S-WHT', 15, null),
  ('b0000000-0000-0000-0000-000000000001', 'M',  'White',   'OXF-M-WHT', 25, null),
  ('b0000000-0000-0000-0000-000000000001', 'L',  'White',   'OXF-L-WHT', 20, null),
  ('b0000000-0000-0000-0000-000000000001', 'M',  'Sky Blue','OXF-M-SBL', 12, null),
  -- Product 2: Chinos
  ('b0000000-0000-0000-0000-000000000002', '30', 'Khaki',   'CHN-30-KHK', 10, null),
  ('b0000000-0000-0000-0000-000000000002', '32', 'Khaki',   'CHN-32-KHK', 18, null),
  ('b0000000-0000-0000-0000-000000000002', '34', 'Khaki',   'CHN-34-KHK', 8,  null),
  ('b0000000-0000-0000-0000-000000000002', '32', 'Navy',    'CHN-32-NAV', 14, null),
  -- Product 3: Cashmere Blazer
  ('b0000000-0000-0000-0000-000000000003', '48', 'Charcoal','BLZ-48-CHA', 6,  null),
  ('b0000000-0000-0000-0000-000000000003', '50', 'Charcoal','BLZ-50-CHA', 10, null),
  ('b0000000-0000-0000-0000-000000000003', '48', 'Navy',    'BLZ-48-NAV', 4,  null),
  ('b0000000-0000-0000-0000-000000000003', '50', 'Navy',    'BLZ-50-NAV', 7,  null),
  -- Product 4: Merino Sweater
  ('b0000000-0000-0000-0000-000000000004', 'S',  'Heather Grey', 'SWT-S-HGY', 22, null),
  ('b0000000-0000-0000-0000-000000000004', 'M',  'Heather Grey', 'SWT-M-HGY', 30, null),
  ('b0000000-0000-0000-0000-000000000004', 'L',  'Heather Grey', 'SWT-L-HGY', 18, null),
  ('b0000000-0000-0000-0000-000000000004', 'M',  'Burgundy',     'SWT-M-BRG', 11, null),
  -- Product 5: Leather Bomber (ZERO STOCK variant — test out-of-stock UI)
  ('b0000000-0000-0000-0000-000000000005', '48', 'Black',   'BOM-48-BLK', 0,  null),
  ('b0000000-0000-0000-0000-000000000005', '50', 'Black',   'BOM-50-BLK', 3,  null),
  ('b0000000-0000-0000-0000-000000000005', '52', 'Black',   'BOM-52-BLK', 5,  null),
  ('b0000000-0000-0000-0000-000000000005', '50', 'Brown',   'BOM-50-BRN', 7,  null),
  -- Product 6: Silk Gown
  ('b0000000-0000-0000-0000-000000000006', 'S',  'Ivory',   'GOW-S-IVO', 8,  null),
  ('b0000000-0000-0000-0000-000000000006', 'M',  'Ivory',   'GOW-M-IVO', 14, null),
  ('b0000000-0000-0000-0000-000000000006', 'M',  'Midnight','GOW-M-MID', 6,  null),
  -- Product 7: Wool Blazer
  ('b0000000-0000-0000-0000-000000000007', '46', 'Black',   'WBL-46-BLK', 9,  null),
  ('b0000000-0000-0000-0000-000000000007', '48', 'Black',   'WBL-48-BLK', 12, null),
  ('b0000000-0000-0000-0000-000000000007', '46', 'Camel',   'WBL-46-CAM', 4,  null),
  -- Product 8: Cashmere Wrap
  ('b0000000-0000-0000-0000-000000000008', 'S',  'Blush',   'CWR-S-BLS', 16, null),
  ('b0000000-0000-0000-0000-000000000008', 'M',  'Blush',   'CWR-M-BLS', 20, null),
  ('b0000000-0000-0000-0000-000000000008', 'M',  'Camel',   'CWR-M-CAM', 11, null),
  -- Product 9: Pleated Skirt (LOW STOCK variant — test low-stock badge)
  ('b0000000-0000-0000-0000-000000000009', 'XS', 'Black',   'SKT-XS-BLK', 2,  null),
  ('b0000000-0000-0000-0000-000000000009', 'S',  'Black',   'SKT-S-BLK',  7,  null),
  ('b0000000-0000-0000-0000-000000000009', 'M',  'Black',   'SKT-M-BLK',  12, null),
  -- Product 10: Linen Trousers
  ('b0000000-0000-0000-0000-000000000010', 'XS', 'Natural', 'LTN-XS-NAT', 10, null),
  ('b0000000-0000-0000-0000-000000000010', 'S',  'Natural', 'LTN-S-NAT',  15, null),
  ('b0000000-0000-0000-0000-000000000010', 'M',  'Natural', 'LTN-M-NAT',  18, null),
  -- Product 11: Leather Belt
  ('b0000000-0000-0000-0000-000000000011', '90', 'Tan',     'BLT-90-TAN', 25, null),
  ('b0000000-0000-0000-0000-000000000011', '100','Tan',     'BLT-100-TAN',30, null),
  -- Product 12: Silk Scarf
  ('b0000000-0000-0000-0000-000000000012', 'One Size', 'Navy/White', 'SCF-OS-NWH', 40, null),
  ('b0000000-0000-0000-0000-000000000012', 'One Size', 'Burgundy/Gold', 'SCF-OS-BGD', 28, null),
  -- Product 13: Sunglasses
  ('b0000000-0000-0000-0000-000000000013', 'One Size', 'Gold/Green', 'SUN-OS-GGN', 18, null),
  ('b0000000-0000-0000-0000-000000000013', 'One Size', 'Black/Grey', 'SUN-OS-BLG', 22, null),
  -- Product 14: Watch
  ('b0000000-0000-0000-0000-000000000014', 'One Size', 'Cognac',    'WCH-OS-COG', 14, null),
  ('b0000000-0000-0000-0000-000000000014', 'One Size', 'Black',     'WCH-OS-BLK', 10, null),
  -- Product 15: Canvas Tote
  ('b0000000-0000-0000-0000-000000000015', 'One Size', 'Natural',   'TOT-OS-NAT', 20, null),
  ('b0000000-0000-0000-0000-000000000015', 'One Size', 'Olive',     'TOT-OS-OLV', 15, null),
  -- Product 16: Cropped Denim Jacket
  ('b0000000-0000-0000-0000-000000000016', 'S',  'Indigo',  'CDJ-S-IND', 12, null),
  ('b0000000-0000-0000-0000-000000000016', 'M',  'Indigo',  'CDJ-M-IND', 20, null),
  ('b0000000-0000-0000-0000-000000000016', 'M',  'Black',   'CDJ-M-BLK', 8,  null),
  -- Product 17: Asymmetric Dress
  ('b0000000-0000-0000-0000-000000000017', 'S',  'Forest',  'DRS-S-FOR', 6,  null),
  ('b0000000-0000-0000-0000-000000000017', 'M',  'Forest',  'DRS-M-FOR', 11, null),
  -- Product 18: Oversized Cardigan
  ('b0000000-0000-0000-0000-000000000018', 'S',  'Cream',   'OCD-S-CRM', 14, null),
  ('b0000000-0000-0000-0000-000000000018', 'M',  'Cream',   'OCD-M-CRM', 22, null),
  ('b0000000-0000-0000-0000-000000000018', 'L',  'Cream',   'OCD-L-CRM', 10, null),
  -- Product 19: Pleated Pants
  ('b0000000-0000-0000-0000-000000000019', 'XS', 'Black',   'PPN-XS-BLK', 9,  null),
  ('b0000000-0000-0000-0000-000000000019', 'S',  'Black',   'PPN-S-BLK',  16, null),
  ('b0000000-0000-0000-0000-000000000019', 'M',  'Black',   'PPN-M-BLK',  13, null),
  -- Product 20: Shoulder Bag
  ('b0000000-0000-0000-0000-000000000020', 'One Size', 'Black',     'SBG-OS-BLK', 17, null),
  ('b0000000-0000-0000-0000-000000000020', 'One Size', 'Taupe',     'SBG-OS-TAU', 9,  null);

-- -------------------------
-- 4. Product Images (1-2 per product)
-- -------------------------
insert into product_images (product_id, url, alt_text, sort_order) values
  -- Men
  ('b0000000-0000-0000-0000-000000000001', 'https://placehold.co/600x800/e8d5c4/333333?text=Oxford+Shirt+Front', 'Oxford Shirt front view', 1),
  ('b0000000-0000-0000-0000-000000000001', 'https://placehold.co/600x800/e8d5c4/333333?text=Oxford+Shirt+Detail', 'Oxford Shirt detail', 2),
  ('b0000000-0000-0000-0000-000000000002', 'https://placehold.co/600x800/d4c9b8/333333?text=Chino+Pants+Front', 'Chino Pants front view', 1),
  ('b0000000-0000-0000-0000-000000000003', 'https://placehold.co/600x800/4a4a4a/ffffff?text=Cashmere+Blazer', 'Cashmere Blazer front view', 1),
  ('b0000000-0000-0000-0000-000000000004', 'https://placehold.co/600x800/b0a89a/333333?text=Merino+Sweater', 'Merino Sweater front view', 1),
  ('b0000000-0000-0000-0000-000000000005', 'https://placehold.co/600x800/2d2d2d/ffffff?text=Leather+Bomber', 'Leather Bomber front view', 1),
  ('b0000000-0000-0000-0000-000000000005', 'https://placehold.co/600x800/5c3a2a/ffffff?text=Bomber+Detail', 'Leather Bomber detail', 2),
  -- Women
  ('b0000000-0000-0000-0000-000000000006', 'https://placehold.co/600x800/f5ebe0/333333?text=Silk+Gown', 'Silk Gown front view', 1),
  ('b0000000-0000-0000-0000-000000000007', 'https://placehold.co/600x800/3d3d3d/ffffff?text=Wool+Blazer', 'Wool Blazer front view', 1),
  ('b0000000-0000-0000-0000-000000000008', 'https://placehold.co/600x800/e8c8b8/333333?text=Cashmere+Wrap', 'Cashmere Wrap front view', 1),
  ('b0000000-0000-0000-0000-000000000009', 'https://placehold.co/600x800/2d2d2d/ffffff?text=Pleated+Skirt', 'Pleated Skirt front view', 1),
  ('b0000000-0000-0000-0000-000000000010', 'https://placehold.co/600x800/d9cdb8/333333?text=Linen+Trousers', 'Linen Trousers front view', 1),
  -- Accessories
  ('b0000000-0000-0000-0000-000000000011', 'https://placehold.co/600x800/c4a882/333333?text=Leather+Belt', 'Leather Belt', 1),
  ('b0000000-0000-0000-0000-000000000012', 'https://placehold.co/600x800/1e3a5f/ffffff?text=Silk+Scarf', 'Silk Scarf', 1),
  ('b0000000-0000-0000-0000-000000000013', 'https://placehold.co/600x800/e8c8a0/333333?text=Aviator+Sunglasses', 'Aviator Sunglasses', 1),
  ('b0000000-0000-0000-0000-000000000014', 'https://placehold.co/600x800/8b6f4e/ffffff?text=Leather+Watch', 'Leather Watch', 1),
  ('b0000000-0000-0000-0000-000000000015', 'https://placehold.co/600x800/b8a88a/333333?text=Canvas+Tote', 'Canvas Tote', 1),
  -- New Arrivals
  ('b0000000-0000-0000-0000-000000000016', 'https://placehold.co/600x800/2c4a6b/ffffff?text=Denim+Jacket', 'Cropped Denim Jacket', 1),
  ('b0000000-0000-0000-0000-000000000017', 'https://placehold.co/600x800/2d5a3d/ffffff?text=Asymmetric+Dress', 'Asymmetric Hem Dress front view', 1),
  ('b0000000-0000-0000-0000-000000000018', 'https://placehold.co/600x800/f5edd6/333333?text=Knit+Cardigan', 'Oversized Knit Cardigan', 1),
  ('b0000000-0000-0000-0000-000000000019', 'https://placehold.co/600x800/3d3d3d/ffffff?text=Pleated+Pant', 'Pleated Wide-Leg Pant', 1),
  ('b0000000-0000-0000-0000-000000000020', 'https://placehold.co/600x800/2d2d2d/ffffff?text=Shoulder+Bag', 'Structured Shoulder Bag', 1);

-- -------------------------
-- 5. Reviews  (5 approved)
-- -------------------------
insert into reviews (product_id, reviewer_name, reviewer_email, rating, title, body, status) values
  ('b0000000-0000-0000-0000-000000000001', 'Arjun Mehta',  'arjun@example.com',  5, 'Perfect fit, impeccable quality',
   'Bought this for work and it exceeded expectations. The fabric feels substantial yet breathable. True to size.', 'approved'),
  ('b0000000-0000-0000-0000-000000000003', 'Ravi Kapoor',  'ravi@example.com',   4, 'Sharp blazer for the price',
   'Great construction and the fabric has a nice hand feel. Sleeves needed minor tailoring but overall very satisfied.', 'approved'),
  ('b0000000-0000-0000-0000-000000000006', 'Priya Sharma', 'priya@example.com',  5, 'Absolutely stunning gown',
   'Wore this to a wedding reception and received countless compliments. The silk drapes beautifully and the colour is rich.', 'approved'),
  ('b0000000-0000-0000-0000-000000000008', 'Ananya Reddy', 'ananya@example.com', 5, 'Softest cashmere I own',
   'So cosy and warm without being heavy. The blush colour is exactly as pictured. Perfect for winter layering.', 'approved'),
  ('b0000000-0000-0000-0000-000000000005', 'Vikram Singh', 'vikram@example.com', 4, 'Solid bomber, runs slightly large',
   'Beautiful leather that will only get better with age. I would recommend sizing down one if between sizes.', 'approved');

-- -------------------------
-- 6. Discount Code
-- -------------------------
insert into discount_codes (code, discount_type, value, min_order_value, expires_at, usage_limit) values
  ('WELCOME10', 'percentage', 10.00, 1500.00, '2027-01-01 00:00:00+00', 100);

-- -------------------------
-- 7. Blog Categories
-- -------------------------
insert into blog_categories (id, name, slug) values
  ('d0000000-0000-0000-0000-000000000001', 'Style Guides',     'style-guides'),
  ('d0000000-0000-0000-0000-000000000002', 'Seasonal Trends',  'seasonal-trends'),
  ('d0000000-0000-0000-0000-000000000003', 'Care & Maintenance', 'care-maintenance');

-- -------------------------
-- 8. Blog Posts  (3 published)
-- -------------------------
insert into blog_posts (title, slug, excerpt, content_html, cover_image_url, blog_category_id, published, published_at, seo_title, seo_description) values
  (
   'The Art of Layering: Building the Perfect Winter Wardrobe',
   'art-of-layering-winter-wardrobe',
   'Master the art of layering with our guide to combining textures, silhouettes, and proportions for a polished cold-weather look.',
   '<p>Layering is the single most effective technique for elevating your winter style while staying warm. The key lies in balancing proportions and mixing textures — think a fine merino base layer, an unstructured blazer, and a cashmere wrap that adds softness without bulk.</p><p>Start with a lightweight foundation: a silk or merino crew neck sits flat and traps heat. Add a mid-layer for structure — a tailored blazer or cropped jacket creates visual interest at the waist. Finish with an outer layer that drapes, like an open-front cardigan or a wool overcoat.</p><p>The colour palette should move from dark to light as you layer outward, creating depth without clutter.</p>',
   'https://placehold.co/1200x600/3d3d3d/ffffff?text=The+Art+of+Layering',
   'd0000000-0000-0000-0000-000000000001', true, now() - interval '3 days',
   'Winter Layering Guide | Fashion Apparel', 'Learn the art of winter layering with our guide to combining textures and proportions for a polished cold-weather look.'),
  (
   'Summer Essentials: Five Pieces That Define the Season',
   'summer-essentials-five-pieces',
   'From linen trousers to silk scarves, these five essentials will carry you through the hottest months in effortless style.',
   '<p>Summer dressing is about letting the fabric do the work. Lightweight, breathable materials in relaxed silhouettes keep you cool while looking intentional.</p><p><strong>1. Linen Wide-Leg Trousers</strong> — The ultimate hot-weather pant. The loose cut allows airflow, and the natural linen fibre wicks moisture away from the skin.</p><p><strong>2. Silk Twill Scarf</strong> — A square silk scarf tied at the neck or on a bag adds a shot of colour without adding warmth.</p><p><strong>3. Canvas Tote</strong> — Ditch the leather. A waxed canvas tote in natural or olive tones seasons beautifully and holds everything for a day out.</p><p><strong>4. Aviator Sunglasses</strong> — Polarised green lenses cut glare and the gold frame complements warm-weather outfits.</p><p><strong>5. The White Oxford</strong> — A crisp cotton oxford shirt worn untucked over linen trousers is the uniform of effortless summer style.</p>',
   'https://placehold.co/1200x600/d9cdb8/333333?text=Summer+Essentials',
   'd0000000-0000-0000-0000-000000000002', true, now() - interval '10 days',
   'Summer Fashion Essentials | Fashion Apparel', 'Discover the five essential summer pieces — from linen trousers to silk scarves — that define effortless warm-weather style.'),
  (
   'How to Care for Cashmere: A Complete Guide',
   'how-to-care-for-cashmere',
   'Make your cashmere knits last a lifetime with these simple washing, drying, and storage tips.',
   '<p>Cashmere is an investment, and with the right care it will outlast fast-fashion alternatives by years. Here is how to keep your knits looking their best.</p><p><strong>Washing:</strong> Hand wash in lukewarm water with a specialist cashmere shampoo. Avoid fabric softener — it breaks down the natural fibres. Gently squeeze (never wring) and roll in a towel to remove excess water.</p><p><strong>Drying:</strong> Lay flat on a drying rack away from direct sunlight and heat sources. Never hang cashmere — the weight of the wet fibre will stretch the garment out of shape.</p><p><strong>Storage:</strong> Fold rather than hang. Store in a breathable cotton bag with cedar blocks to deter moths. Avoid cedar chests for long-term storage as the oils can discolour light colours.</p><p><strong>Pilling:</strong> Light pilling is normal for new cashmere. Use a cashmere comb — never a fabric shaver — to remove pills gently.</p>',
   'https://placehold.co/1200x600/e8c8b8/333333?text=Cashmere+Care+Guide',
   'd0000000-0000-0000-0000-000000000003', true, now() - interval '1 day',
   'Cashmere Care Guide | Fashion Apparel', 'Learn how to wash, dry, and store cashmere to make your knits last a lifetime. Complete care guide with washing and storage tips.');
