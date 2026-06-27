import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/layout/AdminHeader';
import Pagination from '@/components/ui/Pagination';
import Link from 'next/link';
import OrderStatusBadge from '@/components/shop/OrderStatusBadge';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '订单管理 - 后台',
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 10;

  const where = params.status ? { status: params.status } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { username: true, email: true } },
        items: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const statusCounts = await prisma.order.groupBy({
    by: ['status'],
    _count: true,
  });

  const counts: Record<string, number> = {};
  statusCounts.forEach((g) => { counts[g.status] = g._count; });

  const statusTabs = [
    { key: '', label: '全部', count: Object.values(counts).reduce((a, b) => a + b, 0) },
    { key: 'pending', label: '待支付', count: counts.pending || 0 },
    { key: 'paid', label: '已支付', count: counts.paid || 0 },
    { key: 'shipped', label: '已发货', count: counts.shipped || 0 },
    { key: 'completed', label: '已完成', count: counts.completed || 0 },
    { key: 'cancelled', label: '已取消', count: counts.cancelled || 0 },
  ];

  return (
    <div>
      <AdminHeader title="订单管理" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {statusTabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/orders${tab.key ? `?status=${tab.key}` : ''}`}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              params.status === tab.key || (!params.status && !tab.key)
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className="ml-1 opacity-60">({tab.count})</span>
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          暂无订单
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="px-6 py-4">订单号</th>
                <th className="px-6 py-4">用户</th>
                <th className="px-6 py-4">商品数</th>
                <th className="px-6 py-4">金额</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">时间</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium">#{order.id}</td>
                  <td className="px-6 py-4 text-gray-600">{order.user.username}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {order.items.reduce((sum, i) => sum + i.quantity, 0)} 件
                  </td>
                  <td className="px-6 py-4 font-medium">¥{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {order.createdAt.toLocaleDateString('zh-CN')}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-primary hover:underline text-xs"
                    >
                      详情
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        buildHref={(p: number) => {
          const sp = new URLSearchParams();
          if (params.status) sp.set('status', params.status);
          if (p > 1) sp.set('page', String(p));
          const q = sp.toString();
          return q ? `/admin/orders?${q}` : '/admin/orders';
        }}
      />
    </div>
  );
}
