import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { getServerEnvVar } from "@/lib/env";

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("base64");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get("x-razorpay-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const webhookSecret = getServerEnvVar("RAZORPAY_WEBHOOK_SECRET");
    if (!verifySignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const { event, payload } = body;

    if (!event || !payload) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (event === "payment.captured") {
      const razorpayOrderId = payload.payment?.entity?.order_id;
      const razorpayPaymentId = payload.payment?.entity?.id;

      if (!razorpayOrderId || !razorpayPaymentId) {
        return NextResponse.json({ error: "Missing order or payment id" }, { status: 400 });
      }

      const orderResult = await (supabase.from("orders") as any)
        .select("id, status")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();
      const order = orderResult.data as { id: string; status: string } | null;

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "paid") {
        return NextResponse.json({ status: "ok", info: "already_processed" });
      }

      await (supabase.from("orders") as any)
        .update({
          status: "paid",
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq("id", order.id);

      const itemsResult = await (supabase.from("order_items") as any)
        .select("product_variant_id, quantity")
        .eq("order_id", order.id);
      const orderItems: any[] = itemsResult.data || [];

      for (const item of orderItems) {
        const current = await (supabase.from("product_variants") as any)
          .select("stock_quantity")
          .eq("id", item.product_variant_id)
          .single();
        if (current.data) {
          const newQty = Math.max(0, current.data.stock_quantity - item.quantity);
          if (current.data.stock_quantity - item.quantity < 0) {
            console.warn(
              `Oversell: variant ${item.product_variant_id} had ${current.data.stock_quantity}, ordered ${item.quantity}`,
            );
          }
          await (supabase.from("product_variants") as any)
            .update({ stock_quantity: newQty })
            .eq("id", item.product_variant_id);
        }
      }

      // Email confirmation is triggered in a separate step (Prompt 18)
      try {
        const { sendOrderConfirmation } = await import("@/lib/email");
        await sendOrderConfirmation(order.id).catch((e: any) =>
          console.error("Email send failed (non-fatal):", e),
        );
      } catch {
        // Email module not yet implemented
      }

      return NextResponse.json({ status: "ok" });
    }

    if (event === "payment.failed") {
      const razorpayOrderId = payload.order?.entity?.id || payload.payment?.entity?.order_id;

      if (!razorpayOrderId) {
        return NextResponse.json({ error: "Missing order id" }, { status: 400 });
      }

      const orderResult = await (supabase.from("orders") as any)
        .select("id, status")
        .eq("razorpay_order_id", razorpayOrderId)
        .single();
      const order = orderResult.data as { id: string; status: string } | null;

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      if (order.status === "failed") {
        return NextResponse.json({ status: "ok", info: "already_processed" });
      }

      await (supabase.from("orders") as any)
        .update({ status: "failed" })
        .eq("id", order.id);

      return NextResponse.json({ status: "ok" });
    }

    return NextResponse.json({ status: "ignored", event });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
