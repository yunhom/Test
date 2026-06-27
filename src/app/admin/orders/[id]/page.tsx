import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AdminHeader from '@/components/layout/AdminHeader';
import OrderStatusBadge from '@/components/shop/OrderStatusBadge';
import StatusSelect from './StatusSelect';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return { title: `订单 #${(await params).id} - 后台` };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      user: { select: { username: true, email: true } },
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();

  return (
    <div>
      <AdminHeader title={`订单 #${order.id}`} />

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-sm text-gray-400 mb-1">用户</div>
          <div className="font-medium">{order.user.username}</div>
          <div className="text-sm text-gray-400">{order.user.email}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-sm text-gray-400 mb-1">金额</div>
          <div className="text-2xl font-bold text-danger">¥{order.totalAmount.toFixed(2)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="text-sm text-gray-400 mb-2">状态</div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-8">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-medium">商品明细</div>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="px-6 py-4 flex items-center justify-between border-b border-gray-50"
            >
              <div>
                <span className="font-medium text-gray-900">{item.productName}</span>
                <span className="text-gray-400 ml-2">×{item.quantity}</span>
              </div>
              <span className="text-gray-700">
                ¥{(item.productPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <StatusSelect orderId={order.id} currentStatus={order.status} />
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="text-sm text-gray-400 mb-1">下单时间</div>
            <div className="text-sm text-gray-900">
              {order.createdAt.toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
