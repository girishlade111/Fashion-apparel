import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10) || 20));
  const offset = (page - 1) * limit;
  const status = sp.get("status");
  const dateFrom = sp.get("dateFrom");
  const dateTo = sp.get("dateTo");

  const supabase = createAdminClient();

  let countQuery = (supabase.from("orders") as any).select("id", { count: "exact", head: true });
  let listQuery = (supabase.from("orders") as any)
    .select("id, order_number, customer_name, customer_email, total, status, created_at")
    .order("created_at", { ascending: false });

  if (status) {
    countQuery = countQuery.eq("status", status);
    listQuery = listQuery.eq("status", status);
  }
  if (dateFrom) {
    countQuery = countQuery.gte("created_at", dateFrom);
    listQuery = listQuery.gte("created_at", dateFrom);
  }
  if (dateTo) {
    countQuery = countQuery.lte("created_at", dateTo);
    listQuery = listQuery.lte("created_at", dateTo);
  }

  const { count: total } = await countQuery;

  const { data: orders } = await listQuery.range(offset, offset + limit - 1);

  return NextResponse.json({
    orders: orders || [],
    pagination: {
      page,
      limit,
      total: total ?? 0,
      totalPages: Math.ceil((total ?? 0) / limit),
    },
  });
}
