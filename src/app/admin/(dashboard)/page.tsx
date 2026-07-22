import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  const { count: orderCount } = await (supabase.from("orders") as any)
    .select("id", { count: "exact", head: true });

  const { data: revenueData } = await (supabase.from("orders") as any)
    .select("total")
    .in("status", ["paid", "delivered", "shipped"]);
  const totalRevenue = (revenueData || []).reduce((sum: number, o: any) => sum + Number(o.total), 0);

  const { data: lowStock } = await (supabase.from("product_variants") as any)
    .select("id, sku, stock_quantity, size, color, product_id")
    .lt("stock_quantity", 5)
    .gt("stock_quantity", 0)
    .order("stock_quantity", { ascending: true })
    .limit(10);

  let lowStockProducts: Record<string, string> = {};
  if (lowStock && lowStock.length > 0) {
    const pids = [...new Set(lowStock.map((v: any) => v.product_id))];
    const { data: prods } = await (supabase.from("products") as any)
      .select("id, name")
      .in("id", pids);
    for (const p of prods || []) lowStockProducts[p.id] = p.name;
  }

  const { data: outOfStock } = await (supabase.from("product_variants") as any)
    .select("id, product_id")
    .eq("stock_quantity", 0)
    .limit(1);

  const { data: recentOrders } = await (supabase.from("orders") as any)
    .select("id, order_number, customer_name, total, status, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-blue-100 text-blue-700",
    shipped: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    cancelled: "bg-neutral-100 text-neutral-500",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-6">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Orders</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{orderCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-6">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Total Revenue</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">₹{totalRevenue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-6">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Low Stock Variants</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-amber-600">{lowStock?.length ?? 0}</p>
            {outOfStock && outOfStock.length > 0 && (
              <span className="text-xs text-red-500 font-medium">({outOfStock.length} out of stock)</span>
            )}
          </div>
        </div>
      </div>

      {lowStock && lowStock.length > 0 && (
        <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200 p-6 mb-8">
          <h2 className="font-heading text-base font-semibold text-neutral-900 mb-4">Low Stock Alerts</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500">Product</th>
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500">Size</th>
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500">Color</th>
                  <th className="text-left py-2 pr-4 font-medium text-neutral-500">SKU</th>
                  <th className="text-right py-2 font-medium text-neutral-500">Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((v: any) => (
                  <tr key={v.id} className="border-b border-neutral-50">
                    <td className="py-2 pr-4 text-neutral-900">{lowStockProducts[v.product_id] || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-600">{v.size || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-600">{v.color || "—"}</td>
                    <td className="py-2 pr-4 text-neutral-500 font-mono text-xs">{v.sku || "—"}</td>
                    <td className="py-2 text-right">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        v.stock_quantity === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {v.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[var(--radius-md)] border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100">
          <h2 className="font-heading text-base font-semibold text-neutral-900">Recent Orders</h2>
        </div>
        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Order</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Customer</th>
                  <th className="text-left px-6 py-3 font-medium text-neutral-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-neutral-500">Total</th>
                  <th className="text-right px-6 py-3 font-medium text-neutral-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o: any) => (
                  <tr key={o.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="px-6 py-3 font-mono text-xs text-neutral-900">#{o.order_number}</td>
                    <td className="px-6 py-3 text-neutral-700">{o.customer_name}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${statusStyles[o.status] || "bg-neutral-100 text-neutral-600"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-neutral-900">₹{Number(o.total).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-3 text-right text-neutral-500 text-xs">
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-neutral-400">
            No orders yet. When customers place orders, they will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
