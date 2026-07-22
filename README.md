# Fashion Apparel

A premium fashion e-commerce storefront built with **Next.js 16 (App Router)**, **Supabase**, **Tailwind CSS v4**, and **Razorpay**. Features a complete guest shopping experience with cart, wishlist, checkout, reviews, blog, and a full admin panel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS v4 + shadcn/ui (base-nova style) |
| **Database** | Supabase (PostgreSQL) |
| **Auth (Admin)** | Supabase Auth (email/password) |
| **Payments** | Razorpay Orders API + Webhooks |
| **Email** | Resend (transactional emails) |
| **Fonts** | Playfair Display (headings), Inter (body) |
| **Icons** | Lucide React |

---

## Features

### Storefront
- **Homepage** — Hero section, category cards, featured products (with hover quick-add-to-cart), brand story, editorial lookbook, testimonials
- **Shop** — Product grid with sidebar filters (category, price range, size, color), sort options, pagination, loading skeletons
- **Product Detail** — Image gallery with zoom + lightbox + touch swipe, variant selectors (size, color) with stock awareness, quantity stepper, add-to-cart feedback, accordion sections (description, materials, shipping), reviews with star breakdown, related products carousel
- **Cart** — Slide-in drawer (accessible from any page) + full cart page, discount code validation, quantity stepper, line totals, subtotal/shipping/total breakdown, recommended products
- **Checkout** — Shipping address form, Razorpay payment integration, order confirmation with polling
- **Wishlist** — Toggle from any product card, persisted in localStorage, full wishlist page
- **Search** — Full-screen overlay with debounced autocomplete (300ms), keyboard navigation, product results with images
- **Blog** — Listing with category filter + pagination, individual posts with sanitized HTML content
- **Style Guide** — Design system reference page

### Admin Panel (`/admin`)
- **Login** — Supabase Auth email/password with redirect back to intended page
- **Dashboard** — Stats cards (total orders, revenue, low-stock count), low-stock alerts table, recent orders table
- **Products** — CRUD with status filter, slide-in create/edit drawer, variant management, image upload/reorder, archive fallback
- **Orders** — List with status filter, detail drawer with customer info + items, status transitions with validation
- **Blog** — CRUD with publish/draft toggle, content HTML editor, cover image, SEO fields, category management

### API Routes
- `/api` — Health check
- `/api/products` — Listing with search, filter, sort, pagination
- `/api/products/[slug]` — Single product with images, variants, reviews, related
- `/api/products/recommended` — Related products by category
- `/api/categories` — All categories
- `/api/cart` — Guest cookie-based cart CRUD
- `/api/checkout` — Create order, validate stock, apply discount, create Razorpay order, clear cart
- `/api/orders/[order_number]` — Fetch order for confirmation polling
- `/api/discount/validate` — Validate discount code
- `/api/reviews` — Fetch/submit product reviews
- `/api/blog` — Published blog posts (paginated, filtered by category)
- `/api/blog/[slug]` — Single blog post
- `/api/webhooks/razorpay` — Razorpay payment webhook (HMAC verified)
- `/api/admin/*` — All admin CRUD endpoints (auth-protected)

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (fonts, metadata)
│   │   ├── globals.css                   # Tailwind v4 theme + animations
│   │   ├── sitemap.ts                    # Dynamic sitemap
│   │   ├── robots.ts                     # robots.txt
│   │   │
│   │   ├── (storefront)/                 # Public storefront pages
│   │   │   ├── layout.tsx                # Navbar, CartDrawer, Footer, providers
│   │   │   ├── page.tsx                  # Homepage
│   │   │   ├── shop/page.tsx             # Shop with filters
│   │   │   ├── shop/[category]/page.tsx  # Category redirect
│   │   │   ├── products/[slug]/page.tsx  # Product detail
│   │   │   ├── cart/page.tsx             # Full cart page
│   │   │   ├── checkout/page.tsx         # Checkout + Razorpay
│   │   │   ├── wishlist/page.tsx         # Wishlist
│   │   │   ├── search/page.tsx           # Search results
│   │   │   ├── blog/page.tsx             # Blog listing
│   │   │   ├── blog/[slug]/page.tsx      # Blog post
│   │   │   ├── style-guide/page.tsx      # Design system
│   │   │   └── order-confirmation/       # Post-checkout
│   │   │
│   │   ├── admin/                        # Admin panel
│   │   │   ├── login/page.tsx
│   │   │   └── (dashboard)/
│   │   │       ├── layout.tsx            # Auth check + sidebar
│   │   │       ├── page.tsx              # Dashboard stats
│   │   │       ├── products/page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       └── blog/page.tsx
│   │   │
│   │   └── api/                          # API routes
│   │       ├── products/route.ts
│   │       ├── products/[slug]/route.ts
│   │       ├── categories/route.ts
│   │       ├── cart/route.ts
│   │       ├── checkout/route.ts
│   │       ├── orders/[order_number]/route.ts
│   │       ├── discount/validate/route.ts
│   │       ├── reviews/route.ts
│   │       ├── newsletter/route.ts
│   │       ├── blog/route.ts
│   │       ├── blog/[slug]/route.ts
│   │       ├── webhooks/razorpay/route.ts
│   │       └── admin/
│   │
│   ├── components/
│   │   ├── ui/button.tsx                 # Button component (shadcn-style)
│   │   └── storefront/
│   │       ├── Navbar.tsx
│   │       ├── Footer.tsx
│   │       ├── CartDrawer.tsx
│   │       ├── CartItemRow.tsx
│   │       ├── ImageGallery.tsx
│   │       ├── ProductCard.tsx
│   │       ├── ProductDetail.tsx
│   │       ├── ProductReviews.tsx
│   │       ├── SearchOverlay.tsx
│   │       └── ShopContent.tsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # Browser Supabase client
│   │   │   └── server.ts                # Admin (service role) client
│   │   ├── auth/admin.ts                 # Admin session helper
│   │   ├── email/index.ts                # Resend email templates
│   │   ├── products/getRelated.ts        # Related products logic
│   │   ├── seo.ts                        # SEO constants + JSON-LD helpers
│   │   ├── constants.ts
│   │   ├── env.ts                        # Env var validation
│   │   ├── utils.ts                      # cn() utility
│   │   ├── cart-context.tsx              # Cart React Context
│   │   └── wishlist-context.tsx          # Wishlist React Context
│   │
│   ├── types/supabase.ts                 # Full database type definitions
│   └── proxy.ts                          # Admin auth proxy middleware
│
├── supabase/
│   └── migrations/
│       ├── 00001_initial_schema.sql      # Categories, Products, Variants
│       ├── 00002_cart_schema.sql          # Guest cart tables
│       ├── 00003_orders_schema.sql        # Orders, Order Items, Discount Codes
│       ├── 00004_reviews.sql              # Product reviews
│       ├── 00005_blog.sql                 # Blog categories + posts
│       └── seed.sql                       # Sample data
│
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── components.json                        # shadcn/ui config
├── eslint.config.mjs
├── .prettierrc
└── package.json
```

---

## Getting Started

### Prerequisites
- Node.js 20+ (or 24+)
- A Supabase project
- A Razorpay merchant account
- A Resend API key (for order confirmation emails)

### Environment Variables

Create `.env.local` from `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret
RESEND_API_KEY=your-resend-api-key
```

### Install & Run

```bash
npm install
npm run dev        # http://localhost:3000
```

### Database Setup

Run the migrations in order under `supabase/migrations/` in your Supabase SQL editor:

1. `00001_initial_schema.sql`
2. `00002_cart_schema.sql`
3. `00003_orders_schema.sql`
4. `00004_reviews.sql`
5. `00005_blog.sql`
6. `seed.sql` (optional sample data)

### Admin Login

1. Go to your Supabase dashboard → Authentication → Providers → Email
2. Create an admin user (email + password)
3. Visit `http://localhost:3000/admin/login` and sign in

---

## Deployment (Render)

### Web Service Setup

1. Create a **Web Service** (not Static Site) on Render
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Runtime** | Node |

### Environment Variables

Add all variables from `.env.local.example` in Render's **Environment** section:

| Variable | Example Value |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | (your service role key) |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.onrender.com` |
| `RAZORPAY_KEY_ID` | (your key) |
| `RAZORPAY_KEY_SECRET` | (your secret) |
| `RAZORPAY_WEBHOOK_SECRET` | (your secret) |
| `RESEND_API_KEY` | (your key) |

### Razorpay Webhook

In Razorpay dashboard, configure a webhook pointing to:

```
https://your-app.onrender.com/api/webhooks/razorpay
```

Subscribe to `payment.captured` and `payment.failed` events.

---

## Architecture Notes

- **Data Fetching**: Server components use `createAdminClient()` (service role) for direct DB access; client components fetch through API routes. The service role key is never exposed to the browser.
- **Guest Cart**: Cart sessions are identified by an `httpOnly` cookie containing a UUID. Cart data persists across browser sessions.
- **Product Variants**: Each product has multiple variants (size + color combinations) with independent stock tracking. Variant selectors on the product detail page check stock in real-time and disable sold-out options.
- **SEO**: Every page has custom `generateMetadata`, pages include JSON-LD structured data (Organization, Product, BreadcrumbList), and a dynamic sitemap is generated from database content.
- **Payments**: Orders are created with a `pending` status. Razorpay emits a `payment.captured` webhook that updates the order to `paid` and sends a confirmation email via Resend.
- **Admin Security**: The admin panel is protected by Supabase Auth. The `proxy.ts` middleware checks for an active session on every `/admin/*` route and redirects unauthenticated users to the login page.

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## License

Private — all rights reserved.
