'use client';

import { useState } from 'react';
import { cancelOrder } from '@/actions/order';
import { useRouter } from 'next/navigation';

export default function CancelButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCancel() {
    if (!confirm('确定要取消这个订单吗？')) return;
    setLoading(true);
    await cancelOrder(orderId);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
    >
      {loading ? '处理中...' : '取消订单'}
    </button>
  );
}
