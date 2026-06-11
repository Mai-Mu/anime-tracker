'use client';

import { useEffect, useState, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import type { WatchRecord } from '@/lib/types';

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [record, setRecord] = useState<WatchRecord | null>(null);
  const [rating, setRating] = useState<string>('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetch(`/api/anime/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setRecord(data);
        setRating(data.rating?.toString() || '');
        setComment(data.short_comment || '');
      });
  }, [id]);

  const updateField = async (body: Record<string, unknown>) => {
    await fetch(`/api/anime/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const res = await fetch(`/api/anime/${id}`);
    setRecord(await res.json());
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条追番记录吗？')) return;
    await fetch(`/api/anime/${id}`, { method: 'DELETE' });
    router.push('/');
  };

  if (!record) return <div className="container mx-auto py-8">加载中...</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-[300px_1fr] gap-8">
        <div>
          <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden">
            {record.cover_url ? (
              <Image src={record.cover_url} alt={record.title || ''} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">无封面</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{record.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={record.status} />
              <span className="text-muted-foreground">{record.air_date}</span>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>追番状态</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm">状态：</label>
                <Select value={record.status} onValueChange={(v) => updateField({ status: v })}>
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="watching">在看</SelectItem>
                    <SelectItem value="completed">已看</SelectItem>
                    <SelectItem value="planned">想追</SelectItem>
                    <SelectItem value="dropped">弃坑</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm">当前集数：</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateField({ current_episode: Math.max(0, record.current_episode - 1) })}>-1</Button>
                  <span className="w-12 text-center font-mono">{record.current_episode}</span>
                  <span className="text-muted-foreground">/ {record.total_episodes || '?'}</span>
                  <Button size="sm" onClick={() => updateField({ current_episode: record.current_episode + 1 })}>+1</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>评分与短评</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm">评分 (1-10)：</label>
                <Input
                  type="number" min={1} max={10} className="w-20"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  onBlur={() => {
                    const val = rating ? parseInt(rating) : null;
                    updateField({ rating: val });
                  }}
                />
              </div>
              <div>
                <label className="text-sm">短评：</label>
                <Textarea
                  className="mt-1"
                  placeholder="写点感想..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onBlur={() => updateField({ short_comment: comment })}
                />
              </div>
            </CardContent>
          </Card>

          {record.summary && (
            <Card>
              <CardHeader><CardTitle>简介</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{record.summary}</p></CardContent>
            </Card>
          )}

          <Button variant="destructive" onClick={handleDelete}>删除记录</Button>
        </div>
      </div>
    </div>
  );
}
