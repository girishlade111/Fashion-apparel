import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

const CART_COOKIE = "cart_token";
const CART_MAX_AGE = 30 * 24 * 60 * 60;
type DB = ReturnType<typeof createAdminClient>;

function getToken(cookieValue: string | undefined): string {
  return cookieValue || crypto.randomUUID();
}

function setCookie(response: NextResponse, token: string) {
  response.cookies.set(CART_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: CART_MAX_AGE,
    path: "/",
  });
}

async function getOrCreateSession(supabase: DB, token: string) {
  const { data: rows }: any = await supabase
    .from("cart_sessions")
    .select("*")
    .eq("cookie_token", token);

  const existing = rows?.[0] as { id: string; last_active_at: string } | undefined;

  if (existing) {
    if (Date.now() - new Date(existing.last_active_at).getTime() > 60_000) {
      await (supabase.from("cart_sessions") as any)
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", existing.id);
    }
    return existing.id;
  }

  const { data: created }: any = await supabase
    .from("cart_sessions")
    .insert({ cookie_token: token })
    .select("id")
    .single();

  if (!created) throw new Error("Failed to create cart session");
  return created.id;
}

async function getVariantsMap(supabase: ReturnType<typeof createAdminClient>) {
  const { data }: any = await supabase
    .from("product_variants")
    .select("*, product:products(*, product_images(*))");

  const map = new Map<string, any>();
  for (const v of data || []) {
    map.set(v.id, v);
  }
  return map;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(CART_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 });
    }

    const supabase = createAdminClient();
    const sessionId = await getOrCreateSession(supabase, token);

    const { data: items }: any = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_session_id", sessionId);

    if (!items || items.length === 0) {
      return NextResponse.json({ items: [], subtotal: 0, itemCount: 0 });
    }

    const variantsMap = await getVariantsMap(supabase);

    let subtotal = 0;
    const enriched = items
      .map((item: any) => {
        const variant = variantsMap.get(item.product_variant_id);
        if (!variant) return null;

        const price = variant.price_override ?? variant.product?.base_price ?? 0;
        const lineTotal = price * item.quantity;
        subtotal += lineTotal;

        const images = variant.product?.product_images || [];
        const sorted = [...images].sort((a: any, b: any) => a.sort_order - b.sort_order);

        return {
          id: item.id,
          variant_id: item.product_variant_id,
          quantity: item.quantity,
          product: {
            id: variant.product?.id,
            name: variant.product?.name,
            slug: variant.product?.slug,
          },
          variant: {
            id: variant.id,
            size: variant.size,
            color: variant.color,
            sku: variant.sku,
            price,
            inStock: variant.stock_quantity > 0,
          },
          image: sorted[0]
            ? { url: sorted[0].url, alt_text: sorted[0].alt_text }
            : null,
          line_total: lineTotal,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      items: enriched,
      subtotal: Math.round(subtotal * 100) / 100,
      itemCount: enriched.reduce((sum: number, item: any) => sum + item.quantity, 0),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variant_id, quantity = 1 } = body;

    if (!variant_id) {
      return NextResponse.json({ error: "variant_id is required" }, { status: 400 });
    }

    const qty = Math.max(1, Math.floor(quantity));
    const supabase = createAdminClient();

    const { data: variant }: any = await supabase
      .from("product_variants")
      .select("stock_quantity, price_override, product:products!inner(status)")
      .eq("id", variant_id)
      .single();

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (variant.product?.status !== "active") {
      return NextResponse.json({ error: "Product is not available" }, { status: 400 });
    }

    if (variant.stock_quantity < qty) {
      return NextResponse.json(
        {
          error: `Only ${variant.stock_quantity} unit${variant.stock_quantity === 1 ? "" : "s"} available`,
          availableStock: variant.stock_quantity,
        },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const existingToken = cookieStore.get(CART_COOKIE)?.value;
    const token = getToken(existingToken);
    const sessionId = await getOrCreateSession(supabase, token);

    const { data: existing }: any = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_session_id", sessionId)
      .eq("product_variant_id", variant_id);

    const existingItem = existing?.[0];

    let result: any;

    if (existingItem) {
      const newQty = existingItem.quantity + qty;
      if (newQty > variant.stock_quantity) {
        return NextResponse.json(
          {
            error: `Cannot add ${qty} more — only ${variant.stock_quantity - existingItem.quantity} additional unit${variant.stock_quantity - existingItem.quantity === 1 ? "" : "s"} available`,
            availableStock: variant.stock_quantity,
            currentQuantity: existingItem.quantity,
          },
          { status: 400 },
        );
      }

      const { data: updated }: any = await supabase
        .from("cart_items")
        .update({ quantity: newQty })
        .eq("id", existingItem.id)
        .select("id, quantity")
        .single();
      result = updated;
    } else {
      const { data: created }: any = await supabase
        .from("cart_items")
        .insert({
          cart_session_id: sessionId,
          product_variant_id: variant_id,
          quantity: qty,
        })
        .select("id, quantity")
        .single();
      result = created;
    }

    const response = NextResponse.json(
      { id: result?.id, quantity: result?.quantity },
      { status: existingItem ? 200 : 201 },
    );

    if (!existingToken) {
      setCookie(response, token);
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Failed to add item to cart" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_id, quantity } = body;

    if (!item_id) {
      return NextResponse.json({ error: "item_id is required" }, { status: 400 });
    }

    const qty = Math.max(1, Math.floor(quantity));
    const supabase = createAdminClient();

    const { data: rows }: any = await supabase
      .from("cart_items")
      .select("id, product_variant_id")
      .eq("id", item_id);

    const item = rows?.[0] as { id: string; product_variant_id: string } | undefined;

    if (!item) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    const { data: variant }: any = await supabase
      .from("product_variants")
      .select("stock_quantity")
      .eq("id", item.product_variant_id)
      .single();

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    if (qty > variant.stock_quantity) {
      return NextResponse.json(
        {
          error: `Only ${variant.stock_quantity} unit${variant.stock_quantity === 1 ? "" : "s"} available`,
          availableStock: variant.stock_quantity,
        },
        { status: 400 },
      );
    }

    const { data: updated }: any = await supabase
      .from("cart_items")
      .update({ quantity: qty })
      .eq("id", item_id)
      .select("id, quantity")
      .single();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("item_id");

    const supabase = createAdminClient();
    const cookieStore = await cookies();
    const token = cookieStore.get(CART_COOKIE)?.value;

    if (!token) {
      return NextResponse.json({ message: "Cart is empty" });
    }

    const { data: rows }: any = await supabase
      .from("cart_sessions")
      .select("id")
      .eq("cookie_token", token);

    const session = rows?.[0] as { id: string } | undefined;

    if (!session) {
      return NextResponse.json({ message: "Cart is empty" });
    }

    if (itemId) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId)
        .eq("cart_session_id", session.id);

      if (error) {
        return NextResponse.json({ error: "Failed to remove item" }, { status: 500 });
      }

      return NextResponse.json({ message: "Item removed" });
    }

    await supabase.from("cart_items").delete().eq("cart_session_id", session.id);

    return NextResponse.json({ message: "Cart cleared" });
  } catch {
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}
