import { createAdminClient } from "@/lib/supabase/server";
import { getServerEnvVar } from "@/lib/env";

function buildHtmlContent(params: {
  orderNumber: string;
  customerName: string;
  items: Array<{ productName: string; variantLabel: string; unitPrice: number; quantity: number }>;
  subtotal: string;
  discountAmount: string;
  shippingFee: string;
  total: string;
}): string {
  const { orderNumber, customerName, items, subtotal, discountAmount, shippingFee, total } = params;

  const itemRows = items
    .map(
      (it) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1c1c1c;">
            ${escapeHtml(it.productName)}
            <div style="font-size: 12px; color: #888; margin-top: 2px;">${escapeHtml(it.variantLabel)}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1c1c1c; text-align: center;">${it.quantity}</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #1c1c1c; text-align: right;">₹${it.unitPrice.toFixed(2)}</td>
        </tr>`,
    )
    .join("");

  const discountRow =
    Number(discountAmount) > 0
      ? `<tr><td style="padding: 6px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #888;">Discount</td><td style="padding: 6px 0; font-family: 'Inter', Arial, sans-serif; font-size: 14px; color: #888; text-align: right;">−₹${discountAmount}</td></tr>`
      : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background:#f7f5f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f5f4;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; max-width:560px;">
        <tr><td style="padding:32px 32px 0;">
          <h1 style="font-family:'Playfair Display', Georgia, serif; font-size:24px; font-weight:600; color:#1c1c1c; margin:0 0 4px;">Fashion Apparel</h1>
          <p style="font-family:'Inter', Arial, sans-serif; font-size:13px; color:#888; margin:0;">Order Confirmation</p>
        </td></tr>
        <tr><td style="padding:24px 32px;">
          <p style="font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1c1c1c; margin:0 0 16px;">Hi ${escapeHtml(customerName)},</p>
          <p style="font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1c1c1c; margin:0 0 4px;">Thank you for your order! Your order has been confirmed and is being processed.</p>
          <p style="font-family:'Inter', Arial, sans-serif; font-size:15px; color:#1c1c1c; margin:0 0 24px;"><strong>Order #${escapeHtml(orderNumber)}</strong></p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead>
              <tr style="background:#1c1c1c;">
                <th style="padding:10px 12px; font-family:'Inter', Arial, sans-serif; font-size:12px; font-weight:600; color:#ffffff; text-align:left;">Item</th>
                <th style="padding:10px 12px; font-family:'Inter', Arial, sans-serif; font-size:12px; font-weight:600; color:#ffffff; text-align:center;">Qty</th>
                <th style="padding:10px 12px; font-family:'Inter', Arial, sans-serif; font-size:12px; font-weight:600; color:#ffffff; text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            <tr><td style="padding:6px 0; font-family:'Inter', Arial, sans-serif; font-size:14px; color:#888;">Subtotal</td><td style="padding:6px 0; font-family:'Inter', Arial, sans-serif; font-size:14px; color:#888; text-align:right;">₹${subtotal}</td></tr>
            ${discountRow}
            <tr><td style="padding:6px 0; font-family:'Inter', Arial, sans-serif; font-size:14px; color:#888;">Shipping</td><td style="padding:6px 0; font-family:'Inter', Arial, sans-serif; font-size:14px; color:#888; text-align:right;">₹${shippingFee}</td></tr>
            <tr><td style="padding:10px 0 0; border-top:2px solid #1c1c1c; font-family:'Inter', Arial, sans-serif; font-size:17px; font-weight:700; color:#1c1c1c;">Total Paid</td><td style="padding:10px 0 0; border-top:2px solid #1c1c1c; font-family:'Inter', Arial, sans-serif; font-size:17px; font-weight:700; color:#1c1c1c; text-align:right;">₹${total}</td></tr>
          </table>

          <p style="font-family:'Inter', Arial, sans-serif; font-size:14px; color:#888; margin:24px 0 0; line-height:1.5;">
            Your order will be shipped within 2–3 business days. You will receive a shipping confirmation with tracking details once dispatched.
          </p>

          <p style="font-family:'Inter', Arial, sans-serif; font-size:14px; color:#888; margin:20px 0 0; line-height:1.5;">
            Questions about your order? Reply to this email and we'll be happy to help.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px; border-top:1px solid #e5e5e5;">
          <p style="font-family:'Inter', Arial, sans-serif; font-size:12px; color:#aaa; margin:0;">Fashion Apparel · Premium Fashion</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatINR(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const supabase = createAdminClient();

  const orderResult = await (supabase.from("orders") as any)
    .select("order_number, customer_name, customer_email, subtotal, discount_amount, shipping_fee, total")
    .eq("id", orderId)
    .single();
  const order = orderResult.data as {
    order_number: string;
    customer_name: string;
    customer_email: string;
    subtotal: number;
    discount_amount: number;
    shipping_fee: number;
    total: number;
  } | null;

  if (!order) {
    console.error(`Email: order ${orderId} not found`);
    return;
  }

  const itemsResult = await (supabase.from("order_items") as any)
    .select("product_name_snapshot, variant_label_snapshot, unit_price_snapshot, quantity")
    .eq("order_id", orderId);
  const items: Array<{
    product_name_snapshot: string;
    variant_label_snapshot: string;
    unit_price_snapshot: number;
    quantity: number;
  }> = itemsResult.data || [];

  const apiKey = getServerEnvVar("RESEND_API_KEY");

  const html = buildHtmlContent({
    orderNumber: order.order_number,
    customerName: order.customer_name,
    items: items.map((it) => ({
      productName: it.product_name_snapshot,
      variantLabel: it.variant_label_snapshot,
      unitPrice: it.unit_price_snapshot,
      quantity: it.quantity,
    })),
    subtotal: formatINR(order.subtotal),
    discountAmount: formatINR(order.discount_amount),
    shippingFee: formatINR(order.shipping_fee),
    total: formatINR(order.total),
  });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Fashion Apparel <orders@fashionapparel.in>",
      to: [order.customer_email],
      subject: `Order Confirmed — #${order.order_number}`,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`Email send failed for order ${orderId}:`, err);
  }
}
