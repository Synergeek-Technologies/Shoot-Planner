'use client';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/file-upload';
import { updateReel } from '@/server-actions/reels';
import { REEL_STATUSES, type ReelStatus } from '@/lib/schemas/reel';

type Reel = {
  id: string; title: string; status: ReelStatus;
  script_text: string; script_file_url: string | null;
  product_name: string; product_image_url: string | null;
  location_text: string; location_image_url: string | null;
};

const STATUS_LABELS: Record<ReelStatus, string> = {
  planning: 'Planning', ready_to_shoot: 'Ready to shoot',
  shot: 'Shot', edited: 'Edited', posted: 'Posted',
};

export function ReelEditor({ reel, canEdit }: { reel: Reel; canEdit: boolean }) {
  const [state, setState] = useState(reel);
  const [, start] = useTransition();

  const save = (patch: Partial<Reel>) => {
    if (!canEdit) return;
    setState((s) => ({ ...s, ...patch }));
    start(async () => {
      const res = await updateReel(reel.id, patch);
      if ('error' in res && res.error) toast.error(res.error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Input
          value={state.title}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, title: e.target.value })}
          onBlur={(e) => e.target.value !== reel.title && save({ title: e.target.value })}
          className="text-2xl font-semibold"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Status</label>
        <Select value={state.status} disabled={!canEdit} onValueChange={(v) => save({ status: v as ReelStatus })}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {REEL_STATUSES.map((s) => (<SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <Section title="Script">
        <Textarea
          rows={6}
          value={state.script_text}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, script_text: e.target.value })}
          onBlur={(e) => e.target.value !== reel.script_text && save({ script_text: e.target.value })}
          placeholder="Write or paste the script…"
        />
        {canEdit && (
          <FileUpload
            bucket="reel-assets"
            pathBuilder={(f) => `${reel.id}/script.${f.name.split('.').pop()}`}
            currentUrl={state.script_file_url}
            accept=".pdf,.txt,.docx"
            label="Script file"
            onUploaded={(url) => save({ script_file_url: url })}
          />
        )}
      </Section>

      <Section title="Product">
        <Input
          value={state.product_name}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, product_name: e.target.value })}
          onBlur={(e) => e.target.value !== reel.product_name && save({ product_name: e.target.value })}
          placeholder="Product name"
        />
        {canEdit && (
          <FileUpload
            bucket="reel-assets"
            pathBuilder={(f) => `${reel.id}/product.${f.name.split('.').pop()}`}
            currentUrl={state.product_image_url}
            accept="image/*"
            label="Product image"
            onUploaded={(url) => save({ product_image_url: url })}
          />
        )}
      </Section>

      <Section title="Location">
        <Textarea
          rows={3}
          value={state.location_text}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, location_text: e.target.value })}
          onBlur={(e) => e.target.value !== reel.location_text && save({ location_text: e.target.value })}
          placeholder="Address / notes…"
        />
        {canEdit && (
          <FileUpload
            bucket="reel-assets"
            pathBuilder={(f) => `${reel.id}/location.${f.name.split('.').pop()}`}
            currentUrl={state.location_image_url}
            accept="image/*"
            label="Location image"
            onUploaded={(url) => save({ location_image_url: url })}
          />
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2 rounded border p-4">
      <h3 className="font-medium">{title}</h3>
      {children}
    </section>
  );
}
