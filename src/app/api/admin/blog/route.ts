import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "20", 10) || 20));
  const offset = (page - 1) * limit;
  const categoryId = sp.get("categoryId");

  const supabase = createAdminClient();

  let countQuery = (supabase.from("blog_posts") as any).select("id", { count: "exact", head: true });
  let listQuery = (supabase.from("blog_posts") as any)
    .select("id, title, slug, excerpt, cover_image_url, published, published_at, created_at, updated_at, blog_category_id")
    .order("created_at", { ascending: false });

  if (categoryId) {
    countQuery = countQuery.eq("blog_category_id", categoryId);
    listQuery = listQuery.eq("blog_category_id", categoryId);
  }

  const { count: total } = await countQuery;
  const { data: posts } = await listQuery.range(offset, offset + limit - 1);

  const categoryIds = [...new Set((posts || []).map((p: any) => p.blog_category_id).filter(Boolean))];
  const catMap: Record<string, { name: string; slug: string }> = {};
  if (categoryIds.length > 0) {
    const { data: cats } = await (supabase.from("blog_categories") as any)
      .select("id, name, slug")
      .in("id", categoryIds);
    for (const c of cats || []) catMap[c.id] = c;
  }

  const enriched = (posts || []).map((p: any) => ({
    ...p,
    category: p.blog_category_id ? catMap[p.blog_category_id] || null : null,
  }));

  return NextResponse.json({
    posts: enriched,
    pagination: { page, limit, total: total ?? 0, totalPages: Math.ceil((total ?? 0) / limit) },
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, excerpt, content_html, cover_image_url, blog_category_id, published, seo_title, seo_description, slug: customSlug } = body;

  const errors: Record<string, string> = {};
  if (!title || typeof title !== "string" || title.trim().length === 0) errors.title = "Title is required";
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Validation failed", fields: errors }, { status: 400 });
  }

  const supabase = createAdminClient();
  const slug = customSlug || slugify(title);

  const slugCheck = await (supabase.from("blog_posts") as any).select("id").eq("slug", slug).maybeSingle();
  if (slugCheck.data) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 });
  }

  const postData: Record<string, any> = {
    title: title.trim(),
    slug,
    excerpt: excerpt || null,
    content_html: content_html || null,
    cover_image_url: cover_image_url || null,
    blog_category_id: blog_category_id || null,
    published: published || false,
    seo_title: seo_title || null,
    seo_description: seo_description || null,
  };

  if (published) postData.published_at = new Date().toISOString();

  const { data: post, error } = await (supabase.from("blog_posts") as any).insert(postData).select("id, title, slug, published").single();

  if (error) return NextResponse.json({ error: "Failed to create post" }, { status: 500 });

  return NextResponse.json({ post }, { status: 201 });
}
