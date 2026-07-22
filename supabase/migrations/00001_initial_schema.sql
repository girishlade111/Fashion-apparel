-- ============================================================
-- Migration 00001: Initial Schema
-- Fashion Apparel — Categories, Products, Variants
-- ============================================================

-- -------------------------
-- 1. Enums
-- -------------------------
create type product_status as enum ('draft', 'active', 'archived');

-- -------------------------
-- 2. Categories
-- -------------------------
create table categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  parent_id   uuid references categories(id) on delete set null,
  image_url   text,
  created_at  timestamptz not null default now()
);

create index idx_categories_slug on categories(slug);
create index idx_categories_parent_id on categories(parent_id);

-- -------------------------
-- 3. Products
-- -------------------------
create table products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  category_id      uuid not null references categories(id) on delete restrict,
  base_price       numeric(10,2) not null check (base_price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  status           product_status not null default 'draft',
  created_at       timestamptz not null default now()
);

create index idx_products_slug on products(slug);
create index idx_products_category_id on products(category_id);
create index idx_products_status on products(status);

-- -------------------------
-- 4. Product Images
-- -------------------------
create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  integer not null default 0
);

create index idx_product_images_product_id on product_images(product_id);

-- -------------------------
-- 5. Product Variants
-- -------------------------
create table product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  size            text not null,
  color           text not null,
  sku             text not null unique,
  stock_quantity  integer not null default 0 check (stock_quantity >= 0),
  price_override  numeric(10,2) check (price_override is null or price_override >= 0)
);

create index idx_product_variants_product_id on product_variants(product_id);

alter table product_variants
  add constraint uq_product_variant
  unique (product_id, size, color);

-- -------------------------
-- 6. Row Level Security
-- -------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;

-- Anon / public can read all categories
create policy "Categories are publicly readable"
  on categories for select
  to anon
  using (true);

-- Anon / public can only read active products
create policy "Active products are publicly readable"
  on products for select
  to anon
  using (status = 'active');

-- Images of active products are readable
create policy "Product images are publicly readable"
  on product_images for select
  to anon
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.status = 'active'
    )
  );

-- Variants of active products are readable
create policy "Product variants are publicly readable"
  on product_variants for select
  to anon
  using (
    exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.status = 'active'
    )
  );

-- Deny all mutations for anon role on all tables
create policy "No anon insert"
  on categories for insert to anon with check (false);
create policy "No anon update"
  on categories for update to anon using (false);
create policy "No anon delete"
  on categories for delete to anon using (false);

create policy "No anon insert"
  on products for insert to anon with check (false);
create policy "No anon update"
  on products for update to anon using (false);
create policy "No anon delete"
  on products for delete to anon using (false);

create policy "No anon insert"
  on product_images for insert to anon with check (false);
create policy "No anon update"
  on product_images for update to anon using (false);
create policy "No anon delete"
  on product_images for delete to anon using (false);

create policy "No anon insert"
  on product_variants for insert to anon with check (false);
create policy "No anon update"
  on product_variants for update to anon using (false);
create policy "No anon delete"
  on product_variants for delete to anon using (false);
