'use server';

import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getCart() {
  const user = await validateSession();
  if (!user) return [];

  return prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function addToCart(productId: number, quantity: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: '商品不存在' };
  if (product.stock <= 0) return { error: '商品已售罄' };

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  const newQty = (existing?.quantity || 0) + quantity;
  if (newQty > product.stock) {
    return { error: `库存不足，最多可添加 ${product.stock} 件` };
  }

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty },
    });
  } else {
    await prisma.cartItem.create({
      data: { userId: user.id, productId, quantity },
    });
  }

  revalidatePath('/cart');
}

export async function removeFromCart(productId: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const item = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (item) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  }

  revalidatePath('/cart');
}

export async function updateQuantity(productId: number, quantity: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || quantity > product.stock) {
    return { error: '库存不足' };
  }

  const item = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (!item) return { error: '购物车中没有该商品' };

  await prisma.cartItem.update({
    where: { id: item.id },
    data: { quantity },
  });

  revalidatePath('/cart');
}

export async function clearCart() {
  const user = await validateSession();
  if (!user) return;

  await prisma.cartItem.deleteMany({ where: { userId: user.id } });
}
