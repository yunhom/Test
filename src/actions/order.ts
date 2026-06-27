'use server';

import { prisma } from '@/lib/prisma';
import { validateSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createOrder() {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const wechatPayNo = generateWechatPayNo();

  try {
    // 所有读写操作在事务内完成，防止 TOCTOU 竞态
    const order = await prisma.$transaction(async (tx) => {
      // 1. 事务内重新读取购物车（防止事务外读到旧数据导致重复下单）
      const cartItems = await tx.cartItem.findMany({
        where: { userId: user.id },
        include: { product: true },
      });

      if (cartItems.length === 0) {
        throw new OrderError('购物车为空');
      }

      // 2. 使用条件更新扣库存（库存 >= 购买量），防止超卖
      for (const item of cartItems) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (result.count === 0) {
          // 扣减失败 → 回滚事务
          const product = await tx.product.findUnique({
            where: { id: item.productId },
            select: { name: true, stock: true },
          });
          throw new OrderError(
            `"${product?.name || '商品'}" 库存不足，仅剩 ${product?.stock ?? 0} 件`
          );
        }
      }

      // 3. 创建订单 + 订单项
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount,
          status: 'pending',
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

      // 4. 清空购物车
      await tx.cartItem.deleteMany({ where: { userId: user.id } });

      return newOrder;
    });

    revalidatePath('/orders');
    revalidatePath('/cart');

    return {
      order,
      wechatPay: {
        payNo: wechatPayNo,
        amount: order.totalAmount,
        orderId: order.id,
      },
    };
  } catch (e) {
    if (e instanceof OrderError) {
      return { error: e.message };
    }
    throw e;
  }
}

class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderError';
  }
}

export async function wechatPayOrder(orderId: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });

  if (!order) return { error: '订单不存在' };
  if (order.status !== 'pending') return { error: '订单状态不正确，无法支付' };

  // 条件更新：仅 status='pending' 时改为 'paid'，防止重复支付
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: 'pending' },
    data: { status: 'paid' },
  });

  if (result.count === 0) {
    return { error: '订单状态已变更，支付失败' };
  }

  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/admin/orders');
}

export async function payOrder(orderId: number) {
  return wechatPayOrder(orderId);
}

export async function cancelOrder(orderId: number) {
  const user = await validateSession();
  if (!user) return { error: '请先登录' };

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id, status: 'pending' },
    include: { items: true },
  });

  if (!order) return { error: '订单不存在或无法取消' };

  // 事务内：改状态 + 恢复库存
  await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: { id: orderId, status: 'pending' },
      data: { status: 'cancelled' },
    });

    if (result.count === 0) {
      throw new Error('订单状态已变更');
    }

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

  // 条件更新：仅当前状态匹配时才变更
  const result = await prisma.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status },
  });

  if (result.count === 0) {
    return { error: '订单状态已变更，操作失败' };
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
}

function generateWechatPayNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `WX${date}${random}`;
}
