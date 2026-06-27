import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, setSession } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(2, '用户名至少2个字符').max(20),
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(6, '密码至少6个字符').max(100),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    // 统一错误信息，不区分邮箱/用户名，防止枚举
    return NextResponse.json(
      { error: '注册失败，请检查输入' },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
  });

  await setSession(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  }, { status: 201 });
}
