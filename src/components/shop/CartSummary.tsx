'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartSummary() {
  const { totalAmount, itemCount } = useCart();

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>商品数量</span>
          <span>{itemCount} 件</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
          <span>合计</span>
          <span className="text-danger">¥{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className={`block w-full mt-4 py-3 text-center rounded-xl font-medium transition ${
          itemCount > 0
            ? 'bg-primary text-white hover:bg-primary-dark'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
        }`}
      >
        去结算
      </Link>
    </div>
  );
}
