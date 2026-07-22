import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import DOMPurify from "isomorphic-dompurify";
import { SITE_URL, breadcrumbJsonLd } from "@/lib/seo";

type tParams = Promise<{ slug: string }>;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

async function getPost(slug: string) {
  const supabase = createAdminClient();

  const { data: post } = await (supabase.from("blog_posts") as any)
    .select("id, title, slug, excerpt, content_html, cover_image_url, published_at, seo_title, seo_description, blog_category_id")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (!post) return null;

  let category = null;
  if (post.blog_category_id) {
    const { data: cat } = await (supabase.from("blog_categories") as any)
      .select("id, name, slug")
      .eq("id", post.blog_category_id)
      .single();
    category = cat;
  }

  let related: any[] = [];
  if (post.blog_category_id) {
    const { data: relatedPosts } = await (supabase.from("blog_posts") as any)
      .select("title, slug, cover_image_url, published_at")
      .eq("published", true)
      .eq("blog_category_id", post.blog_category_id)
      .neq("id", post.id)
      .order("published_at", { ascending: false })
      .limit(3);
    related = relatedPosts || [];
  }

  return {
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
    related,
  };
}

export async function generateMetadata({ params }: { params: tParams }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || "",
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: { params: tParams }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const sanitizedHtml = DOMPurify.sanitize(post.content_html || "");

  const breadcrumbJson = breadcrumbJsonLd([
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Journal", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors mb-8"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to Journal
      </Link>

      <article>
        {post.category && (
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="inline-block text-xs text-neutral-400 uppercase tracking-wider hover:text-neutral-900 transition-colors mb-3"
          >
            {post.category.name}
          </Link>
        )}

        <h1 className="font-heading text-3xl lg:text-4xl text-neutral-900 leading-tight">
          {post.title}
        </h1>

        <p className="text-sm text-neutral-400 mt-3">
          {formatDate(post.published_at)}
        </p>

        {post.cover_image_url && (
          <div className="aspect-[16/9] overflow-hidden bg-neutral-100 rounded-xl mt-8 mb-10">
            <img
              src={post.cover_image_url}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {post.content_html ? (
          <div
            className="prose prose-neutral prose-img:rounded-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          post.excerpt && (
            <p className="text-neutral-600 text-lg leading-relaxed">
              {post.excerpt}
            </p>
          )
        )}
      </article>

      {post.related.length > 0 && (
        <section className="mt-16 pt-12 border-t border-neutral-200">
          <h2 className="font-heading text-xl text-neutral-900 mb-6">
            Related Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {post.related.map((r: any) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group block"
              >
                <div className="aspect-[16/10] overflow-hidden bg-neutral-100 rounded-lg mb-3">
                  {r.cover_image_url ? (
                    <img
                      src={r.cover_image_url}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 text-sm">
                      No image
                    </div>
                  )}
                </div>
                <h3 className="font-heading text-sm text-neutral-900 group-hover:text-neutral-600 transition-colors leading-snug">
                  {r.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  {formatDate(r.published_at)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
