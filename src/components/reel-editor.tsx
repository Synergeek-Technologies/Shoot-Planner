'use client';
import { useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/file-upload';
import { StatusTrack } from '@/components/status-badge';
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
  const savedRef = useRef<Reel>(reel);
  const [, start] = useTransition();

  const save = (patch: Partial<Reel>) => {
    if (!canEdit) return;
    setState((s) => ({ ...s, ...patch }));
    savedRef.current = { ...savedRef.current, ...patch };
    start(async () => {
      const res = await updateReel(reel.id, patch);
      if ('error' in res && res.error) toast.error(res.error);
    });
  };

  const blurSave = <K extends keyof Reel>(key: K, value: Reel[K]) => {
    if (value !== savedRef.current[key]) save({ [key]: value } as Partial<Reel>);
  };

  return (
    <div className="space-y-14">
      <div>
        <div className="label-eyebrow mb-3">Reel title</div>
        <input
          value={state.title}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, title: e.target.value })}
          onBlur={(e) => blurSave('title', e.target.value)}
          className="w-full border-0 bg-transparent font-display text-[clamp(40px,5vw,68px)] leading-[0.95] tracking-tight text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none"
          placeholder="Untitled reel"
        />
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-6 border-y border-[var(--hair)] py-5">
        <div>
          <div className="label-eyebrow mb-2">Pipeline</div>
          <StatusTrack status={state.status} />
        </div>
        {canEdit && (
          <div>
            <div className="label-eyebrow mb-2">Change status</div>
            <Select value={state.status} onValueChange={(v) => save({ status: v as ReelStatus })}>
              <SelectTrigger className="w-56 border-[var(--hair-strong)] bg-transparent font-mono text-[11px] tracking-[0.16em] uppercase">
                <SelectValue>{STATUS_LABELS[state.status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {REEL_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <ReelSection number="01" label="Script" hint="Write the copy. Attach a PDF or doc if the director prefers.">
        <Textarea
          rows={8}
          value={state.script_text}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, script_text: e.target.value })}
          onBlur={(e) => blurSave('script_text', e.target.value)}
          placeholder="Open with a beat. Close with a feeling."
          className="min-h-[180px] border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-3 font-display text-[20px] leading-[1.4] text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
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
      </ReelSection>

      <ReelSection number="02" label="Product" hint="What's being sold. Name + hero image.">
        <Input
          value={state.product_name}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, product_name: e.target.value })}
          onBlur={(e) => blurSave('product_name', e.target.value)}
          placeholder="e.g. Meridian Chronometer — Obsidian Edition"
          className="border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 font-display text-[22px] leading-tight text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
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
      </ReelSection>

      <ReelSection number="03" label="Location" hint="Where we shoot. Address, notes, a reference photo.">
        <Textarea
          rows={3}
          value={state.location_text}
          disabled={!canEdit}
          onChange={(e) => setState({ ...state, location_text: e.target.value })}
          onBlur={(e) => blurSave('location_text', e.target.value)}
          placeholder="17 Gasoline Alley. Golden hour — 17:40. Park out back."
          className="border-0 border-b border-[var(--hair-strong)] bg-transparent px-0 pb-2 text-[15px] leading-[1.6] text-[var(--ink)] placeholder:italic placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--signal)]"
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
      </ReelSection>
    </div>
  );
}

function ReelSection({
  number, label, hint, children,
}: { number: string; label: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-8 md:self-start">
        <div className="font-mono text-[10.5px] tracking-[0.22em] uppercase text-[var(--signal)]">
          Section {number}
        </div>
        <h3 className="mt-2 font-display text-[34px] leading-[0.95] tracking-tight text-[var(--ink)]">
          {label}
        </h3>
        <p className="mt-3 max-w-[180px] text-[12.5px] leading-relaxed text-[var(--ink-dim)]">
          {hint}
        </p>
      </aside>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
