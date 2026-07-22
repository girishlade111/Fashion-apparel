"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart-context";

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, refreshCart } = useCart();
  const [removing, setRemoving] = useState(false);
  const [updating, setUpdating] = useState(false);

  async function handleQuantityChange(qty: number) {
    if (qty < 1) return;
    setUpdating(true);
    try {
      await updateQuantity(item.id, qty);
    } catch {
      await refreshCart();
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeItem(item.id);
    } catch {
      setRemoving(false);
      await refreshCart();
    }
  }

  return (
    <div
      className={`flex gap-4 py-4 border-b border-neutral-100 last:border-0 transition-opacity ${
        removing ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Image */}
      <Link href={`/products/${item.product.slug}`} className="shrink-0">
        <div className="w-20 h-24 bg-neutral-100 rounded-lg overflow-hidden">
          {item.image ? (
            <img
              src={item.image.url}
              alt={item.image.alt_text || item.product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs">
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.product.slug}`}
          className="text-sm text-neutral-900 hover:text-neutral-600 line-clamp-1"
        >
          {item.product.name}
        </Link>
        <p className="text-xs text-neutral-400 mt-0.5 capitalize">
          {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity */}
          <div className="flex items-center border border-neutral-300 rounded-md">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={updating || item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <span className="w-7 text-center text-xs text-neutral-900 select-none">
              {updating ? "…" : item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={updating}
              className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-900 disabled:opacity-30"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-sm text-neutral-900">₹{item.variant.price.toLocaleString()}</p>
            {item.quantity > 1 && (
              <p className="text-xs text-neutral-400">₹{item.line_total.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Remove */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="mt-1 text-xs text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-50"
        >
          {removing ? "Removing…" : "Remove"}
        </button>
      </div>
    </div>
  );
}
