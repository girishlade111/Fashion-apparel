import { createAdminClient } from "@/lib/supabase/server";

export type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  primary_image: { url: string; alt_text: string | null } | null;
  in_stock: boolean;
};

export async function getRelated(
  options: {
    productId?: string;
    categoryIds?: string[];
    excludeIds?: string[];
    limit?: number;
  },
): Promise<RelatedProduct[]> {
  const { productId, categoryIds: explicitCategoryIds, excludeIds = [], limit = 4 } = options;
  const supabase = createAdminClient();

  let categoryIds = explicitCategoryIds || [];

  if (productId && categoryIds.length === 0) {
    const { data: product } = await (supabase
      .from("products")
      .select("category_id")
      .eq("id", productId)
      .single() as any);

    if (product) {
      categoryIds = [product.category_id];
    }
  }

  const allExcludeIds = productId ? [...excludeIds, productId] : excludeIds;

  if (categoryIds.length === 0) {
    return [];
  }

  const { data: related } = await (supabase
    .from("products")
    .select(`
      id, name, slug, base_price, compare_at_price,
      product_images(url, alt_text, sort_order),
      product_variants(stock_quantity)
    `)
    .in("category_id", categoryIds)
    .eq("status", "active")
    .not("id", "in", `(${allExcludeIds.map((id) => `"${id}"`).join(",")})`)
    .order("created_at", { ascending: false }) as any);

  if (!related || (related as any[]).length === 0) {
    return [];
  }

  const withStock = (related as any[]).map((p: any) => {
    const sortedImages = [...(p.product_images || [])].sort(
      (a: any, b: any) => a.sort_order - b.sort_order,
    );
    const totalStock = (p.product_variants || []).reduce(
      (s: number, v: any) => s + (v.stock_quantity || 0), 0,
    );
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      base_price: Number(p.base_price),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      primary_image: sortedImages[0] || null,
      in_stock: totalStock > 0,
    };
  });

  const inStock = withStock.filter((p) => p.in_stock);
  const outOfStock = withStock.filter((p) => !p.in_stock);

  const prioritized = [...inStock, ...outOfStock];

  return prioritized.slice(0, limit);
}
