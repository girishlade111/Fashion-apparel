import { createAdminClient } from "@/lib/supabase/server";
import ShopContent from "@/components/storefront/ShopContent";

async function getFilterMeta() {
  const supabase = createAdminClient();

  const [{ data: categories }, { data: variants }] = await Promise.all([
    (supabase.from("categories") as any).select("name, slug").order("name"),
    (supabase.from("product_variants") as any)
      .select("size, color, stock_quantity")
      .not("stock_quantity", "eq", null),
  ]);

  const sizes = [...new Set((variants || []).map((v: any) => v.size).filter(Boolean))] as string[];
  const colors = [...new Set((variants || []).map((v: any) => v.color).filter(Boolean))] as string[];

  return {
    categories: categories || [],
    sizes,
    colors,
    minPrice: 0,
    maxPrice: 50000,
  };
}

async function getInitialProducts(searchParams: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", String(searchParams.category));
  if (searchParams.minPrice) params.set("minPrice", String(searchParams.minPrice));
  if (searchParams.maxPrice) params.set("maxPrice", String(searchParams.maxPrice));
  if (searchParams.size) params.set("size", String(searchParams.size));
  if (searchParams.color) params.set("color", String(searchParams.color));
  if (searchParams.sort) params.set("sort", String(searchParams.sort));
  params.set("limit", "24");

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) return { products: [], totalCount: 0, totalPages: 0, page: 1 };
  return res.json();
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [filterMeta, initial] = await Promise.all([
    getFilterMeta(),
    getInitialProducts(searchParams),
  ]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <h1 className="font-heading text-3xl text-neutral-900 mb-8">Shop</h1>
      <ShopContent initial={initial} filterMeta={filterMeta} />
    </div>
  );
}
