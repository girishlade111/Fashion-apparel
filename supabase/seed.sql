-- ============================================================
-- Seed Data: Categories & Products
-- ============================================================

-- Categories
insert into categories (id, name, slug, parent_id, image_url) values
  ('c0000000-0000-0000-0000-000000000001', 'Outerwear',  'outerwear',  null, null),
  ('c0000000-0000-0000-0000-000000000002', 'Tops',       'tops',       null, null),
  ('c0000000-0000-0000-0000-000000000003', 'Bottoms',    'bottoms',    null, null),
  ('c0000000-0000-0000-0000-000000000004', 'Tailored Coats', 'tailored-coats',
      'c0000000-0000-0000-0000-000000000001', null),
  ('c0000000-0000-0000-0000-000000000005', 'Blazers',    'blazers',
      'c0000000-0000-0000-0000-000000000001', null);

-- Products
insert into products (id, name, slug, description, category_id, base_price, compare_at_price, status) values
  (
    'p0000000-0000-0000-0000-000000000001',
    'Wool Cashmere Overcoat',
    'wool-cashmere-overcoat',
    'A luxurious blend of Italian wool and cashmere. Structured shoulders, double-breasted closure, and a silky cupro lining.',
    'c0000000-0000-0000-0000-000000000004',
    1890.00, 2400.00, 'active'
  ),
  (
    'p0000000-0000-0000-0000-000000000002',
    'Linen Relaxed Blazer',
    'linen-relaxed-blazer',
    'Unstructured linen blazer with a soft drape. Patch pockets and horn buttons.',
    'c0000000-0000-0000-0000-000000000005',
    980.00, null, 'active'
  );

-- Product images
insert into product_images (product_id, url, alt_text, sort_order) values
  ('p0000000-0000-0000-0000-000000000001', '/images/products/overcoat-front.jpg', 'Wool Cashmere Overcoat — front view', 1),
  ('p0000000-0000-0000-0000-000000000001', '/images/products/overcoat-detail.jpg', 'Wool Cashmere Overcoat — detail', 2),
  ('p0000000-0000-0000-0000-000000000002', '/images/products/blazer-front.jpg', 'Linen Relaxed Blazer — front view', 1);

-- Product variants
insert into product_variants (product_id, size, color, sku, stock_quantity, price_override) values
  ('p0000000-0000-0000-0000-000000000001', '48', 'Charcoal',  'OVC-48-CHA', 12, null),
  ('p0000000-0000-0000-0000-000000000001', '50', 'Charcoal',  'OVC-50-CHA', 18, null),
  ('p0000000-0000-0000-0000-000000000001', '52', 'Charcoal',  'OVC-52-CHA', 8,  null),
  ('p0000000-0000-0000-0000-000000000001', '48', 'Camel',     'OVC-48-CAM', 6,  null),
  ('p0000000-0000-0000-0000-000000000001', '50', 'Camel',     'OVC-50-CAM', 14, null),
  ('p0000000-0000-0000-0000-000000000002', '48', 'Ivory',     'LBZ-48-IVO', 10, null),
  ('p0000000-0000-0000-0000-000000000002', '50', 'Ivory',     'LBZ-50-IVO', 22, null),
  ('p0000000-0000-0000-0000-000000000002', '48', 'Navy',      'LBZ-48-NAV', 15, null);
