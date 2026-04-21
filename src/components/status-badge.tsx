import { Badge } from '@/components/ui/badge';
export function StatusBadge({ status }: { status: string }) {
  return <Badge variant="secondary">{status.replace('_', ' ')}</Badge>;
}
