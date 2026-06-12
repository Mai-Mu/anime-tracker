'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import type { WatchRecord } from '@/lib/types';

type SortMode = 'started' | 'airdate';

interface TimelineGroup {
  label: string;
  items: WatchRecord[];
}

export default function TimelinePage() {
  const [records, setRecords] = useState<WatchRecord[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('started');

  useEffect(() => {
    fetch('/api/anime')
      .then((res) => res.json())
      .then((data: WatchRecord[]) => setRecords(data));
  }, []);

  const groups = buildGroups(records, sortMode);

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">追番时间线</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={sortMode === 'started' ? 'default' : 'outline'}
            onClick={() => setSortMode('started')}
          >
            追番时间
          </Button>
          <Button
            size="sm"
            variant={sortMode === 'airdate' ? 'default' : 'outline'}
            onClick={() => setSortMode('airdate')}
          >
            播出时间
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {groups.length === 0 && (
          <p className="text-muted-foreground">还没有追番记录，去搜索添加吧！</p>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <h2 className="text-lg font-semibold mb-4 text-muted-foreground">{group.label}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {group.items.map((record) => (
                <Link key={record.bangumi_id} href={`/anime/${record.bangumi_id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-[3/4] bg-muted">
                      {record.cover_url ? (
                        <Image src={record.cover_url} alt={record.title || ''} fill className="object-cover" />
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
                      {record.bangumi_rating != null && (
                        <p className="text-xs text-yellow-600 mt-0.5">{record.bangumi_rating.toFixed(1)}</p>
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

function buildGroups(records: WatchRecord[], mode: SortMode): TimelineGroup[] {
  const sorted = [...records].sort((a, b) => {
    if (mode === 'started') {
      return b.started_at.localeCompare(a.started_at);
    }
    return (b.air_date || '').localeCompare(a.air_date || '');
  });

  const grouped: Record<string, WatchRecord[]> = {};
  for (const r of sorted) {
    const key = mode === 'started'
      ? r.started_at.slice(0, 7)
      : (r.season || r.air_date?.slice(0, 7) || '未知');
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  }

  return Object.entries(grouped).map(([label, items]) => ({ label, items }));
}
