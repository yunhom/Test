import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import ProductGrid from '@/components/shop/ProductGrid';
import ProductSearch from '@/components/shop/ProductSearch';
import CategoryFilter from '@/components/shop/CategoryFilter';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 9;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const search = params.search;
  const categoryId = params.category ? Number(params.category) : undefined;

  const where = {
    ...(search && { name: { contains: search } }),
    ...(categoryId && { categoryId }),
  };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div>
      {/* 搜索与筛选 */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">发现好物</h1>
          <div className="space-y-4">
            <div className="max-w-md">
              <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
                <ProductSearch />
              </Suspense>
            </div>
            <Suspense fallback={<div className="h-10 bg-gray-100 rounded-lg animate-pulse" />}>
              <CategoryFilter categories={categories} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* 商品网格 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg mb-2">未找到相关商品</p>
            <p className="text-gray-300 text-sm">试试其他搜索词或选择不同分类</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-400 mb-6">共 {total} 件商品</p>
            <ProductGrid products={products} />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              buildHref={(p: number) => {
                const sp = new URLSearchParams();
                if (search) sp.set('search', search);
                if (categoryId) sp.set('category', String(categoryId));
                if (p > 1) sp.set('page', String(p));
                const q = sp.toString();
                return q ? `/?${q}` : '/';
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
