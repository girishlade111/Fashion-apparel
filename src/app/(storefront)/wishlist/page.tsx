"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/storefront/ProductCard";
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
};

export default function WishlistPage() {
  const { wishlist, wishlistCount, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (wishlist.size === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const ids = [...wishlist].join(",");
    fetch(`/api/products?ids=${encodeURIComponent(ids)}&limit=60`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load wishlist.");
        setLoading(false);
      });
  }, [wishlist]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl text-neutral-900">Wishlist</h1>
          <p className="text-sm text-neutral-400 mt-1">
            {wishlistCount === 0
              ? "You haven't saved any items yet"
              : `${wishlistCount} item${wishlistCount === 1 ? "" : "s"} saved`}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-sm text-neutral-400">
          Loading…
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-20 text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 mb-4">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <p className="text-neutral-500 text-sm mb-4">Your wishlist is empty</p>
          <Link
            href="/shop"
            className="inline-flex h-9 items-center px-5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Discover Products
          </Link>
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
