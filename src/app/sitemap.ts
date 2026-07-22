import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/cart`, lastModified: new Date(), changeFrequency: "never", priority: 0.3 },
    { url: `${SITE_URL}/wishlist`, lastModified: new Date(), changeFrequency: "never", priority: 0.3 },
    { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: "never", priority: 0.4 },
  ];

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return staticPages;
  }

  const supabase = createAdminClient();

  const [{ data: products }, { data: blogPosts }, { data: categories }] = await Promise.all([
    (supabase.from("products") as any)
      .select("slug, updated_at")
      .eq("status", "active")
      .order("slug"),
    (supabase.from("blog_posts") as any)
      .select("slug, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false }),
    (supabase.from("categories") as any)
      .select("slug")
      .order("slug"),
  ]);

  const productPages: MetadataRoute.Sitemap = (products || []).map((p: any) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = (blogPosts || []).map((p: any) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.published_at || Date.now()),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((c: any) => ({
    url: `${SITE_URL}/shop?category=${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages, ...blogPages, ...categoryPages];
}
