"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import CartItemRow from "@/components/storefront/CartItemRow";

export default function CartPage() {
  const { items, subtotal, itemCount, refreshCart } = useCart();
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState<{
    code: string;
    discount_type: string;
    value: number;
    discount_amount: number;
  } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");

  async function handleApplyDiscount() {
    const code = discountCode.trim();
    if (!code) return;
    setDiscountLoading(true);
    setDiscountError("");
    setDiscount(null);

    const res = await fetch("/api/discount/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    });

    if (res.ok) {
      const data = await res.json();
      setDiscount(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setDiscountError(data.error || "Invalid discount code");
    }

    setDiscountLoading(false);
  }

  const discountAmount = discount?.discount_amount || 0;
  const shipping = subtotal >= 500 ? 0 : 99;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-heading text-2xl text-neutral-900">Cart</h1>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <svg
            width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            className="mx-auto text-neutral-300 mb-4"
          >
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="text-sm text-neutral-500 mb-6">Your cart is empty</p>
          <Link
            href="/shop"
            className="inline-block text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1fr_320px] gap-12">
          {/* Items */}
          <div>
            <p className="text-sm text-neutral-400 mb-4">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
            <div className="divide-y divide-neutral-100">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-neutral-50 rounded-xl p-6 space-y-3">
              <h2 className="text-sm font-medium text-neutral-900">Order Summary</h2>

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span className="text-neutral-900">₹{subtotal.toLocaleString()}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600">Discount ({discount?.code})</span>
                  <span className="text-green-600">−₹{discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className="text-neutral-500">
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>

              <div className="flex items-center justify-between text-base font-medium pt-1 border-t border-neutral-200">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">₹{total.toLocaleString()}</span>
              </div>

              {shipping > 0 && (
                <p className="text-xs text-neutral-400">
                  Add ₹{(500 - subtotal).toLocaleString()} more for free shipping
                </p>
              )}

              {/* Discount Input */}
              <div className="pt-2">
                <label className="text-xs font-medium text-neutral-900 block mb-1">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleApplyDiscount()}
                    placeholder="Enter code"
                    className="flex-1 text-sm border border-neutral-300 rounded-lg px-3 py-2 outline-none focus:border-neutral-900"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    disabled={discountLoading || !discountCode.trim()}
                    className="text-sm bg-neutral-900 text-white rounded-lg px-4 py-2 hover:bg-neutral-800 disabled:opacity-50 shrink-0"
                  >
                    {discountLoading ? "…" : "Apply"}
                  </button>
                </div>
                {discountError && (
                  <p className="text-xs text-red-500 mt-1">{discountError}</p>
                )}
                {discount && (
                  <p className="text-xs text-green-600 mt-1">
                    {discount.discount_type === "percentage"
                      ? `${discount.value}% off applied`
                      : `₹${discount.value} off applied`}
                  </p>
                )}
              </div>

              <Link
                href="/checkout"
                className="block w-full text-center text-sm bg-neutral-900 text-white rounded-lg py-3 hover:bg-neutral-800 transition-colors mt-2"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="block w-full text-center text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-2"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
