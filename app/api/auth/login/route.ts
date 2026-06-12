import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = RATE_LIMIT.get(ip);

  if (!record || now > record.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (record.count >= 5) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'local';

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 });
  }

  const { password } = await request.json();

  if (!password || !(await verifyPassword(password))) {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  const token = await createToken();
  await setAuthCookie(token);

  return NextResponse.json({ success: true });
}
