'use server';

import { prisma } from '@/lib/prisma';
import { productSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    stock: formData.get('stock') as string,
    imageUrl: (formData.get('imageUrl') as string) || '',
    categoryId: formData.get('categoryId') as string,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.create({
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath('/admin/products');
  redirect('/admin/products');
}

export async function updateProduct(id: number, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    price: formData.get('price') as string,
    stock: formData.get('stock') as string,
    imageUrl: (formData.get('imageUrl') as string) || '',
    categoryId: formData.get('categoryId') as string,
  };

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
    },
  });

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}/edit`);
  redirect('/admin/products');
}

export async function deleteProduct(id: number) {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}
