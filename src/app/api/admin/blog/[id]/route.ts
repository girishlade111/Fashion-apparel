import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: post } = await (supabase.from("blog_posts") as any)
    .select("id, title, slug, excerpt, content_html, cover_image_url, published, published_at, created_at, updated_at, blog_category_id, seo_title, seo_description")
    .eq("id", id)
    .maybeSingle();

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let category = null;
  if (post.blog_category_id) {
    const { data: cat } = await (supabase.from("blog_categories") as any)
      .select("id, name, slug")
      .eq("id", post.blog_category_id)
      .single();
    category = cat;
  }

  return NextResponse.json({ post: { ...post, category } });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const existing = await (supabase.from("blog_posts") as any).select("id, published").eq("id", id).maybeSingle();
  if (!existing.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { title, slug, excerpt, content_html, cover_image_url, blog_category_id, published, seo_title, seo_description } = body;

  const updateFields: Record<string, any> = {};
  if (title !== undefined) updateFields.title = title.trim();
  if (slug !== undefined) updateFields.slug = slug;
  if (excerpt !== undefined) updateFields.excerpt = excerpt;
  if (content_html !== undefined) updateFields.content_html = content_html;
  if (cover_image_url !== undefined) updateFields.cover_image_url = cover_image_url;
  if (blog_category_id !== undefined) updateFields.blog_category_id = blog_category_id;
  if (seo_title !== undefined) updateFields.seo_title = seo_title;
  if (seo_description !== undefined) updateFields.seo_description = seo_description;

  if (published !== undefined) {
    updateFields.published = published;
    if (published && !existing.data.published) {
      updateFields.published_at = new Date().toISOString();
    }
  }

  updateFields.updated_at = new Date().toISOString();

  if (Object.keys(updateFields).length <= 1) {
    return NextResponse.json({ status: "ok" });
  }

  const { error } = await (supabase.from("blog_posts") as any).update(updateFields).eq("id", id);
  if (error) return NextResponse.json({ error: "Failed to update post" }, { status: 500 });

  return NextResponse.json({ status: "ok" });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const existing = await (supabase.from("blog_posts") as any).select("id").eq("id", id).maybeSingle();
  if (!existing.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await (supabase.from("blog_posts") as any).delete().eq("id", id);
  return NextResponse.json({ status: "deleted" });
}
