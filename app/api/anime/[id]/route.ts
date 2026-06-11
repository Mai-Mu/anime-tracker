import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bangumiId = parseInt(id);

  const row = db.prepare(`
    SELECT w.*, a.title, a.cover_url, a.total_episodes, a.air_date, a.summary
    FROM watching w
    JOIN anime a ON w.bangumi_id = a.bangumi_id
    WHERE w.bangumi_id = ?
  `).get(bangumiId);

  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(row);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bangumiId = parseInt(id);
  const body = await request.json();

  const updates: string[] = [];
  const values: (string | number | null)[] = [];

  if (body.status !== undefined) { updates.push('status = ?'); values.push(body.status); }
  if (body.current_episode !== undefined) { updates.push('current_episode = ?'); values.push(body.current_episode); }
  if (body.rating !== undefined) { updates.push('rating = ?'); values.push(body.rating); }
  if (body.short_comment !== undefined) { updates.push('short_comment = ?'); values.push(body.short_comment); }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");
  values.push(bangumiId);

  db.prepare(`UPDATE watching SET ${updates.join(', ')} WHERE bangumi_id = ?`).run(...values);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const bangumiId = parseInt(id);

  db.prepare('DELETE FROM watching WHERE bangumi_id = ?').run(bangumiId);

  return NextResponse.json({ success: true });
}
