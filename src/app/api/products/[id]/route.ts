import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: numericId },
    include: { category: true },
  });

  if (!product) {
    return NextResponse.json({ error: '商品不存在' }, { status: 404 });
  }

  return NextResponse.json(product);
}
