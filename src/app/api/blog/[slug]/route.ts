import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    const supabase = createAdminClient();

    const { data: post } = await (supabase.from("blog_posts") as any)
      .select("id, title, slug, excerpt, content_html, cover_image_url, published_at, seo_title, seo_description, blog_category_id")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (!post) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let category = null;
    if (post.blog_category_id) {
      const { data: cat } = await (supabase.from("blog_categories") as any)
        .select("name, slug")
        .eq("id", post.blog_category_id)
        .single();
      category = cat;
    }

    return NextResponse.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content_html: post.content_html,
        cover_image_url: post.cover_image_url,
        published_at: post.published_at,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        category,
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
