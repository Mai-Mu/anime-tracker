'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimeCard } from '@/components/anime-card';
import { StatsCards } from '@/components/stats-cards';
import type { WatchRecord, WatchStatus } from '@/lib/types';

function getCurrentSeason(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const seasonMonth = month <= 3 ? '01' : month <= 6 ? '04' : month <= 9 ? '07' : '10';
  return `${now.getFullYear()}-${seasonMonth}`;
}

export default function HomePage() {
  const [records, setRecords] = useState<WatchRecord[]>([]);
  const [seasonOnly, setSeasonOnly] = useState(false);
  const currentSeason = useMemo(() => getCurrentSeason(), []);

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/anime');
    const data: WatchRecord[] = await res.json();
    return data;
  }, []);

  useEffect(() => {
    fetchData().then((data) => setRecords(data));
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!seasonOnly) return records;
    return records.filter((r) => r.season === currentSeason);
  }, [records, seasonOnly, currentSeason]);

  const stats = useMemo(() => {
    const totalEpisodes = filtered.reduce((sum, r) => sum + r.current_episode, 0);
    const rated = filtered.filter((r) => r.rating != null);
    const avgRating = rated.length > 0
      ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length
      : 0;

    return {
      total: filtered.length,
      watching: filtered.filter((r) => r.status === 'watching').length,
      completed: filtered.filter((r) => r.status === 'completed').length,
      planned: filtered.filter((r) => r.status === 'planned').length,
      dropped: filtered.filter((r) => r.status === 'dropped').length,
      totalEpisodes,
      avgRating,
    };
  }, [filtered]);

  const filterByStatus = (status: WatchStatus) =>
    filtered.filter((r) => r.status === status);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的追番</h1>
        <div className="flex gap-2">
          <Button
            variant={seasonOnly ? 'default' : 'outline'}
            onClick={() => setSeasonOnly(!seasonOnly)}
          >
            {seasonOnly ? `当前季度 (${currentSeason})` : '筛选当季新番'}
          </Button>
          <Link href="/search">
            <Button>搜索番剧</Button>
          </Link>
        </div>
      </div>

      <StatsCards stats={stats} />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部 ({filtered.length})</TabsTrigger>
          <TabsTrigger value="watching">在看 ({stats.watching})</TabsTrigger>
          <TabsTrigger value="completed">已看 ({stats.completed})</TabsTrigger>
          <TabsTrigger value="planned">想追 ({stats.planned})</TabsTrigger>
        </TabsList>

        {(['all', 'watching', 'completed', 'planned'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(tab === 'all' ? filtered : filterByStatus(tab)).map((record) => (
                <AnimeCard key={record.bangumi_id} record={record} onUpdate={fetchData} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
