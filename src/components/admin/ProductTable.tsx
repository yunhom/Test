import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';
import type { Product, Category } from '@prisma/client';

type ProductWithCategory = Product & { category: Category };

export default function ProductTable({ products }: { products: ProductWithCategory[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
            <th className="px-6 py-4">商品</th>
            <th className="px-6 py-4">分类</th>
            <th className="px-6 py-4">价格</th>
            <th className="px-6 py-4">库存</th>
            <th className="px-6 py-4">操作</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b border-gray-50 text-sm hover:bg-gray-50/50">
              <td className="px-6 py-4">
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-gray-400 text-xs mt-0.5 line-clamp-1">{product.description}</div>
              </td>
              <td className="px-6 py-4 text-gray-600">{product.category.name}</td>
              <td className="px-6 py-4 font-medium">¥{product.price.toFixed(2)}</td>
              <td className="px-6 py-4">
                <span className={product.stock <= 10 ? 'text-warning' : 'text-gray-600'}>
                  {product.stock}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-primary hover:underline text-xs"
                  >
                    编辑
                  </Link>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
