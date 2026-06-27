import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { z } from 'zod';


const PAGE_SIZE = 10;

// GET /api/admin/products — 商品列表
export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const { searchParams } = request.nextUrl;
  const search = searchParams.get('search') || undefined;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const where = search ? { name: { contains: search } } : {};

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
    pagination: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
  });
}

const productSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
  imageUrl: z.string().url().optional().nullable(),
  categoryId: z.number().int().positive(),
});

// POST /api/admin/products — 创建商品
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, imageUrl: parsed.data.imageUrl || null },
    include: { category: true },
  });

  return NextResponse.json(product, { status: 201 });
}
