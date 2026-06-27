import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-guard';
import { z } from 'zod';


// GET /api/admin/categories — 分类列表
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(categories);
}

const categorySchema = z.object({
  name: z.string().min(1, '请输入分类名称').max(50),
  description: z.string().optional(),
});

// POST /api/admin/categories — 创建分类
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: '无权限' }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { name: parsed.data.name } });
  if (existing) return NextResponse.json({ error: '该分类已存在' }, { status: 409 });

  const category = await prisma.category.create({ data: parsed.data });

  return NextResponse.json(category, { status: 201 });
}
