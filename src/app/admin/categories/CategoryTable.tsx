import DeleteCategoryButton from './DeleteCategoryButton';
import type { Category } from '@prisma/client';

type CategoryWithCount = Category & { _count: { products: number } };

export default function CategoryTable({
  categories,
}: {
  categories: CategoryWithCount[];
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
            <th className="px-6 py-4">分类名称</th>
            <th className="px-6 py-4">描述</th>
            <th className="px-6 py-4">商品数</th>
            <th className="px-6 py-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id} className="border-b border-gray-50 text-sm">
              <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
              <td className="px-6 py-4 text-gray-500">{cat.description || '-'}</td>
              <td className="px-6 py-4 text-gray-600">{cat._count.products}</td>
              <td className="px-6 py-4">
                <DeleteCategoryButton
                  categoryId={cat.id}
                  categoryName={cat.name}
                  productCount={cat._count.products}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
