'use client';

import { useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import CartItemRow from '@/components/shop/CartItemRow';
import CartSummary from '@/components/shop/CartSummary';
import Link from 'next/link';
import { redirect } from 'next/navigation';

function CartContent() {
  const { items, loading } = useCart();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">购物车</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-400 text-lg mb-6">购物车是空的</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[1fr_300px] gap-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {items.map((item) => (
              <CartItemRow key={item.id} item={item} />
            ))}
          </div>
          <div>
            <CartSummary />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    redirect('/login');
  }

  return (
    <CartProvider>
      <CartContent />
    </CartProvider>
  );
}
