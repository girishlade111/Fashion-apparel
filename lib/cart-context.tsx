"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type CartContextValue = {
  itemCount: number;
  refreshCart: () => Promise<void>;
  loading: boolean;
};

const CartContext = createContext<CartContextValue>({
  itemCount: 0,
  refreshCart: async () => {},
  loading: true,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const count = (data.items || []).reduce(
          (sum: number, i: any) => sum + i.quantity,
          0,
        );
        setItemCount(count);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
