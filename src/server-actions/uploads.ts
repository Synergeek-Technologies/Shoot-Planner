'use server';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';

const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_BYTES = 10 * 1024 * 1024;

type Bucket = 'brand-logos' | 'reel-assets';

export async function uploadFile(bucket: Bucket, path: string, file: File) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' as const };
  if (file.size > MAX_BYTES) return { error: 'File too large (max 10MB)' };
  if (!ALLOWED_MIME.has(file.type)) return { error: `Unsupported file type: ${file.type}` };

  const supabase = await getServerSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
