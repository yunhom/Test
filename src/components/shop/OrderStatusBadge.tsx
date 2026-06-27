export default function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: '待支付', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    paid: { label: '已支付', className: 'bg-blue-50 text-blue-700 border-blue-200' },
    shipped: { label: '已发货', className: 'bg-purple-50 text-purple-700 border-purple-200' },
    completed: { label: '已完成', className: 'bg-green-50 text-green-700 border-green-200' },
    cancelled: { label: '已取消', className: 'bg-gray-50 text-gray-500 border-gray-200' },
  };

  const item = map[status] || { label: status, className: 'bg-gray-50 text-gray-500 border-gray-200' };

  return (
    <span className={`px-2.5 py-0.5 text-xs rounded-full border ${item.className}`}>
      {item.label}
    </span>
  );
}
