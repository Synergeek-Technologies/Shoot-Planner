'use client';
import { Button } from '@/components/ui/button';
export function NewReelDialog({ shootId }: { shootId: string }) {
  return <Button disabled title={`shoot ${shootId}`}>+ New reel (Phase 7)</Button>;
}
