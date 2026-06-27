import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import AdminHeader from '@/components/layout/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '编辑商品 - 后台',
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: Number(id) } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <AdminHeader title="编辑商品" />
      <div className="max-w-2xl bg-white rounded-xl border border-gray-100 p-6">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
