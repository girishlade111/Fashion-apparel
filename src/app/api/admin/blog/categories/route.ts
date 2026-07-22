import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: categories } = await (supabase.from("blog_categories") as any)
    .select("id, name, slug")
    .order("name");

  return NextResponse.json({ categories: categories || [] });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name } = body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const slug = name.trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

  const supabase = createAdminClient();
  const { data: cat, error } = await (supabase.from("blog_categories") as any)
    .insert({ name: name.trim(), slug })
    .select("id, name, slug")
    .single();

  if (error) return NextResponse.json({ error: "Failed to create category" }, { status: 500 });

  return NextResponse.json({ category: cat }, { status: 201 });
}
