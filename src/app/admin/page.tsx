import { requireAdmin } from '@/lib/auth';
import AdminHeader from '@/components/layout/AdminHeader';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AdminDashboard() {
  await requireAdmin();

  const [totalProducts, totalOrders, totalUsers, pendingOrders, revenueResult] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'customer' } }),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: { not: 'cancelled' } },
      }),
    ]);

  const stats = [
    { label: '商品总数', value: totalProducts, href: '/admin/products', color: 'bg-blue-50 text-blue-600' },
    { label: '订单总数', value: totalOrders, href: '/admin/orders', color: 'bg-green-50 text-green-600' },
    { label: '用户数量', value: totalUsers, color: 'bg-purple-50 text-purple-600' },
    { label: '待处理订单', value: pendingOrders, href: '/admin/orders?status=pending', color: 'bg-orange-50 text-orange-600' },
  ];

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { username: true } } },
  });

  return (
    <div>
      <AdminHeader title="仪表盘" />

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 border border-gray-100">
            <div className={`inline-block px-3 py-1 text-sm rounded-lg ${stat.color} mb-3`}>
              {stat.label}
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            {stat.href && (
              <Link href={stat.href} className="text-xs text-primary hover:underline mt-2 inline-block">
                查看详情 →
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">最近订单</h2>
          <Link href="/admin/orders" className="text-sm text-primary hover:underline">
            查看全部
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400">暂无订单</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-50">
                <th className="px-6 py-3">订单号</th>
                <th className="px-6 py-3">用户</th>
                <th className="px-6 py-3">金额</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-50 text-sm">
                  <td className="px-6 py-3 font-medium">#{order.id}</td>
                  <td className="px-6 py-3 text-gray-600">{order.user.username}</td>
                  <td className="px-6 py-3">¥{order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-3 text-gray-400">
                    {order.createdAt.toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    pending: { label: '待支付', className: 'bg-yellow-50 text-yellow-700' },
    paid: { label: '已支付', className: 'bg-blue-50 text-blue-700' },
    shipped: { label: '已发货', className: 'bg-purple-50 text-purple-700' },
    completed: { label: '已完成', className: 'bg-green-50 text-green-700' },
    cancelled: { label: '已取消', className: 'bg-gray-50 text-gray-500' },
  };
  const item = map[status] || { label: status, className: 'bg-gray-50 text-gray-500' };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${item.className}`}>
      {item.label}
    </span>
  );
}
