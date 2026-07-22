"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
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

export default function OrderConfirmationPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.order_number}`);
        if (res.ok) {
          setOrder(await res.json());
        } else {
          setError("Order not found");
        }
      } catch {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.order_number]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-neutral-200 rounded" />
          <div className="h-6 w-64 bg-neutral-100 rounded" />
          <div className="h-40 bg-neutral-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-neutral-500 mb-6">{error || "Order not found"}</p>
        <Link href="/shop" className="text-sm bg-neutral-900 text-white rounded-lg px-6 py-2.5 hover:bg-neutral-800">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Success header */}
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-600">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="font-heading text-2xl text-neutral-900">Thank you, {order.customer_name}!</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Your order <span className="font-medium text-neutral-900">{order.order_number}</span> has been placed.
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          A confirmation email will be sent to {order.customer_email}
        </p>
      </div>

      {/* Order items */}
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
        <div className="flex justify-between text-base font-medium pt-4 border-t border-neutral-200 mt-2">
          <span className="text-neutral-900">Total Paid</span>
          <span className="text-neutral-900">₹{Number(order.total).toLocaleString()}</span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 text-xs text-neutral-400 space-y-1">
        <p>Order status: <span className="text-neutral-600 capitalize">{order.status}</span></p>
        {order.razorpay_payment_id && (
          <p>Payment ID: {order.razorpay_payment_id}</p>
        )}
        <p>
          Placed on: {new Date(order.created_at).toLocaleDateString("en-IN", {
            year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
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
