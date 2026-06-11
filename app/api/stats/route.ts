import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const rows = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'watching' THEN 1 ELSE 0 END) as watching,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
      SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) as planned,
      SUM(CASE WHEN status = 'dropped' THEN 1 ELSE 0 END) as dropped,
      SUM(current_episode) as totalEpisodes,
      AVG(CASE WHEN rating IS NOT NULL THEN rating END) as avgRating
    FROM watching
  `).get();

  return NextResponse.json(rows);
}
