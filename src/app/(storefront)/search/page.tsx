import { createAdminClient } from "@/lib/supabase/server";
import ProductCard from "@/components/storefront/ProductCard";

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  primary_image: { url: string; alt_text: string | null } | null;
  price_range: { min: number; max: number };
  in_stock: boolean;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q || "").trim();
  let products: Product[] = [];

  if (query.length >= 2) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/products?search=${encodeURIComponent(query)}&limit=60&sort=newest`,
      { cache: "no-store" },
    );
    if (res.ok) {
      const data = await res.json();
      products = data.products || [];
    }
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl text-neutral-900 mb-2">
          {query ? `Results for "${query}"` : "Search"}
        </h1>
        <p className="text-sm text-neutral-500">
          {products.length > 0
            ? `${products.length} product${products.length !== 1 ? "s" : ""} found`
            : query.length >= 2
              ? "No products found."
              : query.length === 0
                ? "Enter a search term to find products."
                : "Enter at least 2 characters to search."}
        </p>
      </div>

      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((p: Product) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
