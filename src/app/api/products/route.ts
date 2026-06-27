import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PAGE_SIZE = 9;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  // category 参数支持按名称或 ID 筛选
  const where: Record<string, unknown> = {};
  if (search) {
    where.name = { contains: search };
  }
  if (category) {
    // 尝试作为数字 ID 匹配，失败则按名称匹配
    const categoryId = Number(category);
    if (!isNaN(categoryId)) {
      where.categoryId = categoryId;
    } else {
      where.category = { name: category };
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}
