"use client";

import { useEffect, useState, useCallback } from "react";

type BlogCategory = { id: string; name: string; slug: string };

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  blog_category_id: string | null;
  category: { name: string; slug: string } | null;
};

type BlogPostForm = {
  title: string;
  slug: string;
  excerpt: string;
  content_html: string;
  cover_image_url: string;
  blog_category_id: string;
  published: boolean;
  seo_title: string;
  seo_description: string;
};

const EMPTY_FORM: BlogPostForm = {
  title: "", slug: "", excerpt: "", content_html: "", cover_image_url: "",
  blog_category_id: "", published: false, seo_title: "", seo_description: "",
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BlogPostForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);

  const fetchPosts = useCallback(async (p?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p ?? page), limit: "20" });
      const res = await fetch(`/api/admin/blog?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPosts(data.posts || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchPosts(); fetchCategories(); }, [fetchPosts, fetchCategories]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFieldErrors({});
    setDrawerOpen(true);
  }

  async function openEdit(id: string) {
    setFormError(null);
    setFieldErrors({});
    try {
      const res = await fetch(`/api/admin/blog/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const p = data.post;
      setEditingId(id);
      setForm({
        title: p.title || "",
        slug: p.slug || "",
        excerpt: p.excerpt || "",
        content_html: p.content_html || "",
        cover_image_url: p.cover_image_url || "",
        blog_category_id: p.blog_category_id || "",
        published: p.published || false,
        seo_title: p.seo_title || "",
        seo_description: p.seo_description || "",
      });
      setDrawerOpen(true);
    } catch {
      setFormError("Failed to load post");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const body = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt || null,
        content_html: form.content_html || null,
        cover_image_url: form.cover_image_url || null,
        blog_category_id: form.blog_category_id || null,
        published: form.published,
        seo_title: form.seo_title || null,
        seo_description: form.seo_description || null,
      };

      const url = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json();
        if (data.fields) setFieldErrors(data.fields);
        throw new Error(data.error || "Failed to save");
      }

      setDrawerOpen(false);
      fetchPosts(1);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    try {
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function handleTogglePublish(post: BlogPost) {
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });
      if (!res.ok) throw new Error("Failed to update");
      fetchPosts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  }

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    try {
      const res = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create");
      setNewCategoryName("");
      setShowNewCategory(false);
      fetchCategories();
    } catch {
      alert("Failed to create category");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">Blog</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage blog posts</p>
        </div>
        <button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium hover:bg-neutral-800 transition-colors">
          New Post
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-12 text-center text-sm text-neutral-400">Loading...</div>
      ) : error ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-red-200 p-12 text-center text-sm text-red-500">{error}</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400 mb-3">No posts yet</p>
          <button onClick={openCreate} className="text-sm font-medium text-neutral-900 underline hover:no-underline">Write your first post</button>
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Title</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Category</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Date</th>
                  <th className="text-right px-6 py-3 font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="px-6 py-3">
                      <p className="text-neutral-900 font-medium">{post.title}</p>
                      <p className="text-neutral-400 text-xs font-mono mt-0.5">{post.slug}</p>
                    </td>
                    <td className="px-6 py-3 text-neutral-500 text-xs">{post.category?.name || "—"}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => handleTogglePublish(post)}
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium cursor-pointer ${
                          post.published ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-3 text-neutral-500 text-xs">
                      {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => openEdit(post.id)} className="text-neutral-500 hover:text-neutral-900 text-xs font-medium mr-3">Edit</button>
                      <button onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-neutral-100">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-1 text-xs border border-neutral-200 rounded-[var(--radius-md)] disabled:opacity-30 hover:bg-neutral-50">Prev</button>
              <span className="text-xs text-neutral-500">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1 text-xs border border-neutral-200 rounded-[var(--radius-md)] disabled:opacity-30 hover:bg-neutral-50">Next</button>
            </div>
          )}
        </div>
      )}

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDrawerOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-heading text-lg font-semibold text-neutral-900">{editingId ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {formError && <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Title *</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                  {fieldErrors.title && <p className="mt-1 text-xs text-red-500">{fieldErrors.title}</p>}
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 font-mono text-xs" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Category</label>
                  <div className="flex items-center gap-2">
                    <select value={form.blog_category_id} onChange={(e) => setForm({ ...form, blog_category_id: e.target.value })}
                      className="flex-1 rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20">
                      <option value="">None</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowNewCategory(!showNewCategory)}
                      className="text-xs text-neutral-500 hover:text-neutral-900 underline shrink-0">
                      {showNewCategory ? "Cancel" : "New"}
                    </button>
                  </div>
                  {showNewCategory && (
                    <div className="flex items-center gap-2 mt-2">
                      <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name"
                        className="flex-1 rounded-[var(--radius-md)] border border-neutral-300 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                      <button type="button" onClick={handleAddCategory}
                        className="bg-neutral-900 text-white px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium hover:bg-neutral-800">Add</button>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Excerpt</label>
                  <textarea rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-y" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Content (HTML)</label>
                  <textarea rows={12} value={form.content_html} onChange={(e) => setForm({ ...form, content_html: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-y" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Cover Image URL</label>
                  <input value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                  {form.cover_image_url && (
                    <img src={form.cover_image_url} alt="Preview" className="mt-2 h-32 rounded-[var(--radius-md)] object-cover border border-neutral-200" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                </div>
                <div className="col-span-2 border-t border-neutral-200 pt-4">
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">SEO</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-neutral-700">SEO Title</label>
                      <input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                        className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1 block text-sm font-medium text-neutral-700">SEO Description</label>
                      <textarea rows={2} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                        className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-y" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                <button type="submit" disabled={saving}
                  className="bg-neutral-900 text-white px-6 py-2 rounded-[var(--radius-md)] text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}
                </button>
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer ml-4">
                  <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900/20" />
                  Publish immediately
                </label>
                <button type="button" onClick={() => setDrawerOpen(false)} className="text-sm text-neutral-500 hover:text-neutral-700 ml-auto">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
