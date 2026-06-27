import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';


const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['shipped', 'cancelled'],
  shipped: ['completed'],
};

// PUT /api/admin/orders/[id] — 更新订单状态
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.status !== 'string') {
    return NextResponse.json({ error: '缺少 status 字段' }, { status: 400 });
  }

  const { status } = body;
  const orderId = Number(id);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: '订单不存在' }, { status: 404 });

  const allowed = VALID_TRANSITIONS[order.status];
  if (!allowed || !allowed.includes(status)) {
    return NextResponse.json(
      { error: `不能从 ${order.status} 变更为 ${status}` },
      { status: 400 }
    );
  }

  // 取消时恢复库存
  if (status === 'cancelled') {
    await prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, status: order.status },
        data: { status },
      });
      if (result.count === 0) throw new Error('状态已变更');

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });
  } else {
    const result = await prisma.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status },
    });
    if (result.count === 0) {
      return NextResponse.json({ error: '订单状态已变更' }, { status: 409 });
    }
  }

  const updated = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, username: true, email: true } },
      items: true,
    },
  });

  return NextResponse.json(updated);
}
