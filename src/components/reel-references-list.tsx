'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { addReference, removeReference } from '@/server-actions/reel-references';

type Ref = { id: string; url: string; label: string };

export function ReelReferencesList({ reelId, initial, canEdit }: { reelId: string; initial: Ref[]; canEdit: boolean }) {
  const [refs, setRefs] = useState(initial);
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [, start] = useTransition();

  const add = () => {
    const fd = new FormData();
    fd.set('url', url);
    fd.set('label', label);
    start(async () => {
      const res = await addReference(reelId, fd);
      if ('error' in res) { toast.error(res.error); return; }
      setRefs([...refs, res.reference]);
      setUrl(''); setLabel('');
    });
  };

  const remove = (id: string) => {
    start(async () => {
      const res = await removeReference(id, reelId);
      if ('error' in res && res.error) { toast.error(res.error); return; }
      setRefs(refs.filter((r) => r.id !== id));
    });
  };

  return (
    <section className="space-y-3 rounded border p-4">
      <h3 className="font-medium">Reference links</h3>
      <ul className="space-y-1 text-sm">
        {refs.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <a href={r.url} target="_blank" rel="noreferrer" className="underline">{r.label || r.url}</a>
            {canEdit && <button onClick={() => remove(r.id)} className="text-xs text-red-600">Remove</button>}
          </li>
        ))}
        {refs.length === 0 && <li className="text-muted-foreground">No references yet.</li>}
      </ul>
      {canEdit && (
        <div className="flex gap-2">
          <Input placeholder="Label (optional)" value={label} onChange={(e) => setLabel(e.target.value)} className="max-w-40" />
          <Input placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />
          <Button type="button" onClick={add} disabled={!url}>Add</Button>
        </div>
      )}
    </section>
  );
}
