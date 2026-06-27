'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({
  productId,
  stock,
}: {
  productId: number;
  stock: number;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleAdd() {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setMessage('');

    // Dynamic import to load cart action (will be created in Phase 5)
    const { addToCart } = await import('@/actions/cart');
    const result = await addToCart(productId, quantity);

    if (result?.error) {
      setMessage(result.error);
    } else {
      setMessage('已加入购物车');
      setTimeout(() => setMessage(''), 2000);
    }
    setLoading(false);
  }

  if (stock <= 0) {
    return (
      <button
        disabled
        className="w-full py-3 bg-gray-200 text-gray-400 rounded-xl font-medium cursor-not-allowed"
      >
        已售罄
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-sm text-gray-500">数量</span>
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            -
          </button>
          <span className="px-4 py-1.5 text-sm font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark disabled:opacity-50 transition cursor-pointer"
      >
        {loading ? '添加中...' : '加入购物车'}
      </button>

      {message && (
        <p className={`mt-2 text-sm text-center ${message.includes('已') ? 'text-success' : 'text-danger'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
