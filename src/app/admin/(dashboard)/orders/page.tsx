"use client";

import { useEffect, useState, useCallback } from "react";

type OrderItem = {
  id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  variant_size: string;
  variant_color: string;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total: string;
  subtotal: string;
  discount_amount: string;
  shipping_amount: string;
  status: string;
  created_at: string;
  shipping_address: any;
  items: OrderItem[];
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["paid", "failed", "cancelled"],
  paid: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  failed: ["pending"],
  cancelled: [],
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-neutral-100 text-neutral-500",
};

const STATUS_ORDER = ["pending", "paid", "shipped", "delivered", "failed", "cancelled"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async (p?: number) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(p ?? page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    setDetailOrder(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setDetailOrder(data.order);
    } catch {
      setError("Failed to load order detail");
    } finally {
      setDetailLoading(false);
    }
  }

  async function updateStatus(newStatus: string) {
    if (!detailOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${detailOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setDetailOrder({ ...detailOrder, status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">Orders</h1>
        <p className="text-sm text-neutral-500 mt-1">Manage customer orders</p>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {["", ...STATUS_ORDER].map((s) => (
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
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-12 text-center text-sm text-neutral-400">No orders found</div>
      ) : (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Order #</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Customer</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Email</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-neutral-500">Total</th>
                  <th className="text-right px-6 py-3 font-medium text-neutral-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} onClick={() => openDetail(o.id)}
                    className="border-b border-neutral-50 hover:bg-neutral-50/50 cursor-pointer">
                    <td className="px-6 py-3 font-mono text-xs text-neutral-900">#{o.order_number}</td>
                    <td className="px-6 py-3 text-neutral-900 font-medium">{o.customer_name}</td>
                    <td className="px-6 py-3 text-neutral-500 text-xs">{o.customer_email}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_STYLES[o.status] || ""}`}>{o.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right text-neutral-900 font-medium">₹{Number(o.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right text-neutral-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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

      {detailOrder && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDetailOrder(null)} />
          <div className="absolute top-0 right-0 h-full w-full max-w-xl bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-heading text-lg font-semibold text-neutral-900">Order #{detailOrder.order_number}</h2>
              <button onClick={() => setDetailOrder(null)} className="text-neutral-400 hover:text-neutral-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <span className={`inline-block px-3 py-1 rounded text-xs font-medium capitalize ${STATUS_STYLES[detailOrder.status] || ""}`}>{detailOrder.status}</span>
                <p className="text-xs text-neutral-400">
                  {new Date(detailOrder.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>

              <div className="bg-neutral-50 rounded-[var(--radius-md)] p-4 space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Customer</h3>
                <p className="text-sm text-neutral-900">{detailOrder.customer_name}</p>
                <p className="text-sm text-neutral-500">{detailOrder.customer_email}</p>
                {detailOrder.customer_phone && <p className="text-sm text-neutral-500">{detailOrder.customer_phone}</p>}
              </div>

              {detailOrder.shipping_address && (
                <div className="bg-neutral-50 rounded-[var(--radius-md)] p-4 space-y-1">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500">Shipping Address</h3>
                  <p className="text-sm text-neutral-900">{detailOrder.shipping_address.line1}</p>
                  {detailOrder.shipping_address.line2 && <p className="text-sm text-neutral-500">{detailOrder.shipping_address.line2}</p>}
                  <p className="text-sm text-neutral-500">
                    {detailOrder.shipping_address.city}, {detailOrder.shipping_address.state} {detailOrder.shipping_address.pincode}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">Items</h3>
                {detailOrder.items && detailOrder.items.length > 0 ? (
                  <div className="space-y-2">
                    {detailOrder.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                        <div>
                          <p className="text-sm text-neutral-900 font-medium">
                            {item.variant_size && item.variant_color
                              ? `${item.variant_size} / ${item.variant_color}`
                              : "Variant"}
                          </p>
                          <p className="text-xs text-neutral-400">Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}</p>
                        </div>
                        <p className="text-sm text-neutral-900 font-medium">₹{Number(item.total_price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-400">No items</p>
                )}
              </div>

              <div className="border-t border-neutral-200 pt-4 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span className="text-neutral-900">₹{Number(detailOrder.subtotal).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                {Number(detailOrder.discount_amount) > 0 && (
                  <div className="flex justify-between text-sm"><span className="text-green-600">Discount</span><span className="text-green-600">-₹{Number(detailOrder.discount_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
                )}
                <div className="flex justify-between text-sm"><span className="text-neutral-500">Shipping</span><span className="text-neutral-900">{Number(detailOrder.shipping_amount) === 0 ? "Free" : `₹${Number(detailOrder.shipping_amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}</span></div>
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-neutral-200"><span className="text-neutral-900">Total</span><span className="text-neutral-900">₹{Number(detailOrder.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {(ALLOWED_TRANSITIONS[detailOrder.status] || []).map((nextStatus) => (
                    <button key={nextStatus} onClick={() => updateStatus(nextStatus)} disabled={updatingStatus}
                      className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                        nextStatus === "failed" || nextStatus === "cancelled"
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : nextStatus === "delivered"
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                      }`}
                    >
                      Mark as {nextStatus}
                    </button>
                  ))}
                  {ALLOWED_TRANSITIONS[detailOrder.status]?.length === 0 && (
                    <p className="text-xs text-neutral-400">No further transitions allowed</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute top-0 right-0 h-full w-full max-w-xl bg-white p-12 text-center text-sm text-neutral-400">Loading order details...</div>
        </div>
      )}
    </div>
  );
}
