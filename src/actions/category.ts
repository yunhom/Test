'use server';

import { prisma } from '@/lib/prisma';
import { categorySchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';

export async function createCategory(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.category.findUnique({
    where: { name: parsed.data.name },
  });
  if (existing) return { error: '该分类已存在' };

  await prisma.category.create({ data: parsed.data });
  revalidatePath('/admin/categories');
}

export async function updateCategory(id: number, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
  };

  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.category.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: number) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath('/admin/categories');
  } catch {
    return { error: '无法删除该分类，请先将该分类下的商品移至其他分类' };
  }
}
