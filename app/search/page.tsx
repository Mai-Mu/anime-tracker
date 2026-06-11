'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Anime } from '@/lib/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bangumi/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (anime: Anime) => {
    await fetch('/api/anime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...anime, status: 'planned' }),
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">搜索番剧</h1>
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="输入番剧名称..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? '搜索中...' : '搜索'}
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {results.map((anime) => (
          <Card key={anime.bangumi_id} className="overflow-hidden">
            <div className="relative aspect-[3/4] bg-muted">
              {anime.cover_url ? (
                <Image
                  src={anime.cover_url}
                  alt={anime.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  无封面
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="text-sm font-medium line-clamp-2">{anime.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {anime.air_date} {anime.total_episodes ? `· ${anime.total_episodes}集` : ''}
              </p>
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => handleAdd(anime)}
              >
                + 添加追番
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
