import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "50", 10) || 50));
  const offset = (page - 1) * limit;
  const status = sp.get("status");

  const supabase = createAdminClient();

  let countQuery = (supabase.from("products") as any).select("id", { count: "exact", head: true });
  let listQuery = (supabase.from("products") as any)
    .select("id, name, slug, base_price, compare_at_price, status, created_at, category_id")
    .order("created_at", { ascending: false });

  if (status) {
    countQuery = countQuery.eq("status", status);
    listQuery = listQuery.eq("status", status);
  }

  const { count: total } = await countQuery;

  const { data: products } = await listQuery.range(offset, offset + limit - 1);

  return NextResponse.json({
    products: products || [],
    pagination: { page, limit, total: total ?? 0, totalPages: Math.ceil((total ?? 0) / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, category_id, base_price, compare_at_price, description, images, variants, slug: customSlug } = body;

  const errors: Record<string, string> = {};
  if (!name || typeof name !== "string" || name.trim().length === 0)
    errors.name = "Name is required";
  if (!category_id) errors.category_id = "Category is required";
  if (base_price == null || Number(base_price) < 0)
    errors.base_price = "Base price must be >= 0";

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", fields: errors }, { status: 400 });
  }

  const supabase = createAdminClient();

  const slug = customSlug || slugify(name);

  const slugResult = await (supabase.from("products") as any)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (slugResult.data) {
    return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
  }

  const { data: product, error } = await (supabase.from("products") as any)
    .insert({
      name: name.trim(),
      slug,
      description: description || null,
      category_id,
      base_price: Number(base_price),
      compare_at_price: compare_at_price != null ? Number(compare_at_price) : null,
      status: "draft",
    })
    .select("id, name, slug, status")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }

  if (images && Array.isArray(images) && images.length > 0) {
    const imageRows = images.map((img: any, i: number) => ({
      product_id: product.id,
      url: img.url,
      alt_text: img.alt_text || null,
      sort_order: img.sort_order ?? i,
    }));
    await (supabase.from("product_images") as any).insert(imageRows);
  }

  if (variants && Array.isArray(variants) && variants.length > 0) {
    const variantRows = variants.map((v: any) => ({
      product_id: product.id,
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock_quantity: v.stock_quantity ?? 0,
      price_override: v.price_override != null ? Number(v.price_override) : null,
    }));
    await (supabase.from("product_variants") as any).insert(variantRows);
  }

  return NextResponse.json({ product }, { status: 201 });
}
