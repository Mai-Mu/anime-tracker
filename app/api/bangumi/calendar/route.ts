import { NextResponse } from 'next/server';
import { getCalendar } from '@/lib/bangumi';

export async function GET() {
  try {
    const data = await getCalendar();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json([]);
  }
}
