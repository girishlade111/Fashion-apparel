# Fashion Apparel

A full-featured fashion e-commerce storefront built with **Next.js 16**, **Supabase**, and **Razorpay**. Features include a guest cart, checkout with payment processing, admin panel, wishlist, reviews, blog, and an editorial homepage.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, `tw-animate-css` |
| Database | Supabase (PostgreSQL) |
| Auth (Admin) | Supabase magic-link + session cookies |
| Payments | Razorpay (Orders API + Webhooks) |
| Email | Resend |
| Fonts | Playfair Display (headings), Inter (body) |

## Features

### Storefront
- Editorial homepage with hero, category grid, new arrivals, brand story
- Product listing with category/price/size/color filters, sort, pagination
- Product detail with image gallery (zoom, lightbox, touch swipe), variant selectors (size/color), quantity stepper
- Search with debounced autocomplete and keyboard navigation
- Guest cart (DB-backed via `cart_token` cookie) with drawer and full-page views
- Checkout with shipping form, discount codes, Razorpay integration
- Order confirmation with polling, shipping details, payment info
- Wishlist (localStorage)
- Product reviews with star breakdown, pagination, write-a-review form
- Blog with categories, pagination, related articles
- Related/recommended products (same-category, in-stock prioritized)
- Low-stock badges ("Only X left") on listing cards and variant selectors

### Admin Panel
- Dashboard with stats (orders, revenue, low-stock alerts)
- Product management (CRUD with slide-in drawer, variants, images)
- Order management (list, filter, status transitions)
- Blog management (create/edit, publish/draft toggle, categories, SEO fields)

### SEO
- Dynamic `generateMetadata` on all pages (title template `%s | Fashion Apparel`)
- Dynamic sitemap (`/sitemap.xml`) with all active products, categories, and published posts
- `robots.txt` with admin/api paths disallowed
- JSON-LD structured data: Organization (homepage), Product + BreadcrumbList (product detail), BreadcrumbList (blog detail)
- Product schema includes live price, InStock/OutOfStock availability, aggregate ratings

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project
- A Razorpay merchant account
- A Resend API key (for order confirmation emails)

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `RAZORPAY_KEY_ID` | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay API key secret |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook signing secret |
| `RESEND_API_KEY` | Resend API key for sending emails |
| `NEXT_PUBLIC_SITE_URL` | Site URL (defaults to `http://localhost:3000`) |

### Database Setup

Run the Supabase migrations in order:

```bash
supabase migration up
```

Or apply the SQL files from `supabase/migrations/00001_initial_schema.sql` through `00005_blog.sql` in the Supabase SQL editor.

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin Login

Visit `/admin/login` and enter your email to receive a magic link.

## Project Structure

```
src/
├── app/
│   ├── (storefront)/        # Public pages (home, shop, products, blog, cart, checkout, etc.)
│   ├── admin/               # Admin pages (login, dashboard, products, orders, blog)
│   ├── api/                 # API routes (products, cart, checkout, orders, reviews, blog, admin, webhooks)
│   ├── sitemap.ts           # Dynamic sitemap
│   ├── robots.ts            # Robots configuration
│   └── layout.tsx           # Root layout with metadata
├── components/
│   └── storefront/          # React components (Navbar, Footer, ProductCard, ProductDetail, CartDrawer, etc.)
├── lib/
│   ├── supabase/            # Supabase client helpers (server, admin)
│   ├── auth/                # Admin auth (magic link, session check)
│   ├── email/               # Order confirmation email via Resend
│   ├── products/            # Related products logic
│   ├── cart-context.tsx     # Cart state (React context)
│   ├── wishlist-context.tsx # Wishlist state (React context)
│   ├── constants.ts         # App-wide constants
│   ├── env.ts               # Environment variable validation
│   └── seo.ts               # SEO helpers (JSON-LD generators, truncate)
└── styles/
    └── globals.css          # Global styles
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
