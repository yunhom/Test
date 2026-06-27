import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  const result = categories.map(({ _count, ...cat }) => ({
    ...cat,
    productCount: _count.products,
  }));

  return NextResponse.json(result);
}
