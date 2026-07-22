import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { truncate, SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Journal",
  description: truncate("Style inspiration, trend reports, and behind-the-scenes stories from the Fashion Apparel atelier."),
  openGraph: {
    title: `Journal | ${SITE_NAME}`,
    description: truncate("Style inspiration, trend reports, and behind-the-scenes stories from the Fashion Apparel atelier."),
  },
};

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await (supabase.from("blog_categories") as any)
    .select("name, slug")
    .order("name");
  return (data || []) as { name: string; slug: string }[];
}

async function getPosts(category?: string, page = 1, pageSize = 12) {
  const supabase = createAdminClient();
  const offset = (page - 1) * pageSize;

  let countQuery = (supabase.from("blog_posts") as any)
    .select("id", { count: "exact", head: true })
    .eq("published", true);
  let listQuery = (supabase.from("blog_posts") as any)
    .select("id, title, slug, excerpt, cover_image_url, published_at, blog_category_id")
    .eq("published", true);

  if (category) {
    const { data: cat } = await (supabase.from("blog_categories") as any)
      .select("id")
      .eq("slug", category)
      .maybeSingle();
    const catId = cat?.id || category;
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
    for (const c of cats || []) catMap[c.id] = c;
  }

  const enriched = (posts || []).map((p: any) => ({
    ...p,
    category: p.blog_category_id ? catMap[p.blog_category_id] || null : null,
  }));

  return {
    posts: enriched,
    pagination: {
      page,
      pageSize,
      total: total ?? 0,
      totalPages: Math.ceil((total ?? 0) / pageSize),
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category || undefined;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const [categories, { posts, pagination }] = await Promise.all([
    getCategories(),
    getPosts(category, page),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="font-heading text-3xl text-neutral-900">Journal</h1>
        <p className="text-neutral-500 text-sm mt-2">
          Style inspiration, trend reports, and behind-the-scenes stories.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/blog"
          className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
            !category
              ? "bg-neutral-900 text-white border-neutral-900"
              : "border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
          }`}
        >
          All
        </Link>
        {categories.map((cat: { name: string; slug: string }) => (
          <Link
            key={cat.slug}
            href={`/blog?category=${cat.slug}`}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              category === cat.slug
                ? "bg-neutral-900 text-white border-neutral-900"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-900 hover:text-neutral-900"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-neutral-400 text-sm">
          No posts found.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post: any) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block"
            >
              <div className="aspect-[16/10] overflow-hidden bg-neutral-100 rounded-lg mb-4">
                {post.cover_image_url ? (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 text-sm">
                    No image
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                {post.category && (
                  <>
                    <span>{post.category.name}</span>
                    <span>·</span>
                  </>
                )}
                <span>{formatDate(post.published_at)}</span>
              </div>
              <h2 className="font-heading text-lg text-neutral-900 group-hover:text-neutral-600 transition-colors mb-1.5">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-sm text-neutral-500 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`/blog?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page - 1) }).toString()}`}
              className="text-sm px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
            >
              Previous
            </Link>
          )}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/blog?${new URLSearchParams({ ...(category ? { category } : {}), page: String(p) }).toString()}`}
                className={`text-sm w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                  p === page
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                {p}
              </Link>
            ),
          )}
          {page < pagination.totalPages && (
            <Link
              href={`/blog?${new URLSearchParams({ ...(category ? { category } : {}), page: String(page + 1) }).toString()}`}
              className="text-sm px-4 py-2 border border-neutral-300 rounded-lg text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
