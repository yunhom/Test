import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import AddToCartButton from '@/components/shop/AddToCartButton';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return { title: '商品未找到' };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { category: true },
  });

  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-primary transition">首页</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-primary transition">全部商品</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.categoryId}`}
          className="hover:text-primary transition"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      <div className="grid grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="50vw"
              unoptimized
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl">
              📦
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <Link
            href={`/products?category=${product.categoryId}`}
            className="text-sm text-primary bg-primary/5 px-3 py-1 rounded-full"
          >
            {product.category.name}
          </Link>
          <h1 className="text-3xl font-bold mt-3 mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-danger mt-4">
            ¥{product.price.toFixed(2)}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">库存：</span>
            {product.stock <= 0 ? (
              <span className="text-sm text-danger">已售罄</span>
            ) : (
              <span className="text-sm text-gray-900">{product.stock} 件</span>
            )}
          </div>

          <hr className="my-6 border-gray-100" />

          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">商品描述</h3>
            <p className="text-gray-500 leading-relaxed">{product.description}</p>
          </div>

          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>
    </div>
  );
}
