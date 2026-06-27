'use server';

import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createOrder() {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return { error: '购物车为空' };
  }

  // 验证库存
  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      return { error: `"${item.product.name}" 库存不足，仅剩 ${item.product.stock} 件` };
    }
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // 使用事务：创建订单 + 订单项 + 减库存 + 清空购物车
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: user.id,
        totalAmount,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            productPrice: item.product.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // 减库存
    for (const item of cartItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 清空购物车
    await tx.cartItem.deleteMany({ where: { userId: user.id } });

    return newOrder;
  });

  revalidatePath('/orders');
  revalidatePath('/cart');

  return { order };
}

export async function payOrder(orderId: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });

  if (!order) return { error: '订单不存在' };
  if (order.status !== 'pending') return { error: '订单状态不正确' };

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'paid' },
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/admin/orders');
}

export async function cancelOrder(orderId: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: true },
  });

  if (!order) return { error: '订单不存在' };
  if (order.status !== 'pending') return { error: '只能取消待支付订单' };

  // 恢复库存
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  });

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/admin/orders');
}

export async function getOrders() {
  const user = await validateSession();
  if (!user) return [];

  return prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getOrder(orderId: number) {
  const user = await validateSession();
  if (!user) return null;

  return prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: { items: { include: { product: true } } },
  });
}

export async function updateOrderStatus(orderId: number, status: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { error: '订单不存在' };

  const validTransitions: Record<string, string[]> = {
    pending: ['paid', 'cancelled'],
    paid: ['shipped', 'cancelled'],
    shipped: ['completed'],
  };

  const allowed = validTransitions[order.status];
  if (!allowed || !allowed.includes(status)) {
    return { error: `不能从 ${order.status} 变更为 ${status}` };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}
