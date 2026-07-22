-- ============================================================
-- Migration 00005: Blog
-- Fashion Apparel — SEO & Content Marketing
-- ============================================================

-- -------------------------
-- 1. Blog Categories
-- -------------------------
create table blog_categories (
  id    uuid primary key default gen_random_uuid(),
  name  text not null,
  slug  text not null unique
);

create index idx_blog_categories_slug on blog_categories(slug);

-- -------------------------
-- 2. Blog Posts
-- -------------------------
create table blog_posts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  excerpt           text,
  content_html      text,
  cover_image_url   text,
  blog_category_id  uuid references blog_categories(id) on delete set null,
  published         boolean not null default false,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  seo_title         text,
  seo_description   text
);

create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_published on blog_posts(published);
create index idx_blog_posts_category on blog_posts(blog_category_id);
create index idx_blog_posts_published_at on blog_posts(published_at);

-- -------------------------
-- 3. Row Level Security
-- -------------------------
alter table blog_categories enable row level security;
alter table blog_posts enable row level security;

create policy "Published blog categories are publicly readable"
  on blog_categories for select
  to anon
  using (true);

create policy "Published blog posts are publicly readable"
  on blog_posts for select
  to anon
  using (published = true);

create policy "No anon insert on blog_posts"
  on blog_posts for insert to anon with check (false);
create policy "No anon update on blog_posts"
  on blog_posts for update to anon using (false);
create policy "No anon delete on blog_posts"
  on blog_posts for delete to anon using (false);
