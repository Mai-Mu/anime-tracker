export type WatchStatus = 'watching' | 'completed' | 'planned' | 'dropped';

export interface Anime {
  bangumi_id: number;
  title: string;
  cover_url: string;
  air_date: string;
  total_episodes: number;
  summary: string;
  season: string;
  bangumi_rating: number | null;
}

export interface WatchRecord {
  id: number;
  bangumi_id: number;
  status: WatchStatus;
  current_episode: number;
  rating: number | null;
  short_comment: string;
  started_at: string;
  updated_at: string;
  title?: string;
  cover_url?: string;
  total_episodes?: number;
  air_date?: string;
  summary?: string;
  season?: string;
  bangumi_rating?: number | null;
}
