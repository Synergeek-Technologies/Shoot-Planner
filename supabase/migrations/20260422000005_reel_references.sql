create table public.reel_references (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  url text not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create index reel_references_reel_idx on public.reel_references(reel_id);
