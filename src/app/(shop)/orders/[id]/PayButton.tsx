'use client';

import { useState } from 'react';
import { payOrder } from '@/actions/order';
import { useRouter } from 'next/navigation';

export default function PayButton({ orderId }: { orderId: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handlePay() {
    setLoading(true);
    setError('');
    const result = await payOrder(orderId);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="px-6 py-2.5 bg-success text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50 transition cursor-pointer"
      >
        {loading ? '处理中...' : '确认支付'}
      </button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
