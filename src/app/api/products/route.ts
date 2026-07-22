import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;

    const category = sp.get("category");
    const minPrice = sp.get("minPrice");
    const maxPrice = sp.get("maxPrice");
    const size = sp.get("size");
    const color = sp.get("color");
    const search = sp.get("search");
    const sort = sp.get("sort") || "newest";
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const limit = Math.min(60, Math.max(1, parseInt(sp.get("limit") || "24", 10) || 24));

    const supabase = createAdminClient();

    const { data: products, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        description,
        base_price,
        compare_at_price,
        status,
        created_at,
        category:categories(name, slug),
        product_images(url, alt_text, sort_order),
        product_variants(price_override, size, color, stock_quantity)
      `,
      )
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }

    let result = (products || []).map((p: any) => {
      const prices = p.product_variants?.length
        ? p.product_variants.map((v: any) => v.price_override ?? p.base_price)
        : [p.base_price];
      const sortedImages = [...(p.product_images || [])].sort(
        (a: any, b: any) => a.sort_order - b.sort_order,
      );
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        base_price: p.base_price,
        compare_at_price: p.compare_at_price,
        category: p.category,
        primary_image: sortedImages[0] || null,
        price_range: {
          min: Math.min(...prices),
          max: Math.max(...prices),
        },
        created_at: p.created_at,
      };
    });

    if (category) {
      result = result.filter(
        (p: any) => p.category?.slug === category,
      );
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p: any) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }

    if (size) {
      result = result.filter((p: any) =>
        (products as any[])
          .find((x: any) => x.id === p.id)
          ?.product_variants?.some((v: any) => v.size === size),
      );
    }

    if (color) {
      result = result.filter((p: any) =>
        (products as any[])
          .find((x: any) => x.id === p.id)
          ?.product_variants?.some((v: any) => v.color.toLowerCase() === color.toLowerCase()),
      );
    }

    if (minPrice) {
      result = result.filter((p: any) => p.price_range.max >= Number(minPrice));
    }
    if (maxPrice) {
      result = result.filter((p: any) => p.price_range.min <= Number(maxPrice));
    }

    switch (sort) {
      case "price_asc":
        result.sort((a: any, b: any) => a.price_range.min - b.price_range.min);
        break;
      case "price_desc":
        result.sort((a: any, b: any) => b.price_range.min - a.price_range.min);
        break;
      case "newest":
      default:
        result.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    const totalCount = result.length;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;
    const paginated = result.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginated,
      totalCount,
      totalPages,
      page,
      limit,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
