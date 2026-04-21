create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index brands_created_at_idx on public.brands(created_at desc);
