'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CalendarItem {
  id: number;
  name: string;
  name_cn: string;
  air_date: string;
  images: { large: string; common: string; medium: string; small: string };
  rating: { score: number } | null;
  collection: { doing: number };
}

interface CalendarDay {
  weekday: { id: number; cn: string; en: string };
  items: CalendarItem[];
}

const WEEKDAY_LABELS: Record<number, string> = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
};

export default function SeasonPage() {
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());

  const loadCalendar = () => {
    return Promise.all([
      fetch('/api/bangumi/calendar').then((res) => res.json()),
      fetch('/api/anime').then((res) => res.json()),
    ])
      .then(([calendarData, watchData]) => {
        const list = Array.isArray(calendarData) ? calendarData : [];
        const sorted = [...list].sort((a: CalendarDay, b: CalendarDay) => a.weekday.id - b.weekday.id);
        setCalendar(sorted);
        setAddedIds(new Set((watchData as { bangumi_id: number }[]).map((r) => r.bangumi_id)));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const handleAdd = async (item: CalendarItem) => {
    await fetch('/api/anime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bangumi_id: item.id,
        title: item.name_cn || item.name,
        cover_url: item.images?.large || item.images?.common || '',
        air_date: item.air_date,
        total_episodes: 0,
        summary: '',
        status: 'planned',
      }),
    });
    setAddedIds((prev) => new Set(prev).add(item.id));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">当季新番</h1>
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">当季新番</h1>
        {calendar.length === 0 && (
          <Button variant="outline" onClick={() => { setLoading(true); loadCalendar(); }}>重新加载</Button>
        )}
      </div>

      <div className="space-y-8">
        {calendar.length === 0 && (
          <p className="text-muted-foreground">获取新番数据失败，请稍后重试。</p>
        )}
        {calendar.map((day) => (
          <div key={day.weekday.id}>
            <h2 className="text-lg font-semibold mb-4 pb-2 border-b">
              {WEEKDAY_LABELS[day.weekday.id] || day.weekday.cn}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {day.items.map((item) => (
                <div key={item.id} className="group">
                  <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                    {item.images?.large || item.images?.common ? (
                      <Image
                        src={item.images.large || item.images.common}
                        alt={item.name_cn || item.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                        无封面
                      </div>
                    )}
                    {item.rating?.score ? (
                      <Badge className="absolute top-1 right-1 text-xs" variant="secondary">
                        {item.rating.score.toFixed(1)}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="text-sm font-medium mt-2 line-clamp-2 min-h-[2.5rem]">
                    {item.name_cn || item.name}
                  </h3>
                  {item.name_cn && item.name !== item.name_cn && (
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.air_date}
                    {item.collection?.doing ? ` · ${item.collection.doing}人在看` : ''}
                  </p>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    variant={addedIds.has(item.id) ? 'secondary' : 'default'}
                    disabled={addedIds.has(item.id)}
                    onClick={() => handleAdd(item)}
                  >
                    {addedIds.has(item.id) ? '已追番' : '+ 追番'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
