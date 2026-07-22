import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const supabase = createAdminClient();

    const { data: raw, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("status", "active")
      .single();

    if (error || !raw) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 },
      );
    }

    const product: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      base_price: number;
      compare_at_price: number | null;
      category_id: string;
      created_at: string;
    } = raw;

    const { data: category } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("id", product.category_id)
      .single();

    const [imagesResult, variantsResult, reviewsResult, relatedResult] =
      await Promise.all([
        supabase
          .from("product_images")
          .select("*")
          .eq("product_id", product.id)
          .order("sort_order", { ascending: true }),

        supabase
          .from("product_variants")
          .select("*")
          .eq("product_id", product.id)
          .order("size", { ascending: true }),

        supabase
          .from("reviews")
          .select("*")
          .eq("product_id", product.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false }),

        supabase
          .from("products")
          .select("*")
          .eq("category_id", product.category_id)
          .eq("status", "active")
          .neq("id", product.id)
          .limit(4)
          .order("created_at", { ascending: false }),
      ]);

    const variants = (variantsResult.data || []).map((v: any) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock_quantity: v.stock_quantity,
      price_override: v.price_override,
      inStock: v.stock_quantity > 0,
    }));

    const reviews = reviewsResult.data || [];
    const avgRating =
      reviews.length > 0
        ? Math.round(
            (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length) *
              10,
          ) / 10
        : null;

    const relatedProducts = (relatedResult.data || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      base_price: p.base_price,
      compare_at_price: p.compare_at_price,
    }));

    return NextResponse.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      base_price: product.base_price,
      compare_at_price: product.compare_at_price,
      category: category,
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
      related_products: relatedProducts,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
}
