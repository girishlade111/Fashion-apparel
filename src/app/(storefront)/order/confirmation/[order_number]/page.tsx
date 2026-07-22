import { redirect } from "next/navigation";

export default function OldOrderConfirmationPage({
  params,
}: {
  params: Promise<{ order_number: string }>;
}) {
  const p = await params;
  redirect(`/order-confirmation/${p.order_number}`);
}
