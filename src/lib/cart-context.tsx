"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export type CartItem = {
  id: string;
  variant_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
  };
  variant: {
    id: string;
    size: string;
    color: string;
    sku: string;
    price: number;
    inStock: boolean;
  };
  image: { url: string; alt_text: string | null } | null;
  line_total: number;
};

export type CartData = {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
};

type CartContextValue = CartData & {
  loading: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refreshCart: () => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  addToCart: (productId: string, variantId?: string | null, quantity?: number) => Promise<void>;
};

const CartContext = createContext<CartContextValue>({
  items: [],
  subtotal: 0,
  itemCount: 0,
  loading: true,
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  refreshCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  addToCart: async () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CartData>({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prevRef = useRef<CartData>(data);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const json = await res.json();
        const newData: CartData = {
          items: json.items || [],
          subtotal: json.subtotal || 0,
          itemCount: json.itemCount || 0,
        };
        setData(newData);
        prevRef.current = newData;
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    const prev = prevRef.current;
    const optimistic: CartData = {
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity, line_total: item.variant.price * quantity } : item,
      ),
      itemCount: prev.items.reduce((sum, i) => sum + (i.id === itemId ? quantity : i.quantity), 0),
      subtotal: prev.items.reduce(
        (sum, i) => sum + (i.id === itemId ? i.variant.price * quantity : i.line_total),
        0,
      ),
    };
    setData(optimistic);
    prevRef.current = optimistic;

    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_id: itemId, quantity }),
    });

    if (!res.ok) {
      setData(prev);
      prevRef.current = prev;
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to update quantity");
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    const prev = prevRef.current;
    const removed = prev.items.find((i) => i.id === itemId);
    const optimistic: CartData = {
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
      itemCount: prev.itemCount - (removed?.quantity || 0),
      subtotal: prev.subtotal - (removed?.line_total || 0),
    };
    setData(optimistic);
    prevRef.current = optimistic;

    const res = await fetch(`/api/cart?item_id=${itemId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      setData(prev);
      prevRef.current = prev;
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to remove item");
    }
  }, []);

  const addToCart = useCallback(
    async (productId: string, variantId?: string | null, quantity = 1) => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          variant_id: variantId || undefined,
          quantity,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add to cart");
      }

      await refreshCart();
    },
    [refreshCart],
  );

  return (
    <CartContext.Provider
      value={{
        ...data,
        loading,
        drawerOpen,
        openDrawer: () => setDrawerOpen(true),
        closeDrawer: () => setDrawerOpen(false),
        refreshCart,
        updateQuantity,
        removeItem,
        addToCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
