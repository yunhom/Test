import { prisma } from '@/lib/prisma';
import ProductGrid from '@/components/shop/ProductGrid';
import CategoryFilter from '@/components/shop/CategoryFilter';
import ProductSearch from '@/components/shop/ProductSearch';
import Pagination from '@/components/ui/Pagination';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '全部商品',
};

const PAGE_SIZE = 12;

export default async function ProductsPage({
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">全部商品</h1>

      <div className="space-y-4 mb-6">
        <div className="max-w-md">
          <ProductSearch />
        </div>
        <CategoryFilter categories={categories} />
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-400 text-lg mb-2">未找到相关商品</p>
          <p className="text-gray-300 text-sm">试试其他搜索词或选择不同分类</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-4">共 {total} 件商品</p>
          <ProductGrid products={products} />
          <Pagination currentPage={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
