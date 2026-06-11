import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
  total: number;
  watching: number;
  completed: number;
  planned: number;
  dropped: number;
  totalEpisodes: number;
  avgRating: number;
}

export function StatsCards({ stats }: { stats: Stats }) {
  const items = [
    { label: '在看', value: stats.watching, color: 'text-blue-600' },
    { label: '已看', value: stats.completed, color: 'text-green-600' },
    { label: '想追', value: stats.planned, color: 'text-yellow-600' },
    { label: '弃坑', value: stats.dropped, color: 'text-red-600' },
    { label: '总集数', value: stats.totalEpisodes, color: 'text-purple-600' },
    { label: '平均评分', value: stats.avgRating ? stats.avgRating.toFixed(1) : '-', color: 'text-orange-600' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {items.map((item) => (
        <Card key={item.label}>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm text-muted-foreground">{item.label}</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
