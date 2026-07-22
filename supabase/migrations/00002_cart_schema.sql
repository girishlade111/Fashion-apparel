-- ============================================================
-- Migration 00002: Cart Schema
-- Fashion Apparel — Guest Cookie-Based Cart
-- ============================================================
--
-- Design notes:
-- - Carts are identified by a UUID cookie_token stored in an
--   httpOnly cookie. No auth required.
-- - All cart mutations go through API routes / server actions
--   using the service role key. Anon / client-side access is
--   denied by RLS.
-- - TODO: implement a pg_cron or pg_tim
 job to clean up
--   cart_sessions where last_active_at < now() - interval '30 days'.
--   This migration creates the tables only — cleanup is separate.
--

-- -------------------------
-- 1. Cart Sessions
-- -------------------------
create table cart_sessions (
  id              uuid primary key default gen_random_uuid(),
  cookie_token    uuid not null unique,
  created_at      timestamptz not null default now(),
  last_active_at  timestamptz not null default now()
);

create index idx_cart_sessions_cookie_token on cart_sessions(cookie_token);
create index idx_cart_sessions_last_active_at on cart_sessions(last_active_at);

-- -------------------------
-- 2. Cart Items
-- -------------------------
create table cart_items (
  id                  uuid primary key default gen_random_uuid(),
  cart_session_id     uuid not null references cart_sessions(id) on delete cascade,
  product_variant_id  uuid not null references product_variants(id) on delete cascade,
  quantity            integer not null default 1 check (quantity >= 1),
  added_at            timestamptz not null default now()
);

create index idx_cart_items_session on cart_items(cart_session_id);
create index idx_cart_items_variant on cart_items(product_variant_id);

alter table cart_items
  add constraint uq_cart_session_variant
  unique (cart_session_id, product_variant_id);

-- -------------------------
-- 3. Row Level Security
-- -------------------------
--
-- Cart tables are accessed exclusively via the service role
-- through API routes and server actions. The service role
-- bypasses RLS entirely, so these policies serve as a safety
-- net to prevent accidental anon access.
--
alter table cart_sessions enable row level security;
alter table cart_items enable row level security;

create policy "Cart sessions are not publicly accessible"
  on cart_sessions for all
  to anon
  using (false);

create policy "Cart items are not publicly accessible"
  on cart_items for all
  to anon
  using (false);
