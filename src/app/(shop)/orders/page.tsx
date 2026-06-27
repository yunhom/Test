import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OrderCard from '@/components/shop/OrderCard';
import Pagination from '@/components/ui/Pagination';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '我的订单',
};

const PAGE_SIZE = 10;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await requireAuth();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      include: { items: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where: { userId: user.id } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">我的订单</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-400 text-lg mb-6">暂无订单</p>
          <Link
            href="/products"
            className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition"
          >
            去逛逛
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">共 {total} 个订单</p>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildHref={(p: number) => {
              const sp = new URLSearchParams();
              if (p > 1) sp.set('page', String(p));
              const q = sp.toString();
              return q ? `/orders?${q}` : '/orders';
            }}
          />
        </>
      )}
    </div>
  );
}
