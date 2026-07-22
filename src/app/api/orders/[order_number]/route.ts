import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ order_number: string }> },
) {
  try {
    const { order_number } = await params;
    const supabase = createAdminClient();

    const { data: order } = await (supabase.from("orders") as any)
      .select("*, order_items(*)")
      .eq("order_number", order_number)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
