import { NextRequest, NextResponse } from 'next/server';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const COVER_DIR = path.join(process.cwd(), 'covers');
if (!existsSync(COVER_DIR)) mkdirSync(COVER_DIR, { recursive: true });

function getCacheKey(url: string): string {
  return Buffer.from(url).toString('base64url');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  const cacheKey = getCacheKey(url);
  const ext = url.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
  const cachePath = path.join(COVER_DIR, `${cacheKey}.${ext}`);

  if (existsSync(cachePath)) {
    const data = readFileSync(cachePath);
    const contentType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return new NextResponse(data, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' },
    });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'anime-tracker/1.0', 'Referer': 'https://bgm.tv/' },
    });

    if (!res.ok) {
      return new NextResponse('Failed to fetch image', { status: 502 });
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(cachePath, buffer);

    const contentType = res.headers.get('Content-Type') || `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return new NextResponse(buffer, {
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' },
    });
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 });
  }
}
