import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, setSession } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(1, '请输入密码'),
});

// 统一的错误信息，不区分"用户不存在"和"密码错误"，防止撞库
const LOGIN_ERROR = '邮箱或密码错误';

// dummy hash，用于用户不存在时也执行 bcrypt.compare 以消除时序侧信道
const DUMMY_HASH = '$2a$12$LJ3m4ys3Y4I1s5Y6Xs7xEe8f9g0h1i2j3k4l5m6n7o8p9q0r1s2t3u';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: '请求体格式错误' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // 始终执行 bcrypt 比对，消除时序差异
  const hash = user?.passwordHash || DUMMY_HASH;
  const valid = await verifyPassword(password, hash);

  if (!user || !valid) {
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 401 });
  }

  await setSession(user.id);

  return NextResponse.json({
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  });
}
