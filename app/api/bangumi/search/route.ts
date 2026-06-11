import { NextRequest, NextResponse } from 'next/server';
import { searchAnime } from '@/lib/bangumi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q');

  if (!keyword) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const results = await searchAnime(keyword);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      { error: 'Failed to search Bangumi' },
      { status: 502 }
    );
  }
}
