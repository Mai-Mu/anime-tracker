import { Badge } from '@/components/ui/badge';
import type { WatchStatus } from '@/lib/types';

const statusConfig: Record<WatchStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  watching: { label: '在看', variant: 'default' },
  completed: { label: '已看', variant: 'secondary' },
  planned: { label: '想追', variant: 'outline' },
  dropped: { label: '弃坑', variant: 'destructive' },
};

export function StatusBadge({ status }: { status: WatchStatus }) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
