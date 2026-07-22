import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "failed", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  failed: ["pending"],
  cancelled: [],
};

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

  const { data: order } = await (supabase.from("orders") as any)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: items } = await (supabase.from("order_items") as any)
    .select("*")
    .eq("order_id", id);

  return NextResponse.json({ order: { ...order, items: items || [] } });
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

  const existing = await (supabase.from("orders") as any)
    .select("id, status, customer_email, customer_name")
    .eq("id", id)
    .maybeSingle();

  if (!existing.data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { status: newStatus } = body;

  if (!newStatus) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const currentStatus = existing.data.status;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];

  if (!allowed || !allowed.includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Cannot transition from '${currentStatus}' to '${newStatus}'`,
        allowedTransitions: allowed || [],
      },
      { status: 400 },
    );
  }

  await (supabase.from("orders") as any)
    .update({ status: newStatus })
    .eq("id", id);

  // TODO: If newStatus === 'shipped', trigger shipping notification email
  // with tracking info when tracking number is available.

  return NextResponse.json({ status: "ok", previousStatus: currentStatus, newStatus });
}
