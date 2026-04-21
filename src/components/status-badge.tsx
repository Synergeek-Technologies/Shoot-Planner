import { Badge } from '@/components/ui/badge';
import type { ReelStatus } from '@/lib/schemas/reel';

const LABELS: Record<ReelStatus, string> = {
  planning: 'Planning',
  ready_to_shoot: 'Ready to shoot',
  shot: 'Shot',
  edited: 'Edited',
  posted: 'Posted',
};

const VARIANTS: Record<ReelStatus, 'secondary' | 'default' | 'outline'> = {
  planning: 'secondary',
  ready_to_shoot: 'outline',
  shot: 'default',
  edited: 'default',
  posted: 'default',
};

export function StatusBadge({ status }: { status: ReelStatus }) {
  return <Badge variant={VARIANTS[status]}>{LABELS[status]}</Badge>;
}
