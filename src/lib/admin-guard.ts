import { validateSession } from '@/lib/auth';

export async function requireAdmin() {
  const user = await validateSession();
  if (!user || user.role !== 'admin') return null;
  return user;
}
