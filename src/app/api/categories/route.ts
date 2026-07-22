import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminClient();
  const { data: categories } = await (supabase.from("categories") as any)
    .select("id, name, slug")
    .order("name");
  return NextResponse.json({ categories: categories || [] });
}
