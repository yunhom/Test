import Link from 'next/link';
import OrderStatusBadge from './OrderStatusBadge';
import type { Order, OrderItem } from '@prisma/client';

type OrderWithItems = Order & { items: OrderItem[] };

export default function OrderCard({ order }: { order: OrderWithItems }) {
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">订单号</span>
          <span className="font-medium text-gray-900">#{order.id}</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-400">{itemCount} 件商品</span>
          <span className="mx-2 text-gray-200">|</span>
          <span className="text-gray-400">{order.createdAt.toLocaleDateString('zh-CN')}</span>
        </div>
        <span className="text-lg font-bold text-gray-900">
          ¥{order.totalAmount.toFixed(2)}
        </span>
      </div>
    </Link>
  );
}
