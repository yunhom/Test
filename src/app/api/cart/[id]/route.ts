import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

async function getCartItem(itemId: number, userId: number) {
  return prisma.cartItem.findFirst({
    where: { id: itemId, userId },
    include: { product: true },
  });
}

// PUT /api/cart/[id] — 修改数量
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 1) {
    return NextResponse.json({ error: '无效的ID' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const quantity = body?.quantity;
  if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
    return NextResponse.json({ error: '数量必须是整数' }, { status: 400 });
  }

  const item = await getCartItem(itemId, user.id);
  if (!item) {
    return NextResponse.json({ error: '购物车中没有该项' }, { status: 404 });
  }

  // quantity <= 0 视为删除
  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return NextResponse.json({ deleted: true });
  }

  if (quantity > item.product.stock) {
    return NextResponse.json(
      { error: `库存不足，最多 ${item.product.stock} 件` },
      { status: 400 }
    );
  }

  const updated = await prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
    include: { product: { include: { category: true } } },
  });

  return NextResponse.json(updated);
}

// DELETE /api/cart/[id] — 删除某项
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: '请先登录' }, { status: 401 });
  }

  const { id } = await params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId < 1) {
    return NextResponse.json({ error: '无效的ID' }, { status: 400 });
  }

  const item = await getCartItem(itemId, user.id);
  if (!item) {
    return NextResponse.json({ error: '购物车中没有该项' }, { status: 404 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });

  return NextResponse.json({ deleted: true });
}
