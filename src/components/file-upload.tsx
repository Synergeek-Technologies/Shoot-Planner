'use client';
import { useRef, useState, useTransition } from 'react';
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

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {preview && <a href={preview} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground underline">Current: {preview.split('/').pop()}</a>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="text-sm"
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
      {pending && <span className="text-xs text-muted-foreground">Uploading…</span>}
    </div>
  );
}
