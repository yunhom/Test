import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/layout/AdminHeader';
import ProductTable from '@/components/admin/ProductTable';
import Pagination from '@/components/ui/Pagination';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '商品管理 - 后台',
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 10;

  const where = params.search
    ? { name: { contains: params.search } }
    : {};

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <AdminHeader title="商品管理" />
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition"
        >
          添加商品
        </Link>
      </div>

      <div className="mb-4">
        <form className="max-w-sm">
          <input
            name="search"
            defaultValue={params.search}
            placeholder="搜索商品名称..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </form>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
          暂无商品
        </div>
      ) : (
        <>
          <ProductTable products={products} />
          <div className="mt-4 text-sm text-gray-400 text-center">
            共 {total} 件商品
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            buildHref={(p: number) => {
              const sp = new URLSearchParams();
              if (params.search) sp.set('search', params.search);
              if (p > 1) sp.set('page', String(p));
              const q = sp.toString();
              return q ? `/admin/products?${q}` : '/admin/products';
            }}
          />
        </>
      )}
    </div>
  );
}
