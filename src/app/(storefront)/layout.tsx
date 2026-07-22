import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";
import Navbar from "@/components/storefront/Navbar";
import CartDrawer from "@/components/storefront/CartDrawer";
import Footer from "@/components/storefront/Footer";
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
      <WishlistProvider>
        <Navbar categories={categories} />
        <CartDrawer />
        {children}
        <Footer categories={categories} />
      </WishlistProvider>
    </CartProvider>
  );
}
