import { CartProvider } from "@/lib/cart-context";
import Navbar from "@/components/storefront/Navbar";
import { createAdminClient } from "@/lib/supabase/server";

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await (supabase.from("categories") as any)
    .select("name, slug")
    .order("name");
  return data || [];
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <CartProvider>
      <Navbar categories={categories} />
      {children}
    </CartProvider>
  );
}
