import { createAdminClient } from "@/lib/supabase/server";
import { getRelated } from "@/lib/products/getRelated";
import ProductDetail from "@/components/storefront/ProductDetail";
import { notFound } from "next/navigation";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

type Params = Promise<{ slug: string }>;

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: raw, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !raw) notFound();

  const product = raw as {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    base_price: number;
    compare_at_price: number | null;
    category_id: string;
    created_at: string;
  };

  const { data: category } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("id", product.category_id)
    .single();

  const relatedPromise = getRelated({ productId: product.id, limit: 4 });

  const [imagesResult, variantsResult, reviewsResult, relatedResult] = await Promise.all([
    supabase.from("product_images").select("*").eq("product_id", product.id).order("sort_order", { ascending: true }),
    supabase.from("product_variants").select("*").eq("product_id", product.id).order("size", { ascending: true }),
    supabase.from("reviews").select("*").eq("product_id", product.id).eq("status", "approved").order("created_at", { ascending: false }),
    relatedPromise,
  ]);

  const variants = (variantsResult.data || []).map((v: any) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    sku: v.sku,
    stock_quantity: v.stock_quantity,
    price_override: v.price_override,
    inStock: (v.stock_quantity || 0) > 0,
  }));

  const reviews = reviewsResult.data || [];
  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length) * 10) / 10
    : null;

  const data = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    base_price: product.base_price,
    compare_at_price: product.compare_at_price,
    category: category || null,
    images: imagesResult.data || [],
    variants,
    inStock: variants.some((v: any) => v.inStock),
    reviews: {
      items: reviews.map((r: any) => ({
        id: r.id,
        reviewer_name: r.reviewer_name,
        rating: r.rating,
        title: r.title,
        body: r.body,
        created_at: r.created_at,
      })),
      average_rating: avgRating,
      count: reviews.length,
    },
    related_products: (relatedResult || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      base_price: p.base_price,
      compare_at_price: p.compare_at_price,
      primary_image: p.primary_image,
    })),
  };

  return <ProductDetail product={data} />;
}
