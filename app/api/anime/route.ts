import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSubject } from '@/lib/bangumi';
import type { WatchStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as WatchStatus | null;

  let query = `
    SELECT w.*, a.title, a.cover_url, a.total_episodes, a.air_date
    FROM watching w
    JOIN anime a ON w.bangumi_id = a.bangumi_id
  `;
  const params: string[] = [];

  if (status) {
    query += ' WHERE w.status = ?';
    params.push(status);
  }

  query += ' ORDER BY w.updated_at DESC';

  const rows = db.prepare(query).all(...params);
  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bangumi_id, title, cover_url, air_date, total_episodes, summary, status } = body;

  const insertAnime = db.prepare(`
    INSERT OR IGNORE INTO anime (bangumi_id, title, cover_url, air_date, total_episodes, summary)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertAnime.run(bangumi_id, title, cover_url || '', air_date || '', total_episodes || 0, summary || '');

  const insertWatch = db.prepare(`
    INSERT OR IGNORE INTO watching (bangumi_id, status)
    VALUES (?, ?)
  `);
  insertWatch.run(bangumi_id, status || 'planned');

  if (!total_episodes) {
    try {
      const detail = await getSubject(bangumi_id);
      if (detail.total_episodes) {
        db.prepare('UPDATE anime SET total_episodes = ? WHERE bangumi_id = ?')
          .run(detail.total_episodes, bangumi_id);
      }
    } catch {}
  }

  return NextResponse.json({ success: true });
}
