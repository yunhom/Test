import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

// GET /api/cart — 获取当前用户购物车
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const totalAmount = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return NextResponse.json({ items, totalAmount, itemCount });
}

const addSchema = z.object({
  productId: z.number().int().positive('无效的商品ID'),
  quantity: z.number().int().min(1, '数量至少为1'),
});

// POST /api/cart — 加入购物车
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }

  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;

  try {
    // 事务内完成：查库存 → 查已有项 → 更新/创建，防止 TOCTOU 竞态
    const item = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        throw new CartError('商品不存在', 404);
      }
      if (product.stock <= 0) {
        throw new CartError('商品已售罄', 400);
      }

      const existing = await tx.cartItem.findUnique({
        where: { userId_productId: { userId: user!.id, productId } },
      });

      const newQty = (existing?.quantity || 0) + quantity;
      if (newQty > product.stock) {
        throw new CartError(`库存不足，最多可添加 ${product.stock} 件`, 400);
      }

      return existing
        ? tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: newQty },
            include: { product: { include: { category: true } } },
          })
        : tx.cartItem.create({
            data: { userId: user!.id, productId, quantity },
            include: { product: { include: { category: true } } },
          });
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    if (e instanceof CartError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    throw e;
  }
}

class CartError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CartError';
    this.status = status;
  }
}
