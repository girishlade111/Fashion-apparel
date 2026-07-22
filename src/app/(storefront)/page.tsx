import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE_NAME, SITE_DESCRIPTION, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

async function getData() {
  try {
    const supabase = createAdminClient();

    const { data: categories } = await (supabase.from("categories") as any)
      .select("name, slug, image_url")
      .order("name");

    const { data: products } = await (supabase.from("products") as any)
      .select("id, name, slug, base_price, compare_at_price")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    const productIds = (products || []).map((p: any) => p.id);
    const imagesMap: Record<string, string> = {};

    if (productIds.length > 0) {
      const { data: images } = await (supabase.from("product_images") as any)
        .select("product_id, url")
        .in("product_id", productIds)
        .order("sort_order");
      for (const img of images || []) {
        if (!imagesMap[img.product_id]) {
          imagesMap[img.product_id] = img.url;
        }
      }
    }

    return {
      categories: categories || [],
      products: (products || []).map((p: any) => ({
        ...p,
        image: imagesMap[p.id] || null,
      })),
    };
  } catch {
    return { categories: [], products: [] };
  }
}

const testimonials = [
  {
    quote: "The quality is evident the moment you touch the fabric. Every piece feels intentional, considered — like it was made for you.",
    author: "Priya K.",
    title: "Verified Buyer",
  },
  {
    quote: "I've never received so many compliments on a single outfit. The tailoring is impeccable — it's become my entire wardrobe.",
    author: "Arjun M.",
    title: "Verified Buyer",
  },
  {
    quote: "Finally, a brand that understands minimalism doesn't mean boring. The silhouettes are clean, the materials are exceptional.",
    author: "Maya S.",
    title: "Style Editor, Vogue India",
  },
];

const marqueeText = "FREE SHIPPING OVER ₹2999 — 30 DAY RETURNS — SECURE PAYMENTS — GLOBAL DELIVERY — CURATED WITH INTENT — ";

function Divider() {
  return <div className="h-px bg-neutral-200/60" />;
}

export default async function Home() {
  const { categories, products } = await getData();

  const jsonLd = organizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        {/* Hero */}
        <section className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
            alt=""
            fill
            className="object-cover opacity-70"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/40 via-[#0a0a0a]/20 to-[#0a0a0a]/70" />
          <div className="absolute bottom-0 left-0 right-0 p-8 pb-16 md:pb-24 md:p-16 max-w-7xl mx-auto">
            <div className="max-w-2xl">
              <p className="font-heading text-sm md:text-base tracking-[0.3em] uppercase text-white/60 mb-4">
                Spring Summer 2026
              </p>
              <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-semibold text-white leading-[0.9] tracking-tight">
                Wear the
                <br />
                <span className="italic">moment</span>
              </h1>
              <p className="mt-6 text-base md:text-lg text-white/70 max-w-md leading-relaxed">
                Timeless pieces crafted for those who move through life with intention. Discover your next essential.
              </p>
              <Link
                href="/shop"
                className="inline-block mt-8 px-10 py-4 bg-white text-neutral-900 text-sm font-medium tracking-widest uppercase transition-all duration-300 hover:bg-neutral-900 hover:text-white hover:ring-1 hover:ring-white/20"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </section>

        {/* Marquee Strip */}
        <div className="w-full overflow-hidden bg-[#0a0a0a] border-y border-white/5 py-3">
          <div className="marquee-track flex gap-0 whitespace-nowrap">
            <span className="text-xs tracking-[0.3em] uppercase text-white/40 mx-4 shrink-0">
              {marqueeText}
            </span>
            <span className="text-xs tracking-[0.3em] uppercase text-white/40 mx-4 shrink-0">
              {marqueeText}
            </span>
          </div>
        </div>

        {/* Shop by Category */}
        {categories.length > 0 && (
          <>
            <Divider />
            <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12 md:mb-16">
                <div>
                  <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-3">
                    Curated by
                  </p>
                  <h2 className="font-heading text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
                    Shop by Category
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:inline-block text-sm font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 transition-all duration-300 hover:text-neutral-500 hover:border-neutral-500"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {categories.map((cat: any) => (
                  <Link
                    key={cat.slug}
                    href={`/shop?category=${cat.slug}`}
                    className="group relative aspect-[3/4] overflow-hidden bg-neutral-100"
                  >
                    {cat.image_url ? (
                      <Image
                        src={cat.image_url}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-200" />
                    )}
                    <div className="absolute inset-0 bg-black/20 transition-colors duration-300 group-hover:bg-black/30" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                      <h3 className="font-heading text-lg md:text-xl font-semibold text-white">
                        {cat.name}
                      </h3>
                      <span className="inline-block text-xs text-white/60 mt-1 uppercase tracking-wider border-b border-transparent transition-all duration-300 group-hover:border-white/60">
                        Explore &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}

        {/* Featured Products */}
        {products.length > 0 && (
          <>
            <Divider />
            <section className="px-6 py-24 md:py-32 bg-neutral-50">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-12 md:mb-16">
                  <div>
                    <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-3">
                      Fresh
                    </p>
                    <h2 className="font-heading text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
                      Featured Products
                    </h2>
                  </div>
                  <Link
                    href="/shop"
                    className="hidden md:inline-block text-sm font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 transition-all duration-300 hover:text-neutral-500 hover:border-neutral-500"
                  >
                    View All
                  </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map((p: any) => (
                    <Link key={p.id} href={`/products/${p.slug}`} className="group">
                      <div className="aspect-[3/4] bg-neutral-200 overflow-hidden relative mb-3 shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
                        {p.image ? (
                          <Image
                            src={p.image}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                            {p.name[0]}
                          </div>
                        )}
                      </div>
                      <h3 className="font-body text-sm font-medium text-neutral-900">
                        {p.name}
                      </h3>
                      <p className="font-body text-sm text-neutral-500 mt-0.5">
                        {p.compare_at_price && (
                          <span className="line-through text-neutral-300 mr-2">
                            ₹{Number(p.compare_at_price).toLocaleString("en-IN")}
                          </span>
                        )}
                        ₹{Number(p.base_price).toLocaleString("en-IN")}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* Brand Story */}
        <Divider />
        <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden order-2 md:order-1 shadow-sm transition-shadow duration-300 hover:shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
                alt="Artisanal craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-4">
                Our Story
              </p>
              <h2 className="font-heading text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight leading-[1.1]">
                Made for the
                <br />
                <span className="italic">unexpected</span>
              </h2>
              <div className="mt-8 space-y-4 text-neutral-600 text-base leading-relaxed">
                <p>
                  Every piece in our collection is born from the intersection of timeless tailoring and
                  contemporary vision. We work with artisans who treat fabric as a medium — cutting,
                  draping, and finishing each garment with a precision that mass production cannot replicate.
                </p>
                <p>
                  We believe clothing should never shout. It should whisper — of quality, of intention,
                  of a life lived fully. This is fashion for those who dress for themselves.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-block mt-8 text-sm font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 transition-all duration-300 hover:text-neutral-500 hover:border-neutral-500"
              >
                Discover the Collection
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Lookbook */}
        <Divider />
        <section className="px-6 py-24 md:py-32 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <p className="font-heading text-xs tracking-[0.25em] uppercase text-white/40 mb-12 md:mb-16 text-center">
              Editorial
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="md:col-span-2 relative aspect-[4/5] md:aspect-auto md:row-span-2 overflow-hidden bg-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=900&q=85"
                  alt=""
                  fill
                  className="object-cover transition-transform duration-[400ms] ease-out hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85"
                  alt=""
                  fill
                  className="object-cover transition-transform duration-[400ms] ease-out hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              </div>
              <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                <Image
                  src="https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&q=85"
                  alt=""
                  fill
                  className="object-cover transition-transform duration-[400ms] ease-out hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 30vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <Divider />
        <section className="px-6 py-24 md:py-28 max-w-7xl mx-auto">
          <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-12 md:mb-16 text-center">
            What People Say
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {testimonials.map((t) => (
              <div key={t.author} className="text-center">
                <svg className="mx-auto mb-6 h-6 w-6 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-neutral-600 text-sm leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="mt-6">
                  <p className="text-sm font-medium text-neutral-900">{t.author}</p>
                  <p className="text-xs text-neutral-400 mt-0.5">{t.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer spacing — newsletter lives in Footer only */}
      </main>
    </>
  );
}
