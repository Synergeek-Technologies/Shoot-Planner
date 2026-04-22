'use client';
import { useRef, useState, useTransition } from 'react';
import { Paperclip, UploadCloud } from 'lucide-react';
import { uploadFile } from '@/server-actions/uploads';
import { toast } from 'sonner';

type Props = {
  bucket: 'brand-logos' | 'reel-assets';
  pathBuilder: (file: File) => string;
  currentUrl?: string | null;
  accept?: string;
  onUploaded: (url: string) => void | Promise<void>;
  label: string;
};

export function FileUpload({ bucket, pathBuilder, currentUrl, accept, onUploaded, label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [preview, setPreview] = useState(currentUrl ?? null);
  const filename = preview?.split('/').pop();

  return (
    <div className="flex flex-col gap-2 border border-dashed border-[var(--hair-strong)] p-4 transition-colors hover:border-[var(--signal)]">
      <div className="flex items-center justify-between">
        <span className="label-eyebrow">{label}</span>
        {preview && (
          <a href={preview} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-[var(--ink-dim)] hover:text-[var(--signal)]">
            <Paperclip size={11} />
            View
          </a>
        )}
      </div>

      <label className="group flex cursor-pointer items-center gap-3 py-1 text-[13px] text-[var(--ink-dim)] hover:text-[var(--ink)]">
        <span className="flex h-7 w-7 items-center justify-center border border-[var(--hair-strong)] text-[var(--muted)] group-hover:border-[var(--signal)] group-hover:text-[var(--signal)]">
          <UploadCloud size={13} />
        </span>
        <span className="flex-1 truncate">
          {pending ? 'Uploading…' : (filename ?? 'Choose a file')}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            start(async () => {
              const res = await uploadFile(bucket, pathBuilder(file), file);
              if ('error' in res) { toast.error(res.error); return; }
              setPreview(res.url);
              await onUploaded(res.url);
              toast.success(`${label} uploaded`);
            });
          }}
        />
      </label>
    </div>
  );
}
