import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { verifyPassword } from '@/lib/auth';
import { writeFileSync, readFileSync } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  const { oldPassword, newPassword } = await request.json();

  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: '请填写完整' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: '新密码至少6位' }, { status: 400 });
  }

  if (!(await verifyPassword(oldPassword))) {
    return NextResponse.json({ error: '原密码错误' }, { status: 401 });
  }

  const newHash = await hash(newPassword, 12);
  const envPath = path.join(process.cwd(), '.env');
  let envContent = readFileSync(envPath, 'utf-8');
  envContent = envContent.replace(/AUTH_PASSWORD_HASH=.*/, `AUTH_PASSWORD_HASH=${newHash}`);
  writeFileSync(envPath, envContent);

  process.env.AUTH_PASSWORD_HASH = newHash;

  return NextResponse.json({ success: true });
}
