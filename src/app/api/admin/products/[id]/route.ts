import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await (supabase.from("products") as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: images } = await (supabase.from("product_images") as any)
    .select("*")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });

  const { data: variants } = await (supabase.from("product_variants") as any)
    .select("*")
    .eq("product_id", id)
    .order("size", { ascending: true });

  return NextResponse.json({ product: { ...product, images: images || [], variants: variants || [] } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const existing = await (supabase.from("products") as any)
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!existing.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { name, slug, description, category_id, base_price, compare_at_price, status, images, variants } = body;

  const updateFields: Record<string, any> = {};
  if (name !== undefined) updateFields.name = name.trim();
  if (slug !== undefined) updateFields.slug = slug;
  if (description !== undefined) updateFields.description = description;
  if (category_id !== undefined) updateFields.category_id = category_id;
  if (base_price !== undefined) updateFields.base_price = Number(base_price);
  if (compare_at_price !== undefined) updateFields.compare_at_price = compare_at_price != null ? Number(compare_at_price) : null;
  if (status !== undefined) updateFields.status = status;

  if (Object.keys(updateFields).length > 0) {
    const { error } = await (supabase.from("products") as any)
      .update(updateFields)
      .eq("id", id);
    if (error) {
      return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
  }

  if (images !== undefined) {
    await (supabase.from("product_images") as any).delete().eq("product_id", id);
    if (images.length > 0) {
      const imageRows = images.map((img: any, i: number) => ({
        product_id: id,
        url: img.url,
        alt_text: img.alt_text || null,
        sort_order: img.sort_order ?? i,
      }));
      await (supabase.from("product_images") as any).insert(imageRows);
    }
  }

  if (variants !== undefined) {
    await (supabase.from("product_variants") as any).delete().eq("product_id", id);
    if (variants.length > 0) {
      const variantRows = variants.map((v: any) => ({
        product_id: id,
        size: v.size,
        color: v.color,
        sku: v.sku,
        stock_quantity: v.stock_quantity ?? 0,
        price_override: v.price_override != null ? Number(v.price_override) : null,
      }));
      await (supabase.from("product_variants") as any).insert(variantRows);
    }
  }

  return NextResponse.json({ status: "ok" });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const existing = await (supabase.from("products") as any)
    .select("id, status")
    .eq("id", id)
    .maybeSingle();
  if (!existing.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: orderCheck } = await (supabase.from("order_items") as any)
    .select("id")
    .in("product_variant_id", (
      supabase.from("product_variants") as any
    ).select("id").eq("product_id", id))
    .limit(1);

  const hasOrders = (orderCheck || []).length > 0;

  if (hasOrders) {
    await (supabase.from("products") as any)
      .update({ status: "archived" })
      .eq("id", id);
    return NextResponse.json({ status: "archived" });
  }

  await (supabase.from("product_images") as any).delete().eq("product_id", id);
  await (supabase.from("product_variants") as any).delete().eq("product_id", id);
  await (supabase.from("products") as any).delete().eq("id", id);

  return NextResponse.json({ status: "deleted" });
}
