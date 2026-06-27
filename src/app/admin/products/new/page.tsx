import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/layout/AdminHeader';
import ProductForm from '@/components/admin/ProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '添加商品 - 后台',
};

export default async function NewProductPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  return (
    <div>
      <AdminHeader title="添加商品" />
      <div className="max-w-2xl bg-white rounded-xl border border-gray-100 p-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
