-- ============================================================
-- Migration 00004: Reviews
-- Fashion Apparel — Guest Product Reviews
-- ============================================================

-- -------------------------
-- 1. Enum
-- -------------------------
create type review_status as enum ('pending', 'approved', 'rejected');

-- -------------------------
-- 2. Reviews
-- -------------------------
create table reviews (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  reviewer_name   text not null,
  reviewer_email  text not null,
  rating          integer not null check (rating >= 1 and rating <= 5),
  title           text,
  body            text,
  status          review_status not null default 'pending',
  created_at      timestamptz not null default now()
);

create index idx_reviews_product_id on reviews(product_id);
create index idx_reviews_status on reviews(status);

-- -------------------------
-- 3. Row Level Security
-- -------------------------
alter table reviews enable row level security;

-- Public can only see approved reviews
create policy "Approved reviews are publicly readable"
  on reviews for select
  to anon
  using (status = 'approved');

-- Public can submit a new review (status defaults to pending)
create policy "Anyone can submit a review"
  on reviews for insert
  to anon
  with check (true);

-- No public updates or deletes
create policy "No anon update on reviews"
  on reviews for update to anon using (false);

create policy "No anon delete on reviews"
  on reviews for delete to anon using (false);
