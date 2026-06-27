'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getCart } from '@/actions/cart';
import type { CartItem, Product, Category } from '@prisma/client';

type CartItemWithProduct = CartItem & { product: Product & { category: Category } };

type CartContextType = {
  items: CartItemWithProduct[];
  loading: boolean;
  refresh: () => Promise<void>;
  itemCount: number;
  totalAmount: number;
};

const CartContext = createContext<CartContextType>({
  items: [],
  loading: true,
  refresh: async () => {},
  itemCount: 0,
  totalAmount: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const cart = await getCart();
    setItems(cart);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ items, loading, refresh, itemCount, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
