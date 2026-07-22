import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const category = sp.get("category");
    const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(sp.get("pageSize") || "12", 10) || 12));
    const offset = (page - 1) * pageSize;

    const supabase = createAdminClient();

    let countQuery = (supabase.from("blog_posts") as any)
      .select("id", { count: "exact", head: true })
      .eq("published", true);

    let listQuery = (supabase.from("blog_posts") as any)
      .select("id, title, slug, excerpt, cover_image_url, published_at, blog_category_id")
      .eq("published", true);

    if (category) {
      const catResult = await (supabase.from("blog_categories") as any)
        .select("id")
        .eq("slug", category)
        .maybeSingle();
      const catId = catResult.data?.id || category;
      countQuery = countQuery.eq("blog_category_id", catId);
      listQuery = listQuery.eq("blog_category_id", catId);
    }

    const { count: total } = await countQuery;

    const { data: posts } = await listQuery
      .order("published_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const categoryIds = [...new Set((posts || []).map((p: any) => p.blog_category_id).filter(Boolean))];
    const catMap: Record<string, { name: string; slug: string }> = {};
    if (categoryIds.length > 0) {
      const { data: cats } = await (supabase.from("blog_categories") as any)
        .select("id, name, slug")
        .in("id", categoryIds);
      for (const c of cats || []) {
        catMap[c.id] = c;
      }
    }

    const enriched = (posts || []).map((p: any) => ({
      ...p,
      category: p.blog_category_id ? catMap[p.blog_category_id] || null : null,
    }));

    return NextResponse.json({
      posts: enriched,
      pagination: {
        page,
        pageSize,
        total: total ?? 0,
        totalPages: Math.ceil((total ?? 0) / pageSize),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
