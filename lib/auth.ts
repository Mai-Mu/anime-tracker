import { SignJWT, jwtVerify } from 'jose';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret');
const COOKIE_NAME = 'auth_token';
const EXPIRE_DAYS = 7;

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = process.env.AUTH_PASSWORD_HASH;
  if (!hash) return false;
  return compare(password, hash);
}

export async function createToken(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRE_DAYS}d`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function setAuthCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: EXPIRE_DAYS * 86400,
    path: '/',
  });
}

export async function removeAuthCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
