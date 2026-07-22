"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import ImageGallery from "./ImageGallery";
import { useCart } from "@/lib/cart-context";

type Variant = {
  id: string;
  size: string;
  color: string;
  stock_quantity: number;
  price_override: number | null;
  inStock: boolean;
};

type Review = {
  id: string;
  reviewer_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  compare_at_price: number | null;
  category: { name: string; slug: string } | null;
  images: { id: string; url: string; alt_text: string | null }[];
  variants: Variant[];
  inStock: boolean;
  reviews: { items: Review[]; average_rating: number | null; count: number };
  related_products: { id: string; name: string; slug: string; base_price: number; compare_at_price: number | null }[];
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24" fill={s <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className={s <= rating ? "text-neutral-900" : "text-neutral-300"}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </span>
  );
}

function Accordion({ title, children, open: defaultOpen }: { title: string; children: React.ReactNode; open?: boolean }) {
  const [open, setOpen] = useState(defaultOpen || false);
  return (
    <div className="border-b border-neutral-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-sm font-medium text-neutral-900"
      >
        {title}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="pb-4 text-sm text-neutral-600 leading-relaxed">{children}</div>}
    </div>
  );
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const [form, setForm] = useState({ reviewer_name: "", rating: 5, title: "", body: "" });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, product_id: productId }),
    });
    setSubmitting(false);
    if (res.ok) {
      setMessage("Thank you! Your review will appear after approval.");
      setForm({ reviewer_name: "", rating: 5, title: "", body: "" });
      onSubmitted();
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to submit review.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <h4 className="text-sm font-medium text-neutral-900">Write a Review</h4>
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={form.reviewer_name}
          onChange={(e) => setForm({ ...form, reviewer_name: e.target.value })}
          required
          className="flex-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 outline-none"
        />
        <select
          value={form.rating}
          onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
          className="text-sm border border-neutral-300 rounded-lg px-3 py-2 outline-none"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="Review title (optional)"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 outline-none"
      />
      <textarea
        placeholder="Your review"
        value={form.body}
        onChange={(e) => setForm({ ...form, body: e.target.value })}
        required
        rows={3}
        className="w-full text-sm border border-neutral-300 rounded-lg px-3 py-2 outline-none resize-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="text-sm bg-neutral-900 text-white rounded-lg px-6 py-2 hover:bg-neutral-800 disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
      {message && <p className="text-sm text-neutral-500">{message}</p>}
    </form>
  );
}

export default function ProductDetail({ product: initial }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");
  const { refreshCart } = useCart();

  const sizes = useMemo(() => [...new Set(initial.variants.map((v) => v.size).filter(Boolean))], [initial.variants]);
  const colors = useMemo(() => [...new Set(initial.variants.map((v) => v.color).filter(Boolean))], [initial.variants]);

  const matchingVariants = useMemo(() => {
    return initial.variants.filter((v) => {
      if (selectedSize && v.size !== selectedSize) return false;
      if (selectedColor && v.color !== selectedColor) return false;
      return true;
    });
  }, [initial.variants, selectedSize, selectedColor]);

  const currentVariant = useMemo(() => {
    if (!selectedSize && !selectedColor) return null;
    return matchingVariants.length === 1 ? matchingVariants[0] : null;
  }, [matchingVariants, selectedSize, selectedColor]);

  const currentPrice = currentVariant?.price_override ?? initial.base_price;
  const isOnSale = initial.compare_at_price && initial.compare_at_price > currentPrice;
  const selectedInStock = currentVariant ? currentVariant.inStock : initial.inStock;

  const handleAddToCart = useCallback(async () => {
    if (!selectedSize && sizes.length > 0) { setError("Please select a size."); return; }
    if (!selectedColor && colors.length > 0) { setError("Please select a color."); return; }
    if (!selectedInStock) { setError("This combination is out of stock."); return; }

    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: initial.id,
          variant_id: currentVariant?.id || null,
          quantity,
        }),
      });
      if (res.ok) {
        setAdded(true);
        refreshCart();
        setTimeout(() => setAdded(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add to cart.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setAdding(false);
    }
  }, [selectedSize, selectedColor, selectedInStock, sizes.length, colors.length, currentVariant, initial.id, quantity, refreshCart]);

  const uniqueSizes = [...new Set(initial.variants.filter((v) => !selectedColor || v.color === selectedColor).map((v) => v.size))];
  const uniqueColors = [...new Set(initial.variants.filter((v) => !selectedSize || v.size === selectedSize).map((v) => v.color))];

  function isSizeInStock(size: string) {
    return initial.variants.some((v) => {
      if (v.size !== size) return false;
      if (selectedColor && v.color !== selectedColor) return false;
      return v.inStock;
    });
  }

  function isColorInStock(color: string) {
    return initial.variants.some((v) => {
      if (v.color !== color) return false;
      if (selectedSize && v.size !== selectedSize) return false;
      return v.inStock;
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="md:sticky md:top-24 md:self-start">
          <ImageGallery images={initial.images} />
        </div>

        {/* Info */}
        <div>
          {initial.category && (
            <Link
              href={`/shop?category=${initial.category.slug}`}
              className="text-xs text-neutral-400 uppercase tracking-wider hover:text-neutral-600"
            >
              {initial.category.name}
            </Link>
          )}
          <h1 className="font-heading text-2xl lg:text-3xl text-neutral-900 mt-1">{initial.name}</h1>

          {/* Rating */}
          {initial.reviews.count > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Stars rating={Math.round(initial.reviews.average_rating || 0)} />
              <span className="text-xs text-neutral-400">
                {initial.reviews.average_rating} ({initial.reviews.count})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-xl text-neutral-900">
              ₹{currentPrice.toLocaleString()}
            </span>
            {isOnSale && (
              <span className="text-sm text-neutral-400 line-through">
                ₹{initial.compare_at_price!.toLocaleString()}
              </span>
            )}
          </div>

          {/* Size */}
          {sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wider">Size</span>
                <button
                  onClick={() => setSelectedSize(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-900 underline underline-offset-2"
                >
                  {selectedSize ? "Clear" : ""}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSize(s === selectedSize ? null : s); setError(""); }}
                    disabled={!uniqueSizes.includes(s)}
                    className={`min-w-[44px] text-sm px-4 py-2.5 rounded-lg border transition-colors ${
                      selectedSize === s
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : uniqueSizes.includes(s)
                          ? "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                          : "border-neutral-100 text-neutral-300 cursor-not-allowed"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color */}
          {colors.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-900 uppercase tracking-wider">
                  Color{selectedColor ? `: ${selectedColor}` : ""}
                </span>
                <button
                  onClick={() => setSelectedColor(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-900 underline underline-offset-2"
                >
                  {selectedColor ? "Clear" : ""}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setSelectedColor(c === selectedColor ? null : c); setError(""); }}
                    disabled={!uniqueColors.includes(c)}
                    className={`text-sm px-4 py-2.5 rounded-lg border transition-colors capitalize ${
                      selectedColor === c
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : uniqueColors.includes(c)
                          ? "border-neutral-300 text-neutral-700 hover:border-neutral-900"
                          : "border-neutral-100 text-neutral-300 cursor-not-allowed"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border border-neutral-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <span className="w-10 text-center text-sm text-neutral-900 select-none">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || added}
              className={`flex-1 h-9 text-sm font-medium rounded-lg transition-colors ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-neutral-900 text-white hover:bg-neutral-800"
              } disabled:opacity-60`}
            >
              {adding ? "Adding…" : added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

          {/* Stock info */}
          <p className={`mt-3 text-xs ${selectedInStock ? "text-green-600" : "text-red-500"}`}>
            {!selectedSize && !selectedColor && sizes.length > 0
              ? "Select a size to check availability"
              : selectedInStock
                ? "In stock"
                : "Out of stock"}
          </p>

          {/* Accordions */}
          <div className="mt-8 border-t border-neutral-200">
            {initial.description && (
              <Accordion title="Description" open>
                <p>{initial.description}</p>
              </Accordion>
            )}
            <Accordion title="Materials & Care">
              <p>Our products are crafted from premium-quality materials. Please refer to the care label inside each garment for detailed washing and care instructions.</p>
            </Accordion>
            <Accordion title="Shipping & Returns">
              <p>Free shipping on orders above ₹499. Standard delivery within 5–7 business days. Easy returns within 15 days of delivery.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16 max-w-2xl">
        <h2 className="font-heading text-xl text-neutral-900 mb-6">
          Reviews{initial.reviews.count > 0 ? ` (${initial.reviews.count})` : ""}
        </h2>

        {initial.reviews.count > 0 ? (
          <div className="space-y-6">
            {initial.reviews.items.map((r) => (
              <div key={r.id} className="pb-6 border-b border-neutral-100">
                <div className="flex items-center gap-2 mb-1">
                  <Stars rating={r.rating} />
                  <span className="text-xs text-neutral-400">
                    {new Date(r.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </div>
                {r.title && <p className="text-sm font-medium text-neutral-900">{r.title}</p>}
                <p className="text-sm text-neutral-600 mt-1">{r.body}</p>
                <p className="text-xs text-neutral-400 mt-1">– {r.reviewer_name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">No reviews yet.</p>
        )}

        <ReviewForm productId={initial.id} onSubmitted={() => {}} />
      </div>

      {/* Related Products */}
      {initial.related_products.length > 0 && (
        <div className="mt-16">
          <h2 className="font-heading text-xl text-neutral-900 mb-6">You May Also Like</h2>
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x">
            {initial.related_products.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="shrink-0 w-48 snap-start group">
                <div className="aspect-[3/4] bg-neutral-100 rounded-lg mb-2">
                  {p.compare_at_price && p.compare_at_price > p.base_price && (
                    <span className="absolute m-2 bg-red-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                      Sale
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-700 group-hover:text-neutral-900 transition-colors truncate">
                  {p.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {p.compare_at_price && p.compare_at_price > p.base_price ? (
                    <>
                      <span className="text-red-500">₹{p.base_price.toLocaleString()}</span>{" "}
                      <span className="line-through text-neutral-300">₹{p.compare_at_price.toLocaleString()}</span>
                    </>
                  ) : (
                    <>₹{p.base_price.toLocaleString()}</>
                  )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
