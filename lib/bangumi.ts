import type { Anime } from './types';

const BANGUMI_API = 'https://api.bgm.tv';

interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  images: { large: string; common: string };
  date: string;
  eps: number;
  total_episodes: number;
  summary: string;
  rating: { score: number } | null;
}

interface BangumiSearchResult {
  results: number;
  list: Array<{
    id: number;
    name: string;
    name_cn: string;
    images: { large: string; common: string; medium: string; small: string };
    air_date: string;
    eps: number;
  }>;
}

export async function searchAnime(keyword: string): Promise<Anime[]> {
  const res = await fetch(`${BANGUMI_API}/search/subject/${encodeURIComponent(keyword)}?type=2&limit=20`, {
    headers: { 'User-Agent': 'anime-tracker/1.0' },
  });

  if (!res.ok) throw new Error(`Bangumi search failed: ${res.status}`);

  const data: BangumiSearchResult = await res.json();

  return (data.list || []).map((item) => ({
    bangumi_id: item.id,
    title: item.name_cn || item.name,
    cover_url: item.images?.large || item.images?.common || '',
    air_date: item.air_date || '',
    total_episodes: item.eps || 0,
    summary: '',
    season: '',
    bangumi_rating: null,
  }));
}

export interface CalendarDay {
  weekday: { id: number; cn: string; en: string };
  items: Array<{
    id: number;
    name: string;
    name_cn: string;
    air_date: string;
    images: { large: string; common: string; medium: string; small: string };
    rating: { score: number } | null;
    collection: { doing: number };
  }>;
}

export async function getCalendar(): Promise<CalendarDay[]> {
  const res = await fetch(`${BANGUMI_API}/calendar`, {
    headers: { 'User-Agent': 'anime-tracker/1.0' },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Bangumi calendar failed: ${res.status}`);
  return res.json();
}

export async function getSubject(subjectId: number): Promise<Anime> {
  const res = await fetch(`${BANGUMI_API}/v0/subjects/${subjectId}`, {
    headers: { 'User-Agent': 'anime-tracker/1.0' },
  });

  if (!res.ok) throw new Error(`Bangumi subject fetch failed: ${res.status}`);

  const data: BangumiSubject = await res.json();

  return {
    bangumi_id: data.id,
    title: data.name_cn || data.name,
    cover_url: data.images?.large || data.images?.common || '',
    air_date: data.date || '',
    total_episodes: data.total_episodes || data.eps || 0,
    summary: data.summary || '',
    season: '',
    bangumi_rating: data.rating?.score ?? null,
  };
}
