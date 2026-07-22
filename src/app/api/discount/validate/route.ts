import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (subtotal == null || typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json({ error: "Valid subtotal is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: discount } = await (supabase.from("discount_codes") as any)
      .select("*")
      .ilike("code", code)
      .single();

    if (!discount) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    if (!discount.active) {
      return NextResponse.json({ error: "Code not found" }, { status: 404 });
    }

    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    if (
      discount.min_order_value != null &&
      subtotal < Number(discount.min_order_value)
    ) {
      return NextResponse.json({ error: "Minimum order value not met" }, { status: 400 });
    }

    if (
      discount.usage_limit != null &&
      discount.times_used >= discount.usage_limit
    ) {
      return NextResponse.json({ error: "Code usage limit reached" }, { status: 400 });
    }

    const val = Number(discount.value);

    let discountAmount: number;
    if (discount.discount_type === "percentage") {
      discountAmount = Math.round((subtotal * val) / 100 * 100) / 100;
    } else {
      discountAmount = Math.min(val, subtotal);
    }

    return NextResponse.json({
      valid: true,
      code: discount.code,
      discount_type: discount.discount_type,
      value: val,
      discount_amount: discountAmount,
    });
  } catch {
    return NextResponse.json({ error: "Failed to validate code" }, { status: 500 });
  }
}
