"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  subtotal: number;
  discount_amount: number;
  shipping_fee: number;
  total: number;
  status: string;
  created_at: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  order_items: Array<{
    id: string;
    product_name_snapshot: string;
    variant_label_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
  }>;
};

type PageState =
  | { type: "loading" }
  | { type: "polling"; attempts: number }
  | { type: "paid"; order: Order }
  | { type: "processing"; order: Order }
  | { type: "error"; message: string };

const MAX_POLL_ATTEMPTS = 20;
const POLL_INTERVAL_MS = 3000;

export default function OrderConfirmationPage() {
  const params = useParams();
  const [state, setState] = useState<PageState>({ type: "loading" });
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const orderNumber = params.orderNumber as string;

  async function fetchOrder(email: string): Promise<Order | null> {
    const res = await fetch(
      `/api/orders/${orderNumber}?email=${encodeURIComponent(email)}`,
    );
    if (!res.ok) return null;
    return res.json();
  }

  useEffect(() => {
    const email = sessionStorage.getItem("order_email");
    if (!email) {
      setState({ type: "error", message: "Order details not available. Please check your email for confirmation." });
      return;
    }

    let attempts = 0;

    async function poll() {
      const order = await fetchOrder(email);
      if (!order) {
        attempts++;
        if (attempts >= MAX_POLL_ATTEMPTS) {
          setState({ type: "error", message: "We're still confirming your payment. Please check back shortly — you'll also receive an email confirmation." });
          return;
        }
        setState({ type: "polling", attempts });
        return;
      }

      if (order.status === "paid") {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setState({ type: "paid", order });
        sessionStorage.removeItem("order_email");
        return;
      }

      attempts++;
      if (attempts >= MAX_POLL_ATTEMPTS) {
        setState({ type: "processing", order });
        return;
      }
      setState({ type: "polling", attempts });
    }

    poll();
    pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderNumber]);

  function formatAddress(addr: Order["shipping_address"]) {
    const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean);
    return parts.join(", ");
  }

  if (state.type === "loading" || state.type === "polling") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="flex flex-col items-center text-center">
          <svg className="animate-spin h-10 w-10 text-neutral-400 mb-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <h1 className="font-heading text-xl text-neutral-900 mb-2">Confirming your payment</h1>
          <p className="text-sm text-neutral-500 max-w-xs">
            Please wait while we verify your payment. This should only take a few moments.
          </p>
        </div>
      </div>
    );
  }

  if (state.type === "error") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-600">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="font-heading text-lg text-neutral-900 mb-2">Payment Confirming</h1>
        <p className="text-sm text-neutral-500 mb-6 max-w-sm mx-auto">{state.message}</p>
        <p className="text-xs text-neutral-400 mb-6">
          Need help? Contact us at <a href="mailto:support@fashionapparel.com" className="underline underline-offset-2 hover:text-neutral-900">support@fashionapparel.com</a>
        </p>
        <Link href="/shop" className="inline-block text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  if (state.type === "processing") {
    const { order } = state;
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-amber-600">
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h1 className="font-heading text-xl text-neutral-900">Payment is being processed</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Order <span className="font-medium text-neutral-900">{order.order_number}</span>
          </p>
          <p className="text-xs text-neutral-400 mt-2">
            Your payment has been initiated but we&apos;re still waiting for confirmation from the payment gateway.
          </p>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6 text-sm text-neutral-700">
          <p className="font-medium mb-1">What happens next?</p>
          <p>
            Once confirmed, we&apos;ll send an email to <span className="font-medium">{order.customer_email}</span> with your
            order details. This usually completes within a few minutes. You can also check your inbox for the confirmation.
          </p>
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className="text-xs text-neutral-400">
            Still waiting? Email <a href="mailto:support@fashionapparel.com" className="underline underline-offset-2 hover:text-neutral-900">support@fashionapparel.com</a>
          </p>
          <Link href="/shop" className="inline-block text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const { order } = state;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Success header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl text-neutral-900">Order confirmed, {order.customer_name.split(" ")[0]}!</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your order <span className="font-medium text-neutral-900">{order.order_number}</span> has been placed successfully.
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          A confirmation email is on its way to {order.customer_email}
        </p>
      </div>

      {/* Itemized products */}
      <div className="mt-10 bg-neutral-50 rounded-xl p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-4">Items Ordered</h2>
        <div className="divide-y divide-neutral-200">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="text-neutral-900">{item.product_name_snapshot}</p>
                <p className="text-xs text-neutral-400 capitalize">
                  {item.variant_label_snapshot} × {item.quantity}
                </p>
              </div>
              <p className="text-neutral-900">₹{(item.unit_price_snapshot * item.quantity).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 pt-4 border-t border-neutral-200 mt-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Subtotal</span>
            <span className="text-neutral-900">₹{Number(order.subtotal).toLocaleString()}</span>
          </div>
          {Number(order.discount_amount) > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-500">Discount</span>
              <span className="text-green-600">−₹{Number(order.discount_amount).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-neutral-500">Shipping</span>
            <span className="text-neutral-900">{Number(order.shipping_fee) === 0 ? "FREE" : `₹${Number(order.shipping_fee)}`}</span>
          </div>
          <div className="flex justify-between text-base font-medium pt-2 border-t border-neutral-200">
            <span className="text-neutral-900">Total Paid</span>
            <span className="text-neutral-900">₹{Number(order.total).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping address */}
      <div className="mt-6 bg-neutral-50 rounded-xl p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-2">Shipping Address</h2>
        <p className="text-sm text-neutral-600">{formatAddress(order.shipping_address)}</p>
      </div>

      {/* Estimated delivery */}
      <div className="mt-6 bg-neutral-50 rounded-xl p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-2">Estimated Delivery</h2>
        <p className="text-sm text-neutral-600">
          {(() => {
            const placed = new Date(order.created_at);
            const est = new Date(placed);
            est.setDate(est.getDate() + 5 + Math.floor(Math.random() * 3));
            return `Your order is expected to arrive between ${est.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} and ${new Date(est.getTime() + 2 * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}.`;
          })()}
        </p>
      </div>

      {/* What happens next */}
      <div className="mt-6 bg-neutral-50 rounded-xl p-6">
        <h2 className="text-sm font-medium text-neutral-900 mb-3">What Happens Next</h2>
        <ol className="text-sm text-neutral-600 space-y-2 list-decimal list-inside">
          <li>You&apos;ll receive an order confirmation email with your order details.</li>
          <li>We&apos;ll prepare your items and update the status as they&apos;re processed.</li>
          <li>Once shipped, you&apos;ll get a shipping confirmation with tracking information.</li>
          <li>Your order will be delivered to your shipping address within the estimated delivery window.</li>
        </ol>
      </div>

      {/* Customer support */}
      <div className="mt-6 bg-neutral-50 rounded-xl p-6 text-sm text-neutral-600">
        <h2 className="font-medium text-neutral-900 mb-1">Need Help?</h2>
        <p>
          Contact us at <a href="mailto:support@fashionapparel.com" className="text-neutral-900 underline underline-offset-2 hover:text-neutral-700">support@fashionapparel.com</a>{" "}
          or call <span className="text-neutral-900">+91 1800-123-4567</span> (Mon–Sat, 9 AM – 6 PM IST).
        </p>
      </div>

      {/* Order meta */}
      <div className="mt-6 text-xs text-neutral-400 space-y-1">
        <p>
          Placed on: {new Date(order.created_at).toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        {order.razorpay_payment_id && <p>Payment ID: {order.razorpay_payment_id}</p>}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block text-sm bg-neutral-900 text-white rounded-lg px-8 py-2.5 hover:bg-neutral-800"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
