import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { z } from 'zod';


function parseId(id: string) {
  const num = Number(id);
  if (!Number.isInteger(num) || num < 1) return null;
  return num;
}

// GET /api/admin/products/[id] — 商品详情
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) {
    return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id: numericId },
    include: { category: true },
  });

  if (!product) return NextResponse.json({ error: '商品不存在' }, { status: 404 });
  return NextResponse.json(product);
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(),
  imageUrl: z.string().url().optional().nullable(),
  categoryId: z.number().int().positive().optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: '至少需要提供一个字段' }
);

// PUT /api/admin/products/[id] — 更新商品
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) {
    return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: numericId } });
  if (!existing) return NextResponse.json({ error: '商品不存在' }, { status: 404 });

  const product = await prisma.product.update({
    where: { id: numericId },
    data: parsed.data,
    include: { category: true },
  });

  return NextResponse.json(product);
}

// DELETE /api/admin/products/[id] — 删除商品
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const { id } = await params;
  const numericId = parseId(id);
  if (numericId === null) {
    return NextResponse.json({ error: '无效的商品ID' }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { id: numericId } });
  if (!existing) return NextResponse.json({ error: '商品不存在' }, { status: 404 });

  await prisma.product.delete({ where: { id: numericId } });
  return NextResponse.json({ deleted: true });
}
