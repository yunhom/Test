import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AdminHeader from '@/components/layout/AdminHeader';
import CategoryForm from './CategoryForm';
import CategoryTable from './CategoryTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '分类管理 - 后台',
};

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return (
    <div>
      <AdminHeader title="分类管理" />

      <div className="grid grid-cols-[1fr_360px] gap-8">
        <CategoryTable categories={categories} />
        <CategoryForm />
      </div>
    </div>
  );
}
