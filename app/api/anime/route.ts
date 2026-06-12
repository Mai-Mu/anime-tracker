import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSubject } from '@/lib/bangumi';
import type { WatchStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as WatchStatus | null;

  let query = `
    SELECT w.*, a.title, a.cover_url, a.total_episodes, a.air_date, a.summary, a.season, a.bangumi_rating
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

function calcSeason(airDate: string): string {
  if (!airDate || airDate.length < 7) return '';
  const month = parseInt(airDate.slice(5, 7));
  const seasonMonth = month <= 3 ? '01' : month <= 6 ? '04' : month <= 9 ? '07' : '10';
  return `${airDate.slice(0, 4)}-${seasonMonth}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bangumi_id, title, cover_url, air_date, total_episodes, summary, status } = body;

  const season = calcSeason(air_date || '');

  const insertAnime = db.prepare(`
    INSERT OR IGNORE INTO anime (bangumi_id, title, cover_url, air_date, total_episodes, summary, season)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAnime.run(bangumi_id, title, cover_url || '', air_date || '', total_episodes || 0, summary || '', season);

  const insertWatch = db.prepare(`
    INSERT OR IGNORE INTO watching (bangumi_id, status)
    VALUES (?, ?)
  `);
  insertWatch.run(bangumi_id, status || 'planned');

  if (!total_episodes || !air_date || !summary) {
    try {
      const detail = await getSubject(bangumi_id);
      const updates: string[] = [];
      const values: (string | number)[] = [];

      if (detail.total_episodes && !total_episodes) {
        updates.push('total_episodes = ?');
        values.push(detail.total_episodes);
      }
      if (detail.air_date && !air_date) {
        updates.push('air_date = ?');
        values.push(detail.air_date);
        updates.push('season = ?');
        values.push(calcSeason(detail.air_date));
      }
      if (detail.summary && !summary) {
        updates.push('summary = ?');
        values.push(detail.summary);
      }
      if (detail.bangumi_rating != null) {
        updates.push('bangumi_rating = ?');
        values.push(detail.bangumi_rating);
      }

      if (updates.length > 0) {
        values.push(bangumi_id);
        db.prepare(`UPDATE anime SET ${updates.join(', ')} WHERE bangumi_id = ?`).run(...values);
      }
    } catch {}
  }

  return NextResponse.json({ success: true });
}
