'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { updateQuantity, removeFromCart } from '@/actions/cart';
import { useCart } from '@/context/CartContext';
import type { CartItem, Product, Category } from '@prisma/client';

type CartItemWithProduct = CartItem & { product: Product & { category: Category } };

export default function CartItemRow({ item }: { item: CartItemWithProduct }) {
  const { refresh } = useCart();
  const [loading, setLoading] = useState(false);
  const { product, quantity } = item;

  async function handleUpdate(newQty: number) {
    if (newQty === quantity) return;
    setLoading(true);
    await updateQuantity(product.id, newQty);
    await refresh();
    setLoading(false);
  }

  async function handleRemove() {
    setLoading(true);
    await removeFromCart(product.id);
    await refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100">
      <Link href={`/products/${product.id}`} className="shrink-0">
        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="80px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl">
              📦
            </div>
          )}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${product.id}`}
          className="font-medium text-gray-900 hover:text-primary transition line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-sm text-gray-400 mt-1">{product.category.name}</p>
        <p className="text-sm font-medium text-gray-900 mt-1">
          ¥{product.price.toFixed(2)}
        </p>
      </div>

      <div className="flex items-center border border-gray-300 rounded-lg">
        <button
          onClick={() => handleUpdate(quantity - 1)}
          disabled={loading}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
        >
          -
        </button>
        <span className="px-4 py-1.5 text-sm font-medium min-w-[3rem] text-center">
          {quantity}
        </span>
        <button
          onClick={() => handleUpdate(quantity + 1)}
          disabled={loading || quantity >= product.stock}
          className="px-3 py-1.5 text-gray-600 hover:bg-gray-50 disabled:opacity-30 cursor-pointer"
        >
          +
        </button>
      </div>

      <div className="text-right min-w-[5rem]">
        <p className="font-medium text-gray-900">
          ¥{(product.price * quantity).toFixed(2)}
        </p>
      </div>

      <button
        onClick={handleRemove}
        disabled={loading}
        className="text-gray-400 hover:text-danger transition cursor-pointer disabled:opacity-30"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>
  );
}
