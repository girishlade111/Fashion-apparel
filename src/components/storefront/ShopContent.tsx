"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useState, useEffect, useRef, Suspense } from "react";
import ProductCard from "./ProductCard";

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  primary_image: { url: string; alt_text: string | null } | null;
  price_range: { min: number; max: number };
  in_stock: boolean;
  total_stock?: number;
  is_low_stock?: boolean;
};

type FilterMeta = {
  minPrice: number;
  maxPrice: number;
  sizes: string[];
  colors: string[];
  categories: { name: string; slug: string }[];
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

function ShopContentInner({ initial, filterMeta }: { initial: { products: Product[]; totalCount: number; totalPages: number; page: number }; filterMeta: FilterMeta }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [products, setProducts] = useState(initial.products);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [page, setPage] = useState(initial.page);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const size = searchParams.get("size") || "";
  const color = searchParams.get("color") || "";
  const sort = searchParams.get("sort") || "newest";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ sort });
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (size) params.set("size", size);
    if (color) params.set("color", color);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 0);
        setPage(data.page || 1);
      })
      .finally(() => setLoading(false));
  }, [category, minPrice, maxPrice, size, color, sort]);

  const setFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  const hasFilters = category || minPrice || maxPrice || size || color;

  const activeCount = [category, minPrice, maxPrice, size, color].filter(Boolean).length;

  return (
    <div className="flex gap-8">
      {/* Mobile filter overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setMobileFilterOpen(false)} />
          <div className="relative ml-auto w-80 max-w-[85vw] bg-white h-full overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-900">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="text-neutral-500">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-5 py-4">
              <FilterContent
                filterMeta={filterMeta}
                category={category} minPrice={minPrice} maxPrice={maxPrice} size={size} color={color}
                setFilter={setFilter} clearFilters={clearFilters} hasFilters={!!hasFilters}
                onApply={() => setMobileFilterOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="sticky top-24 space-y-6">
          <FilterContent
            filterMeta={filterMeta}
            category={category} minPrice={minPrice} maxPrice={maxPrice} size={size} color={color}
            setFilter={setFilter} clearFilters={clearFilters} hasFilters={!!hasFilters}
          />
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden text-sm text-neutral-600 border border-neutral-300 rounded-lg px-3 py-1.5"
            >
              Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
            <p className="text-sm text-neutral-400">
              {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <select
            value={sort}
            onChange={(e) => setFilter("sort", e.target.value)}
            className="text-sm text-neutral-600 bg-transparent border border-neutral-300 rounded-lg px-3 py-1.5 outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-sm mb-3">No products match your filters.</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-sm text-neutral-900 underline underline-offset-4">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setFilter("page", String(p))}
                className={`w-8 h-8 text-sm rounded-md ${
                  p === page
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterContent({
  filterMeta, category, minPrice, maxPrice, size, color,
  setFilter, clearFilters, hasFilters, onApply,
}: {
  filterMeta: FilterMeta;
  category: string; minPrice: string; maxPrice: string; size: string; color: string;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
  onApply?: () => void;
}) {
  return (
    <>
      {/* Category */}
      <div>
        <h4 className="text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3">Category</h4>
        <div className="space-y-1.5">
          {filterMeta.categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => { setFilter("category", category === c.slug ? "" : c.slug); onApply?.(); }}
              className={`block w-full text-left text-sm px-2 py-1 rounded-md transition-colors ${
                category === c.slug ? "bg-neutral-100 text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h4 className="text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3">Price</h4>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setFilter("minPrice", e.target.value)}
            className="w-full text-sm border border-neutral-300 rounded-lg px-2.5 py-1.5 outline-none"
          />
          <span className="text-neutral-300 shrink-0">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setFilter("maxPrice", e.target.value)}
            className="w-full text-sm border border-neutral-300 rounded-lg px-2.5 py-1.5 outline-none"
          />
        </div>
      </div>

      {/* Size */}
      {filterMeta.sizes.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3">Size</h4>
          <div className="flex flex-wrap gap-1.5">
            {filterMeta.sizes.map((s) => (
              <button
                key={s}
                onClick={() => { setFilter("size", size === s ? "" : s); onApply?.(); }}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                  size === s
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {filterMeta.colors.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3">Color</h4>
          <div className="flex flex-wrap gap-1.5">
            {filterMeta.colors.map((c) => (
              <button
                key={c}
                onClick={() => { setFilter("color", color === c ? "" : c); onApply?.(); }}
                className={`text-xs px-3 py-1.5 rounded-md border transition-colors capitalize ${
                  color === c
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-300 text-neutral-500 hover:border-neutral-400"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <button
          onClick={() => { clearFilters(); onApply?.(); }}
          className="text-sm text-neutral-500 underline underline-offset-4 hover:text-neutral-900"
        >
          Clear all filters
        </button>
      )}
    </>
  );
}

export default function ShopContent(props: { initial: { products: Product[]; totalCount: number; totalPages: number; page: number }; filterMeta: FilterMeta }) {
  return (
    <Suspense>
      <ShopContentInner {...props} />
    </Suspense>
  );
}
