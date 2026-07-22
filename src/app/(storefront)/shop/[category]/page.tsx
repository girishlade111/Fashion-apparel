import { redirect } from "next/navigation";

export default function CategoryRedirect({
  params,
}: {
  params: { category: string };
}) {
  redirect(`/shop?category=${params.category}`);
}
