-- ============================================================
-- Migration 00003: Orders Schema
-- Fashion Apparel — Orders, Order Items, Discount Codes
-- ============================================================

-- -------------------------
-- 1. Enums
-- -------------------------
create type order_status as enum ('pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled');
create type discount_type as enum ('percentage', 'fixed');

-- -------------------------
-- 2. Order number sequence
-- -------------------------
create sequence order_number_seq start 1;

create function generate_order_number()
returns trigger as $$
begin
  new.order_number := 'ORD-' || lpad(nextval('order_number_seq')::text, 6, '0');
  return new;
end;
$$ language plpgsql;

-- -------------------------
-- 3. Orders
-- -------------------------
create table orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  customer_name     text not null,
  customer_email    text not null,
  customer_phone    text,
  shipping_address  jsonb not null,
  subtotal          numeric(10,2) not null check (subtotal >= 0),
  discount_amount   numeric(10,2) not null default 0 check (discount_amount >= 0),
  shipping_fee      numeric(10,2) not null check (shipping_fee >= 0),
  total             numeric(10,2) not null check (total >= 0),
  status            order_status not null default 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  created_at        timestamptz not null default now()
);

create index idx_orders_order_number on orders(order_number);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);

create trigger trg_orders_order_number
  before insert on orders
  for each row
  when (new.order_number is null)
  execute function generate_order_number();

-- -------------------------
-- 4. Order Items (with snapshots)
-- -------------------------
create table order_items (
  id                    uuid primary key default gen_random_uuid(),
  order_id              uuid not null references orders(id) on delete cascade,
  product_variant_id    uuid references product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_label_snapshot text not null,
  unit_price_snapshot   numeric(10,2) not null check (unit_price_snapshot >= 0),
  quantity              integer not null check (quantity >= 1)
);

create index idx_order_items_order_id on order_items(order_id);

-- -------------------------
-- 5. Discount Codes
-- -------------------------
create table discount_codes (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  discount_type     discount_type not null,
  value             numeric(10,2) not null check (value > 0),
  min_order_value   numeric(10,2) check (min_order_value is null or min_order_value >= 0),
  expires_at        timestamptz,
  usage_limit       integer check (usage_limit is null or usage_limit > 0),
  times_used        integer not null default 0 check (times_used >= 0),
  active            boolean not null default true
);

create index idx_discount_codes_code on discount_codes(code);

-- -------------------------
-- 6. Row Level Security
-- -------------------------
--
-- All order data is accessed exclusively via the service role
-- through API routes and server actions. Direct anon access is
-- denied at all levels.

alter table orders enable row level security;
alter table order_items enable row level security;
alter table discount_codes enable row level security;

create policy "Orders are not publicly accessible"
  on orders for all to anon using (false);

create policy "Order items are not publicly accessible"
  on order_items for all to anon using (false);

-- Discount codes are validated server-side; no direct client access
create policy "Discount codes are not publicly accessible"
  on discount_codes for all to anon using (false);
