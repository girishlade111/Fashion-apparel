import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { getServerEnvVar } from "@/lib/env";

const FREE_SHIPPING_THRESHOLD = 500;
const FLAT_SHIPPING_FEE = 99;

async function validateDiscount(supabase: ReturnType<typeof createAdminClient>, code: string, subtotal: number) {
  const { data: discount } = await (supabase.from("discount_codes") as any)
    .select("*")
    .ilike("code", code)
    .single();

  if (!discount || !discount.active) return null;
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) return null;
  if (discount.min_order_value != null && subtotal < Number(discount.min_order_value)) return null;
  if (discount.usage_limit != null && discount.times_used >= discount.usage_limit) return null;

  const val = Number(discount.value);
  const amount = discount.discount_type === "percentage"
    ? Math.round((subtotal * val) / 100 * 100) / 100
    : Math.min(val, subtotal);

  return { id: discount.id, code: discount.code, amount };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, customer_email, customer_phone, shipping_address, discount_code } = body;

    if (!customer_name || !customer_email || !shipping_address) {
      return NextResponse.json(
        { error: "customer_name, customer_email, and shipping_address are required" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("cart_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: session } = await (supabase.from("cart_sessions") as any)
      .select("id")
      .eq("cookie_token", token)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const { data: cartItems } = await (supabase.from("cart_items") as any)
      .select("id, product_variant_id, quantity")
      .eq("cart_session_id", session.id);

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const variantIds = cartItems.map((i: any) => i.product_variant_id);

    const variantsResult = await (supabase.from("product_variants") as any)
      .select("*, product:products!inner(id, name, slug, base_price, status)")
      .in("id", variantIds);
    const variants: any[] = variantsResult.data || [];

    if (variants.length === 0) {
      return NextResponse.json({ error: "Cart items not found" }, { status: 400 });
    }

    const variantsMap = new Map(variants.map((v: any) => [v.id, v]));

    const lineItems: Array<{
      variant: any;
      quantity: number;
      unitPrice: number;
      total: number;
    }> = [];
    const errors: string[] = [];

    for (const item of cartItems) {
      const variant = variantsMap.get(item.product_variant_id);
      if (!variant) {
        errors.push("A cart item no longer exists");
        continue;
      }

      if (variant.product?.status !== "active") {
        errors.push(`"${variant.product?.name}" is no longer available`);
        continue;
      }

      if (variant.stock_quantity < item.quantity) {
        errors.push(
          `"${variant.product?.name}" (${variant.size}, ${variant.color}) has only ${variant.stock_quantity} unit${variant.stock_quantity === 1 ? "" : "s"} in stock`,
        );
        continue;
      }

      const unitPrice = variant.price_override ?? variant.product.base_price;
      lineItems.push({
        variant,
        quantity: item.quantity,
        unitPrice,
        total: unitPrice * item.quantity,
      });
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 409 });
    }

    let subtotal = Math.round(lineItems.reduce((s, i) => s + i.total, 0) * 100) / 100;

    let discountAmount = 0;
    let discountId: string | null = null;
    if (discount_code) {
      const discount = await validateDiscount(supabase, discount_code, subtotal);
      if (discount) {
        discountAmount = discount.amount;
        discountId = discount.id;
      }
    }

    const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
    const total = Math.round((subtotal - discountAmount + shippingFee) * 100) / 100;

    const { data: order } = await (supabase.from("orders") as any)
      .insert({
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        shipping_address,
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total,
        status: "pending",
      })
      .select("id, order_number, total")
      .single();

    if (!order) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItemsData = lineItems.map((item) => ({
      order_id: order.id,
      product_variant_id: item.variant.id,
      product_name_snapshot: item.variant.product.name,
      variant_label_snapshot: `${item.variant.size}, ${item.variant.color}`,
      unit_price_snapshot: item.unitPrice,
      quantity: item.quantity,
    }));

    const { error: insertError } = await (supabase.from("order_items") as any)
      .insert(orderItemsData);

    if (insertError) {
      // Order created but items failed — mark order as failed
      await (supabase.from("orders") as any)
        .update({ status: "failed" })
        .eq("id", order.id);

      return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
    }

    const razorpayKeyId = getServerEnvVar("RAZORPAY_KEY_ID");
    const razorpayKeySecret = getServerEnvVar("RAZORPAY_KEY_SECRET");
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString("base64");

    let razorpayOrder: any;
    try {
      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "INR",
          receipt: order.order_number,
          partial_payment: false,
        }),
      });

      razorpayOrder = await res.json();

      if (!res.ok) {
        throw new Error(razorpayOrder.error?.description || "Razorpay request failed");
      }
    } catch (err: any) {
      await (supabase.from("orders") as any)
        .update({ status: "failed" })
        .eq("id", order.id);

      return NextResponse.json(
        { error: `Payment initiation failed: ${err.message}` },
        { status: 502 },
      );
    }

    await (supabase.from("orders") as any)
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq("id", order.id);

    if (discountId) {
      const { data: dc } = await (supabase.from("discount_codes") as any)
        .select("times_used")
        .eq("id", discountId)
        .single();
      if (dc) {
        await (supabase.from("discount_codes") as any)
          .update({ times_used: dc.times_used + 1 })
          .eq("id", discountId);
      }
    }

    await (supabase.from("cart_items") as any)
      .delete()
      .eq("cart_session_id", session.id);

    return NextResponse.json({
      order_id: order.id,
      order_number: order.order_number,
      razorpay_order_id: razorpayOrder.id,
      razorpay_key_id: razorpayKeyId,
      amount: Math.round(total * 100),
      currency: "INR",
    });
  } catch {
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
