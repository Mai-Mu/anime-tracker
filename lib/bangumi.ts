import type { Anime } from './types';

const BANGUMI_API = 'https://api.bgm.tv';

interface BangumiSubject {
  id: number;
  name: string;
  name_cn: string;
  images: { large: string; common: string };
  date: string;
  eps: number;
  summary: string;
}

interface BangumiSearchResult {
  data: Array<{
    id: number;
    name: string;
    name_cn: string;
    image: string;
    date: string;
    eps: number;
  }>;
}

export async function searchAnime(keyword: string): Promise<Anime[]> {
  const res = await fetch(`${BANGUMI_API}/search/subject/${encodeURIComponent(keyword)}?type=2&limit=20`, {
    headers: { 'User-Agent': 'anime-tracker/1.0' },
  });

  if (!res.ok) throw new Error(`Bangumi search failed: ${res.status}`);

  const data: BangumiSearchResult = await res.json();

  return (data.data || []).map((item) => ({
    bangumi_id: item.id,
    title: item.name_cn || item.name,
    cover_url: item.image || '',
    air_date: item.date || '',
    total_episodes: item.eps || 0,
    summary: '',
  }));
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
    total_episodes: data.eps || 0,
    summary: data.summary || '',
  };
}
