"use client";

import { useEffect, useCallback, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import CartItemRow from "./CartItemRow";

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, items, itemCount } = useCart();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    },
    [closeDrawer],
  );

  useEffect(() => {
    if (drawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, handleKeyDown]);

  return (
    <>
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-neutral-200 shrink-0">
            <h2 className="font-heading text-lg text-neutral-900">
              Cart{items.length > 0 ? ` (${itemCount})` : ""}
            </h2>
            <button
              onClick={closeDrawer}
              className="w-9 h-9 flex items-center justify-center text-neutral-500 hover:text-neutral-900"
              aria-label="Close cart"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300 mb-4">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <p className="text-sm text-neutral-500 mb-4">Your cart is empty</p>
                <Link
                  href="/shop"
                  onClick={closeDrawer}
                  className="text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800"
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              items.map((item) => <CartItemRow key={item.id} item={item} />)
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && <CartFooter onCheckout={closeDrawer} />}
        </div>
      </div>
    </>
  );
}

function CartFooter({ onCheckout }: { onCheckout: () => void }) {
  const { subtotal } = useCart();
  const shipping = subtotal >= 500 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="shrink-0 border-t border-neutral-200 px-6 py-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">Subtotal</span>
        <span className="text-neutral-900 font-medium">₹{subtotal.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">Shipping</span>
        <span className="text-neutral-500">
          {shipping === 0 ? "FREE" : `₹${shipping}`}
        </span>
      </div>
      <div className="flex items-center justify-between text-base font-medium pt-1 border-t border-neutral-100">
        <span className="text-neutral-900">Total</span>
        <span className="text-neutral-900">₹{total.toLocaleString()}</span>
      </div>
      <Link
        href="/checkout"
        onClick={onCheckout}
        className="block w-full text-center text-sm bg-neutral-900 text-white rounded-lg py-3 hover:bg-neutral-800 transition-colors"
      >
        Proceed to Checkout
      </Link>
      <Link
        href="/cart"
        onClick={onCheckout}
        className="block w-full text-center text-xs text-neutral-400 hover:text-neutral-600 underline underline-offset-2"
      >
        View Full Cart
      </Link>
    </div>
  );
}
