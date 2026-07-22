import { redirect } from "next/navigation";

export default async function OldOrderConfirmationPage({
  params,
}: {
  params: Promise<{ order_number: string }>;
}) {
  const { order_number } = await params;
  redirect(`/order-confirmation/${order_number}`);
}
