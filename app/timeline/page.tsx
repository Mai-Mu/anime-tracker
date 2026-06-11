'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/status-badge';
import type { WatchRecord } from '@/lib/types';

interface TimelineGroup {
  month: string;
  items: WatchRecord[];
}

export default function TimelinePage() {
  const [groups, setGroups] = useState<TimelineGroup[]>([]);

  useEffect(() => {
    fetch('/api/anime')
      .then((res) => res.json())
      .then((data: WatchRecord[]) => {
        const sorted = [...data].sort((a, b) => b.started_at.localeCompare(a.started_at));

        const grouped: Record<string, WatchRecord[]> = {};
        for (const record of sorted) {
          const date = record.started_at.slice(0, 7);
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(record);
        }

        setGroups(
          Object.entries(grouped).map(([month, items]) => ({ month, items }))
        );
      });
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">追番时间线</h1>

      <div className="space-y-8">
        {groups.length === 0 && (
          <p className="text-muted-foreground">还没有追番记录，去搜索添加吧！</p>
        )}

        {groups.map((group) => (
          <div key={group.month}>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{group.month}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {group.items.map((record) => (
                <Link key={record.bangumi_id} href={`/anime/${record.bangumi_id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-[3/4] bg-muted">
                      {record.cover_url ? (
                        <Image src={record.cover_url} alt={record.title || ''} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">无封面</div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <h3 className="text-xs font-medium line-clamp-1">{record.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        <StatusBadge status={record.status} />
                        <span className="text-xs text-muted-foreground">{record.current_episode}集</span>
                      </div>
                      {record.rating && (
                        <p className="text-xs text-yellow-500 mt-1">{'★'.repeat(record.rating)}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
