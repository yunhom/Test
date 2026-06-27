import Image from 'next/image';
import Link from 'next/link';
import type { Product, Category } from '@prisma/client';

type ProductWithCategory = Product & { category: Category };

export default function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition group"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs text-primary bg-primary/5 px-2 py-0.5 rounded">
          {product.category.name}
        </span>
        <h3 className="mt-2 font-medium text-gray-900 line-clamp-1">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-danger">
            ¥{product.price.toFixed(2)}
          </span>
          {product.stock <= 0 ? (
            <span className="text-xs text-gray-400">已售罄</span>
          ) : product.stock <= 10 ? (
            <span className="text-xs text-warning">仅剩 {product.stock} 件</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
