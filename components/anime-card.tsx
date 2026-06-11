'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import type { WatchRecord } from '@/lib/types';

interface AnimeCardProps {
  record: WatchRecord;
  onUpdate: () => void;
}

export function AnimeCard({ record, onUpdate }: AnimeCardProps) {
  const handleEpisodeChange = async (delta: number) => {
    const newEp = record.current_episode + delta;
    if (newEp < 0) return;

    await fetch(`/api/anime/${record.bangumi_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ current_episode: newEp }),
    });
    onUpdate();
  };

  return (
    <Card className="overflow-hidden">
      <Link href={`/anime/${record.bangumi_id}`}>
        <div className="relative aspect-[3/4] bg-muted">
          {record.cover_url ? (
            <Image
              src={record.cover_url}
              alt={record.title || ''}
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
      </Link>
      <CardContent className="p-3">
        <Link href={`/anime/${record.bangumi_id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:underline">
            {record.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <StatusBadge status={record.status} />
          <span className="text-xs text-muted-foreground">
            {record.current_episode}/{record.total_episodes || '?'} 集
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex gap-1">
        <Button size="sm" variant="outline" onClick={() => handleEpisodeChange(-1)}>
          -1
        </Button>
        <Button size="sm" onClick={() => handleEpisodeChange(1)}>
          +1
        </Button>
      </CardFooter>
    </Card>
  );
}
