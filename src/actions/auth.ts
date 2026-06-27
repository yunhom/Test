'use server';

import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, destroySession, validateSession } from '@/lib/auth';
import { registerSchema, loginSchema } from '@/lib/validators';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function register(formData: FormData) {
  const raw = {
    username: formData.get('username') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return { error: existing.email === email ? '该邮箱已被注册' : '该用户名已被使用' };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });

  await createSession(user.id);
  revalidatePath('/', 'layout');
}

export async function login(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: '邮箱或密码错误' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: '邮箱或密码错误' };
  }

  await createSession(user.id);
  revalidatePath('/', 'layout');
}

export async function logout() {
  await destroySession();
}

export async function getCurrentUser() {
  return validateSession();
}
