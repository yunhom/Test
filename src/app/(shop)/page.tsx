import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/shop/ProductCard';

export default async function HomePage() {
  const [featuredProducts, categories] = await Promise.all([
    prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.category.findMany(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-primary-dark text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">发现好物，尽在迷你商城</h1>
          <p className="text-lg text-white/80 mb-8">精选品质商品，便捷购物体验</p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            立即选购
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">商品分类</h2>
        <div className="grid grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="bg-white rounded-xl p-6 text-center hover:shadow-md transition border border-gray-100"
            >
              <div className="text-3xl mb-2">
                {cat.name === '电子产品' ? '💻' :
                 cat.name === '服装鞋帽' ? '👗' :
                 cat.name === '食品饮料' ? '🍕' :
                 cat.name === '家居用品' ? '🏠' : '🛒'}
              </div>
              <div className="font-medium text-gray-900">{cat.name}</div>
              <div className="text-sm text-gray-400 mt-1">{cat.description}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">推荐商品</h2>
          <Link href="/products" className="text-sm text-primary hover:underline">
            查看全部 →
          </Link>
        </div>
        {featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">暂无商品</div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
