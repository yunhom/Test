import type { Product, Category } from '@prisma/client';
import ProductCard from './ProductCard';

type ProductWithCategory = Product & { category: Category };

export default function ProductGrid({ products }: { products: ProductWithCategory[] }) {
  return (
    <div className="grid grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
