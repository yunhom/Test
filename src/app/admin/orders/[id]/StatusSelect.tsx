'use client';

import { useState } from 'react';
import { updateOrderStatus } from '@/actions/order';
import { useRouter } from 'next/navigation';

const STATUS_TRANSITIONS: Record<string, { key: string; label: string }[]> = {
  pending: [
    { key: 'paid', label: '标记为已支付' },
    { key: 'cancelled', label: '取消订单' },
  ],
  paid: [
    { key: 'shipped', label: '标记为已发货' },
    { key: 'cancelled', label: '取消订单' },
  ],
  shipped: [{ key: 'completed', label: '标记为已完成' }],
};

export default function StatusSelect({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const router = useRouter();

  const transitions = STATUS_TRANSITIONS[currentStatus] || [];

  if (transitions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <div className="text-sm text-gray-400">该订单状态无法变更</div>
      </div>
    );
  }

  async function handleUpdate(status: string) {
    setLoading(status);
    setError('');
    const result = await updateOrderStatus(orderId, status);
    if (result?.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
    setLoading('');
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-medium mb-4">更新状态</h3>

      {error && (
        <div className="mb-3 p-3 rounded-lg bg-danger/10 text-danger text-sm">{error}</div>
      )}

      <div className="space-y-2">
        {transitions.map((t) => (
          <button
            key={t.key}
            onClick={() => handleUpdate(t.key)}
            disabled={loading !== ''}
            className="w-full px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer"
          >
            {loading === t.key ? '处理中...' : t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
