'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimeCard } from '@/components/anime-card';
import { StatsCards } from '@/components/stats-cards';
import type { WatchRecord, WatchStatus } from '@/lib/types';

export default function HomePage() {
  const [records, setRecords] = useState<WatchRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0, watching: 0, completed: 0, planned: 0, dropped: 0,
    totalEpisodes: 0, avgRating: 0,
  });

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/anime');
    const data: WatchRecord[] = await res.json();
    return data;
  }, []);

  useEffect(() => {
    fetchData().then((data) => {
      setRecords(data);

      const totalEpisodes = data.reduce((sum, r) => sum + r.current_episode, 0);
      const rated = data.filter((r) => r.rating != null);
      const avgRating = rated.length > 0
        ? rated.reduce((sum, r) => sum + (r.rating || 0), 0) / rated.length
        : 0;

      setStats({
        total: data.length,
        watching: data.filter((r) => r.status === 'watching').length,
        completed: data.filter((r) => r.status === 'completed').length,
        planned: data.filter((r) => r.status === 'planned').length,
        dropped: data.filter((r) => r.status === 'dropped').length,
        totalEpisodes,
        avgRating,
      });
    });
  }, [fetchData]);

  const filterByStatus = (status: WatchStatus) =>
    records.filter((r) => r.status === status);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">我的追番</h1>
        <Link href="/search">
          <Button>搜索番剧</Button>
        </Link>
      </div>

      <StatsCards stats={stats} />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部 ({records.length})</TabsTrigger>
          <TabsTrigger value="watching">在看 ({stats.watching})</TabsTrigger>
          <TabsTrigger value="completed">已看 ({stats.completed})</TabsTrigger>
          <TabsTrigger value="planned">想追 ({stats.planned})</TabsTrigger>
        </TabsList>

        {(['all', 'watching', 'completed', 'planned'] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(tab === 'all' ? records : filterByStatus(tab)).map((record) => (
                <AnimeCard key={record.bangumi_id} record={record} onUpdate={fetchData} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
