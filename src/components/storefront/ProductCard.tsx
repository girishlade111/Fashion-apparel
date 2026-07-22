"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

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

export default function ProductCard({ product }: { product: Product }) {
  const { refreshCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  async function handleAddToCart() {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: product.id, quantity: 1 }),
    });
    if (res.ok) await refreshCart();
  }

  return (
    <div className="group relative">
      <Link href={`/products/${product.slug}`}>
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100 rounded-lg">
          {product.primary_image ? (
            <img
              src={product.primary_image.url}
              alt={product.primary_image.alt_text || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-sm">
              No image
            </div>
          )}
          {!product.in_stock && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <span className="bg-neutral-900 text-white text-xs font-medium px-3 py-1.5 rounded-full">
                Sold Out
              </span>
            </div>
          )}
        </div>
      </Link>

      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors z-10"
        aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={isWishlisted(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isWishlisted(product.id) ? "text-red-500" : "text-neutral-700"}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </button>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="mt-0.5 text-sm text-neutral-500">
            {product.price_range.min === product.price_range.max ? (
              <span>₹{product.price_range.min.toLocaleString()}</span>
            ) : (
              <span>
                ₹{product.price_range.min.toLocaleString()} –{" "}
                ₹{product.price_range.max.toLocaleString()}
              </span>
            )}
          </p>
        </div>
      </div>

      {product.in_stock && (
        <button
          onClick={handleAddToCart}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:bg-white hover:text-neutral-900 shadow-sm max-lg:hidden"
          aria-label={`Add ${product.name} to cart`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
}
