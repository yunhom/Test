import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionToken, setSessionCookie, clearSessionCookie } from '@/lib/cookie';
import { redirect } from 'next/navigation';
import type { User } from '@prisma/client';

const SALT_ROUNDS = 12;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 * 1000; // 7 days in ms

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number): Promise<string> {
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE),
    },
  });
  await setSessionCookie(session.id);
  return session.id;
}

export async function validateSession(): Promise<User | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } });
    }
    await clearSessionCookie();
    return null;
  }

  return session.user;
}

export async function requireAuth(): Promise<User> {
  const user = await validateSession();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await validateSession();
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }
  return user;
}

export async function destroySession(): Promise<void> {
  const token = await getSessionToken();
  if (token) {
    await prisma.session.delete({ where: { id: token } }).catch(() => {});
  }
  await clearSessionCookie();
}

// ---------- 规范别名 ----------

export async function setSession(userId: number, _role?: string): Promise<string> {
  return createSession(userId);
}

export async function getSession(): Promise<User | null> {
  return validateSession();
}

export async function clearSession(): Promise<void> {
  return destroySession();
}
