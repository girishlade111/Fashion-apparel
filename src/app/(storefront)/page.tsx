import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

async function getData() {
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
}

export default async function Home() {
  const { categories, products } = await getData();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
        <div className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <Link href="/" className="font-heading text-lg tracking-wide text-white">
            Fashion Apparel
          </Link>
          <nav className="flex gap-8 text-sm font-medium text-white/80">
            <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
            <Link href="/blog" className="hover:text-white transition-colors">Journal</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative h-screen w-full overflow-hidden bg-black">
          <Image
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80"
            alt=""
            fill
            className="object-cover opacity-70"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
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
                className="inline-block mt-8 px-10 py-4 bg-white text-black text-sm font-medium tracking-widest uppercase hover:bg-white/90 transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </section>

        {categories.length > 0 && (
          <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12 md:mb-16">
              <div>
                <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-3">Curated by</p>
                <h2 className="font-heading text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
                  Shop by Category
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden md:inline-block text-sm font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-60 transition-opacity"
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
                  {cat.image_url && (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                    <h3 className="font-heading text-lg md:text-xl font-semibold text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-white/60 mt-1 uppercase tracking-wider">Explore &rarr;</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {products.length > 0 && (
          <section className="px-6 py-24 md:py-32 bg-neutral-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-end justify-between mb-12 md:mb-16">
                <div>
                  <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-3">Fresh</p>
                  <h2 className="font-heading text-3xl md:text-5xl font-semibold text-neutral-900 tracking-tight">
                    New Arrivals
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden md:inline-block text-sm font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-60 transition-opacity"
                >
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((p: any) => (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group">
                    <div className="aspect-[3/4] bg-neutral-200 overflow-hidden relative mb-3">
                      {p.image ? (
                        <Image
                          src={p.image}
                          alt={p.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-neutral-400 text-sm">
                          {p.name[0]}
                        </div>
                      )}
                    </div>
                    <h3 className="font-body text-sm font-medium text-neutral-900">{p.name}</h3>
                    <p className="font-body text-sm text-neutral-500 mt-0.5">
                      {p.compare_at_price && (
                        <span className="line-through text-neutral-300 mr-2">₹{Number(p.compare_at_price).toLocaleString("en-IN")}</span>
                      )}
                      ₹{Number(p.base_price).toLocaleString("en-IN")}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-6 py-24 md:py-32 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden order-2 md:order-1">
              <Image
                src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
                alt="Artisanal craftsmanship"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
            <div className="order-1 md:order-2">
              <p className="font-heading text-xs tracking-[0.25em] uppercase text-neutral-400 mb-4">Our Story</p>
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
                className="inline-block mt-8 text-sm font-medium text-neutral-900 border-b border-neutral-900 pb-0.5 hover:opacity-60 transition-opacity"
              >
                Discover the Collection
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-neutral-900 text-white">
          <div className="px-6 py-24 md:py-32 max-w-2xl mx-auto text-center">
            <p className="font-heading text-xs tracking-[0.25em] uppercase text-white/40 mb-4">Stay in Touch</p>
            <h2 className="font-heading text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1]">
              Join the <span className="italic">edit</span>
            </h2>
            <p className="mt-4 text-white/60 text-sm md:text-base leading-relaxed">
              Be the first to know about new arrivals, exclusive previews, and stories from our atelier.
            </p>
            <form
              action="/api/newsletter"
              method="POST"
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-white/50 transition-colors"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-white text-neutral-900 text-sm font-medium tracking-wider uppercase hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-4 text-xs text-white/30">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </section>
      </main>

      <footer className="bg-neutral-950 text-white/40 text-sm">
        <div className="px-6 py-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-heading text-white/60 text-base tracking-wide">Fashion Apparel</p>
          <p>&copy; {new Date().getFullYear()} Fashion Apparel. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
