"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: string;
  compare_at_price: string | null;
  status: string;
  created_at: string;
  category_id: string | null;
};

type Category = { id: string; name: string };

type ProductFormData = {
  name: string;
  slug: string;
  description: string;
  category_id: string;
  base_price: string;
  compare_at_price: string;
  status: string;
  images: { url: string; alt_text: string }[];
  variants: { size: string; color: string; sku: string; stock_quantity: string; price_override: string }[];
};

const EMPTY_FORM: ProductFormData = {
  name: "", slug: "", description: "", category_id: "", base_price: "", compare_at_price: "",
  status: "draft", images: [{ url: "", alt_text: "" }], variants: [{ size: "", color: "", sku: "", stock_quantity: "0", price_override: "" }],
};

function slugify(text: string) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fetchProducts = useCallback(async (p?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p ?? page), limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch {}
  }, []);

  useEffect(() => { fetchProducts(); fetchCategories(); }, [fetchProducts, fetchCategories]);

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
      const res = await fetch(`/api/admin/products/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      const p = data.product;
      setEditingId(id);
      setForm({
        name: p.name || "",
        slug: p.slug || "",
        description: p.description || "",
        category_id: p.category_id || "",
        base_price: p.base_price?.toString() || "",
        compare_at_price: p.compare_at_price?.toString() || "",
        status: p.status || "draft",
        images: (p.images && p.images.length > 0) ? p.images.map((i: any) => ({ url: i.url || "", alt_text: i.alt_text || "" })) : [{ url: "", alt_text: "" }],
        variants: (p.variants && p.variants.length > 0) ? p.variants.map((v: any) => ({
          size: v.size || "", color: v.color || "", sku: v.sku || "",
          stock_quantity: v.stock_quantity?.toString() || "0",
          price_override: v.price_override?.toString() || "",
        })) : [{ size: "", color: "", sku: "", stock_quantity: "0", price_override: "" }],
      });
      setDrawerOpen(true);
    } catch {
      setFormError("Failed to load product");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const body = {
        ...form,
        base_price: form.base_price ? Number(form.base_price) : null,
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        variants: form.variants.filter((v) => v.size || v.color).map((v) => ({
          ...v,
          stock_quantity: parseInt(v.stock_quantity) || 0,
          price_override: v.price_override ? Number(v.price_override) : null,
        })),
        images: form.images.filter((i) => i.url.trim()),
      };

      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

      if (!res.ok) {
        const data = await res.json();
        if (data.fields) setFieldErrors(data.fields);
        throw new Error(data.error || "Failed to save");
      }

      setDrawerOpen(false);
      fetchProducts(1);
      if (editingId) router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const statusStyles: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-600", active: "bg-green-100 text-green-700",
    archived: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-neutral-900">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your product catalog</p>
        </div>
        <button onClick={openCreate} className="bg-neutral-900 text-white px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium hover:bg-neutral-800 transition-colors">
          Add Product
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {["", "draft", "active", "archived"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-neutral-900 text-white" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-12 text-center text-sm text-neutral-400">Loading...</div>
      ) : error ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-red-200 p-12 text-center text-sm text-red-500">{error}</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-12 text-center">
          <p className="text-sm text-neutral-400 mb-3">No products found</p>
          <button onClick={openCreate} className="text-sm font-medium text-neutral-900 underline hover:no-underline">Add your first product</button>
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Name</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Price</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Status</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Created</th>
                  <th className="text-right px-6 py-3 font-medium text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="px-6 py-3">
                      <p className="text-neutral-900 font-medium">{p.name}</p>
                      <p className="text-neutral-400 text-xs font-mono mt-0.5">{p.slug}</p>
                    </td>
                    <td className="px-6 py-3">
                      <span className="text-neutral-900">₹{Number(p.base_price).toLocaleString("en-IN")}</span>
                      {p.compare_at_price && (
                        <span className="text-neutral-400 line-through ml-1 text-xs">₹{Number(p.compare_at_price).toLocaleString("en-IN")}</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyles[p.status] || "bg-neutral-100 text-neutral-600"}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-3 text-neutral-500 text-xs">{new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => openEdit(p.id)} className="text-neutral-500 hover:text-neutral-900 text-xs font-medium mr-3">Edit</button>
                      <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
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
          <div className="absolute top-0 right-0 h-full w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-heading text-lg font-semibold text-neutral-900">{editingId ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {formError && <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : slugify(e.target.value) })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                  {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 font-mono text-xs" />
                </div>
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Category</label>
                  <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Base Price *</label>
                  <input type="number" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Compare at Price</label>
                  <input type="number" step="0.01" value={form.compare_at_price} onChange={(e) => setForm({ ...form, compare_at_price: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                </div>
                {editingId && (
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-neutral-700">Status</label>
                    <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20">
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="mb-1 block text-sm font-medium text-neutral-700">Description</label>
                  <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded-[var(--radius-md)] border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/20 resize-y" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-700">Variants</h3>
                  <button type="button" onClick={() => setForm({ ...form, variants: [...form.variants, { size: "", color: "", sku: "", stock_quantity: "0", price_override: "" }] })}
                    className="text-xs font-medium text-neutral-900 underline hover:no-underline">+ Add variant</button>
                </div>
                {form.variants.map((v, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 p-3 bg-neutral-50 rounded-[var(--radius-md)]">
                    <div className="grid grid-cols-5 gap-2 flex-1">
                      <input placeholder="Size" value={v.size} onChange={(e) => { const vv = [...form.variants]; vv[i].size = e.target.value; setForm({ ...form, variants: vv }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                      <input placeholder="Color" value={v.color} onChange={(e) => { const vv = [...form.variants]; vv[i].color = e.target.value; setForm({ ...form, variants: vv }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                      <input placeholder="SKU" value={v.sku} onChange={(e) => { const vv = [...form.variants]; vv[i].sku = e.target.value; setForm({ ...form, variants: vv }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20 font-mono" />
                      <input type="number" placeholder="Stock" value={v.stock_quantity} onChange={(e) => { const vv = [...form.variants]; vv[i].stock_quantity = e.target.value; setForm({ ...form, variants: vv }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                      <input type="number" step="0.01" placeholder="Price (override)" value={v.price_override} onChange={(e) => { const vv = [...form.variants]; vv[i].price_override = e.target.value; setForm({ ...form, variants: vv }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, variants: form.variants.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-600 shrink-0 mt-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-700">Images</h3>
                  <button type="button" onClick={() => setForm({ ...form, images: [...form.images, { url: "", alt_text: "" }] })}
                    className="text-xs font-medium text-neutral-900 underline hover:no-underline">+ Add image</button>
                </div>
                {form.images.map((img, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2 p-3 bg-neutral-50 rounded-[var(--radius-md)]">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input placeholder="Image URL" value={img.url} onChange={(e) => { const ii = [...form.images]; ii[i].url = e.target.value; setForm({ ...form, images: ii }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                      <input placeholder="Alt text" value={img.alt_text} onChange={(e) => { const ii = [...form.images]; ii[i].alt_text = e.target.value; setForm({ ...form, images: ii }); }}
                        className="rounded-[var(--radius-md)] border border-neutral-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
                    </div>
                    <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                      className="text-red-400 hover:text-red-600 shrink-0 mt-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
                <button type="submit" disabled={saving}
                  className="bg-neutral-900 text-white px-6 py-2 rounded-[var(--radius-md)] text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50">
                  {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
                </button>
                <button type="button" onClick={() => setDrawerOpen(false)}
                  className="text-sm text-neutral-500 hover:text-neutral-700">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
