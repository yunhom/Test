'use client';

import { useAuth } from '@/context/AuthContext';
import { CartProvider, useCart } from '@/context/CartContext';
import { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import Link from 'next/link';

function CheckoutContent() {
  const { items, totalAmount, loading, refresh } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handlePlaceOrder() {
    setSubmitting(true);
    setError('');

    const { createOrder } = await import('@/actions/order');
    const result = await createOrder();

    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    } else if (result?.order) {
      await refresh();
      router.push(`/orders/${result.order.id}`);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    redirect('/cart');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">确认订单</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100 font-medium text-gray-900">
          商品明细
        </div>
        {items.map((item) => (
          <div
            key={item.id}
            className="px-6 py-4 flex items-center justify-between border-b border-gray-50"
          >
            <div>
              <span className="font-medium text-gray-900">{item.product.name}</span>
              <span className="text-gray-400 ml-2">×{item.quantity}</span>
            </div>
            <span className="text-gray-700">
              ¥{(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex justify-between text-lg font-bold">
          <span>合计</span>
          <span className="text-danger">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/cart"
          className="flex-1 py-3 text-center border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition"
        >
          返回购物车
        </Link>
        <button
          onClick={handlePlaceOrder}
          disabled={submitting}
          className="flex-1 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer"
        >
          {submitting ? '提交中...' : '确认支付'}
        </button>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const { user, loading } = useAuth();

  if (!loading && !user) {
    redirect('/login');
  }

  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  );
}
