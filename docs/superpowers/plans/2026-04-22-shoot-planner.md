# Shoot Planner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a team web app for Synergeek that organizes brands → shoots → reels, tracks per-reel status, and shows a cross-brand shoot calendar.

**Architecture:** Next.js (App Router, Server Components, server actions) on the frontend and backend. Supabase provides Postgres, auth (email+password), storage, and row-level-security (RLS) policies that enforce the admin/editor/viewer role split at the database layer. Zod schemas are shared between client forms and server actions. Deployed to Vercel, CI via GitHub Actions.

**Tech Stack:** TypeScript, Next.js 14+, React 18+, Supabase (JS + CLI), Zod, Tailwind, shadcn/ui, Vitest, Playwright.

**Reading order:** Tasks are grouped into phases. Within a phase, do tasks in order. Phases after Phase 4 each produce a working, shippable slice of the app.

---

## File Structure

```
Shoot Planner/
├── .env.local.example
├── .gitignore
├── README.md
├── package.json, tsconfig.json, next.config.js, tailwind.config.ts, postcss.config.js
├── playwright.config.ts
├── vitest.config.ts
├── middleware.ts                        # auth session refresh
├── supabase/
│   ├── config.toml
│   ├── migrations/                      # one file per migration (see tasks)
│   └── seed.sql
├── src/
│   ├── app/
│   │   ├── layout.tsx                   # root shell
│   │   ├── error.tsx                    # global error boundary
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/signup/page.tsx
│   │   └── (app)/
│   │       ├── layout.tsx               # sidebar + topbar for authed pages
│   │       ├── page.tsx                 # dashboard
│   │       ├── calendar/page.tsx
│   │       ├── brands/page.tsx
│   │       ├── brands/[brandId]/page.tsx
│   │       ├── shoots/[shootId]/page.tsx
│   │       ├── reels/[reelId]/page.tsx
│   │       ├── team/page.tsx
│   │       └── account/page.tsx
│   ├── components/
│   │   ├── ui/                          # shadcn primitives (button, input, dialog, etc.)
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── status-badge.tsx
│   │   ├── new-brand-dialog.tsx
│   │   ├── new-shoot-dialog.tsx
│   │   ├── new-reel-dialog.tsx
│   │   ├── reel-editor.tsx
│   │   ├── reel-references-list.tsx
│   │   ├── calendar-grid.tsx
│   │   └── file-upload.tsx
│   ├── lib/
│   │   ├── supabase/{browser,server,middleware}.ts
│   │   ├── schemas/{brand,shoot,reel,reel-reference,profile}.ts
│   │   └── auth/require-role.ts
│   ├── server-actions/{brands,shoots,reels,reel-references,team,account,uploads}.ts
│   └── types/database.ts                # generated from Supabase
└── tests/
    ├── unit/schemas/{brand,shoot,reel}.test.ts
    ├── integration/{rls-viewer,rls-editor,rls-admin}.test.ts
    └── e2e/{editor-flow,viewer-flow}.spec.ts
```

Each file has one responsibility. `src/lib/` is pure utilities; `src/server-actions/` is the only place mutations live; pages are thin glue.

---

## Phase 1 — Project scaffold

### Task 1: Initialize Next.js app

**Files:**
- Create: project root files via `create-next-app`

- [ ] **Step 1: Run scaffold**

```bash
cd "/Users/srimanikandanr/My Files/Synergeek/Shoot Planner"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --use-npm --import-alias "@/*" --no-turbo
```
Answer "No" to customize-defaults prompt if shown. Accept overwriting existing files if prompted (the only existing content is `docs/`).

- [ ] **Step 2: Verify dev server boots**

```bash
npm run dev
```
Expected: "Local: http://localhost:3000" in output. Open URL in browser, confirm Next.js welcome page. Ctrl+C to stop.

- [ ] **Step 3: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: Install runtime + dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install @supabase/supabase-js @supabase/ssr zod date-fns clsx tailwind-merge lucide-react
```

- [ ] **Step 2: Install shadcn/ui**

```bash
npx shadcn@latest init -d
npx shadcn@latest add button input label dialog dropdown-menu select textarea badge card toast sonner
```

- [ ] **Step 3: Install dev deps**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test supabase
npx playwright install chromium
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json components.json src/ tailwind.config.ts
git commit -m "chore: add Supabase, Zod, shadcn, Vitest, Playwright"
```

---

### Task 3: Initialize local Supabase

**Files:**
- Create: `supabase/config.toml` (via CLI), `supabase/seed.sql`

- [ ] **Step 1: Init Supabase project**

```bash
npx supabase init
```
Accept defaults. This creates `supabase/config.toml` and `supabase/migrations/`.

- [ ] **Step 2: Start local Supabase**

```bash
npx supabase start
```
Expected output includes API URL (e.g. `http://127.0.0.1:54321`), DB URL, anon key, service_role key. Save these — Task 4 uses them.

- [ ] **Step 3: Create empty seed file**

Create `supabase/seed.sql`:
```sql
-- seed.sql — populated in later tasks
```

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "chore: init local Supabase"
```

---

### Task 4: Configure env vars and Supabase clients

**Files:**
- Create: `.env.local.example`, `.env.local`, `src/lib/supabase/browser.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/middleware.ts`, `middleware.ts`

- [ ] **Step 1: Create `.env.local.example`**

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key_from_supabase_start>
SUPABASE_SERVICE_ROLE_KEY=<service_role_from_supabase_start>
```

- [ ] **Step 2: Create `.env.local`**

Copy `.env.local.example` → `.env.local`, paste real values from `supabase start` output.

Ensure `.gitignore` contains `.env.local` (Next.js default does).

- [ ] **Step 3: Create browser client** — `src/lib/supabase/browser.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function getBrowserSupabase() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 4: Create server client** — `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (all) => {
          try {
            all.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server components can't set cookies; middleware will.
          }
        },
      },
    },
  );
}
```

- [ ] **Step 5: Create middleware helper** — `src/lib/supabase/middleware.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (all) => {
          all.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          all.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = path.startsWith('/login') || path.startsWith('/signup');
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  if (user && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  return response;
}
```

- [ ] **Step 6: Create `middleware.ts` at project root**:

```ts
import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
```

- [ ] **Step 7: Create placeholder types file** — `src/types/database.ts`:

```ts
export type Database = { public: { Tables: Record<string, unknown>; Functions: Record<string, unknown>; Enums: Record<string, unknown> } };
```
Regenerated after migrations (Task 13).

- [ ] **Step 8: Verify build**

```bash
npm run build
```
Expected: compiles without errors.

- [ ] **Step 9: Commit**

```bash
git add .env.local.example src/lib/supabase src/types middleware.ts .gitignore
git commit -m "feat: add Supabase clients and auth middleware"
```

---

## Phase 2 — Database schema

Each migration gets its own file so mistakes can be reverted one at a time. Local Supabase auto-applies new migrations via `supabase db reset` in Task 13.

### Task 5: Migration — `profiles` table + auto-insert trigger

**Files:**
- Create: `supabase/migrations/20260422000001_profiles.sql`

- [ ] **Step 1: Create migration file**

```sql
create type public.user_role as enum ('admin', 'editor', 'viewer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000001_profiles.sql
git commit -m "feat(db): add profiles table and new-user trigger"
```

---

### Task 6: Migration — `brands` table

**Files:**
- Create: `supabase/migrations/20260422000002_brands.sql`

- [ ] **Step 1: Create migration**

```sql
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  logo_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index brands_created_at_idx on public.brands(created_at desc);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000002_brands.sql
git commit -m "feat(db): add brands table"
```

---

### Task 7: Migration — `shoots` table

**Files:**
- Create: `supabase/migrations/20260422000003_shoots.sql`

- [ ] **Step 1: Create migration**

```sql
create table public.shoots (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id) on delete cascade,
  title text not null,
  scheduled_at timestamptz not null,
  location_notes text not null default '',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create index shoots_brand_idx on public.shoots(brand_id);
create index shoots_scheduled_idx on public.shoots(scheduled_at);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000003_shoots.sql
git commit -m "feat(db): add shoots table"
```

---

### Task 8: Migration — `reels` table

**Files:**
- Create: `supabase/migrations/20260422000004_reels.sql`

- [ ] **Step 1: Create migration**

```sql
create type public.reel_status as enum ('planning', 'ready_to_shoot', 'shot', 'edited', 'posted');

create table public.reels (
  id uuid primary key default gen_random_uuid(),
  shoot_id uuid not null references public.shoots(id) on delete cascade,
  title text not null,
  status public.reel_status not null default 'planning',
  script_text text not null default '',
  script_file_url text,
  product_name text not null default '',
  product_image_url text,
  location_text text not null default '',
  location_image_url text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index reels_shoot_idx on public.reels(shoot_id, position);
create index reels_status_idx on public.reels(status);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000004_reels.sql
git commit -m "feat(db): add reels table"
```

---

### Task 9: Migration — `reel_references` table

**Files:**
- Create: `supabase/migrations/20260422000005_reel_references.sql`

- [ ] **Step 1: Create migration**

```sql
create table public.reel_references (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references public.reels(id) on delete cascade,
  url text not null,
  label text not null default '',
  created_at timestamptz not null default now()
);

create index reel_references_reel_idx on public.reel_references(reel_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000005_reel_references.sql
git commit -m "feat(db): add reel_references table"
```

---

### Task 10: Migration — `activity_log` table

**Files:**
- Create: `supabase/migrations/20260422000006_activity_log.sql`

- [ ] **Step 1: Create migration**

```sql
create type public.activity_entity as enum ('shoot', 'reel', 'brand');

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  entity_type public.activity_entity not null,
  entity_id uuid not null,
  action text not null,
  actor_id uuid not null references public.profiles(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_created_idx on public.activity_log(created_at desc);
create index activity_log_entity_idx on public.activity_log(entity_type, entity_id);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000006_activity_log.sql
git commit -m "feat(db): add activity_log table"
```

---

### Task 11: Migration — storage buckets

**Files:**
- Create: `supabase/migrations/20260422000007_storage_buckets.sql`

- [ ] **Step 1: Create migration**

```sql
insert into storage.buckets (id, name, public)
values
  ('brand-logos', 'brand-logos', true),
  ('reel-assets', 'reel-assets', false)
on conflict (id) do nothing;

-- brand-logos: authenticated write, public read (public=true already covers read)
create policy "brand_logos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'brand-logos');
create policy "brand_logos_update" on storage.objects for update to authenticated
  using (bucket_id = 'brand-logos');
create policy "brand_logos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'brand-logos');

-- reel-assets: authenticated read/write
create policy "reel_assets_select" on storage.objects for select to authenticated
  using (bucket_id = 'reel-assets');
create policy "reel_assets_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'reel-assets');
create policy "reel_assets_update" on storage.objects for update to authenticated
  using (bucket_id = 'reel-assets');
create policy "reel_assets_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'reel-assets');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000007_storage_buckets.sql
git commit -m "feat(db): add storage buckets and policies"
```

---

### Task 12: Migration — RLS policies for all tables

**Files:**
- Create: `supabase/migrations/20260422000008_rls_policies.sql`

- [ ] **Step 1: Create migration**

```sql
-- Helper function for role checks (SECURITY DEFINER avoids recursion on profiles)
create or replace function public.current_role() returns public.user_role
  language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- Enable RLS on all tables
alter table public.profiles       enable row level security;
alter table public.brands         enable row level security;
alter table public.shoots         enable row level security;
alter table public.reels          enable row level security;
alter table public.reel_references enable row level security;
alter table public.activity_log   enable row level security;

-- profiles
create policy "profiles_select" on public.profiles for select to authenticated using (true);
create policy "profiles_update_self_name" on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "profiles_update_admin" on public.profiles for update to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');
create policy "profiles_delete_admin" on public.profiles for delete to authenticated
  using (public.current_role() = 'admin');

-- brands
create policy "brands_select" on public.brands for select to authenticated using (true);
create policy "brands_insert_writer" on public.brands for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "brands_update_writer" on public.brands for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "brands_delete_admin" on public.brands for delete to authenticated
  using (public.current_role() = 'admin');

-- shoots
create policy "shoots_select" on public.shoots for select to authenticated using (true);
create policy "shoots_insert_writer" on public.shoots for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "shoots_update_writer" on public.shoots for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "shoots_delete_admin" on public.shoots for delete to authenticated
  using (public.current_role() = 'admin');

-- reels
create policy "reels_select" on public.reels for select to authenticated using (true);
create policy "reels_insert_writer" on public.reels for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "reels_update_writer" on public.reels for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "reels_delete_admin" on public.reels for delete to authenticated
  using (public.current_role() = 'admin');

-- reel_references
create policy "refs_select" on public.reel_references for select to authenticated using (true);
create policy "refs_insert_writer" on public.reel_references for insert to authenticated
  with check (public.current_role() in ('admin', 'editor'));
create policy "refs_update_writer" on public.reel_references for update to authenticated
  using (public.current_role() in ('admin', 'editor'));
create policy "refs_delete_admin" on public.reel_references for delete to authenticated
  using (public.current_role() = 'admin');

-- activity_log
create policy "activity_select" on public.activity_log for select to authenticated using (true);
create policy "activity_insert" on public.activity_log for insert to authenticated
  with check (actor_id = auth.uid());
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260422000008_rls_policies.sql
git commit -m "feat(db): add RLS policies for all tables"
```

---

### Task 13: Apply migrations + generate types

**Files:**
- Modify: `src/types/database.ts`
- Modify: `package.json` (add script)

- [ ] **Step 1: Add type-gen script to `package.json`**

Under `"scripts"`:
```json
"db:types": "supabase gen types typescript --local > src/types/database.ts",
"db:reset": "supabase db reset"
```

- [ ] **Step 2: Apply all migrations**

```bash
npm run db:reset
```
Expected: "Finished supabase db reset" and no errors. If any migration fails, the error message names the file — fix and re-run.

- [ ] **Step 3: Generate types**

```bash
npm run db:types
```
Expected: `src/types/database.ts` is overwritten with a full type definition containing `brands`, `shoots`, `reels`, etc.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json src/types/database.ts
git commit -m "chore: apply migrations and generate DB types"
```

---

## Phase 3 — Auth pages

### Task 14: Zod auth schemas

**Files:**
- Create: `src/lib/schemas/profile.ts`
- Create: `tests/unit/schemas/profile.test.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Create vitest config**

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
```

Add scripts to `package.json`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write failing test** — `tests/unit/schemas/profile.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { signInSchema, signUpSchema } from '@/lib/schemas/profile';

describe('signInSchema', () => {
  it('accepts valid email + password', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'secret12' }).success).toBe(true);
  });
  it('rejects short passwords', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(false);
  });
  it('rejects invalid emails', () => {
    expect(signInSchema.safeParse({ email: 'not-an-email', password: 'secret12' }).success).toBe(false);
  });
});

describe('signUpSchema', () => {
  it('requires full_name', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: 'secret12', full_name: '' }).success).toBe(false);
  });
  it('accepts full payload', () => {
    expect(signUpSchema.safeParse({ email: 'a@b.com', password: 'secret12', full_name: 'Sid' }).success).toBe(true);
  });
});
```

- [ ] **Step 3: Run test — expect failure**

```bash
npm test -- profile
```
Expected: error "Cannot find module '@/lib/schemas/profile'".

- [ ] **Step 4: Implement** — `src/lib/schemas/profile.ts`:

```ts
import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = signInSchema.extend({
  full_name: z.string().min(1, 'Name is required').max(100),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
```

- [ ] **Step 5: Run test — expect pass**

```bash
npm test -- profile
```
Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/lib/schemas/profile.ts tests/unit/schemas/profile.test.ts vitest.config.ts package.json
git commit -m "feat(auth): add sign-in/sign-up Zod schemas"
```

---

### Task 15: Login page + server action

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/login/actions.ts`

- [ ] **Step 1: Create server action** — `src/app/(auth)/login/actions.ts`:

```ts
'use server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/schemas/profile';

export async function signInAction(_prev: unknown, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  const supabase = getServerSupabase();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };
  redirect('/');
}
```

- [ ] **Step 2: Create login page** — `src/app/(auth)/login/page.tsx`:

```tsx
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signInAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full">{pending ? 'Signing in…' : 'Sign in'}</Button>;
}

export default function LoginPage() {
  const [state, action] = useFormState(signInAction, { error: '' });
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in to Shoot Planner</h1>
      <form action={action} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>
      <p className="text-sm text-muted-foreground">
        No account yet? <Link href="/signup" className="underline">Sign up</Link>
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev`, open `http://localhost:3000/login`. Confirm form renders. Wrong credentials → error message. (Can't sign in yet — no users.) Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(auth\)/login
git commit -m "feat(auth): add login page"
```

---

### Task 16: Signup page + server action

**Files:**
- Create: `src/app/(auth)/signup/page.tsx`
- Create: `src/app/(auth)/signup/actions.ts`

- [ ] **Step 1: Create server action** — `src/app/(auth)/signup/actions.ts`:

```ts
'use server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { signUpSchema } from '@/lib/schemas/profile';

export async function signUpAction(_prev: unknown, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getServerSupabase();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.full_name } },
  });
  if (error) return { error: error.message };
  redirect('/');
}
```

- [ ] **Step 2: Create signup page** — `src/app/(auth)/signup/page.tsx`:

```tsx
'use client';
import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { signUpAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} className="w-full">{pending ? 'Creating…' : 'Create account'}</Button>;
}

export default function SignupPage() {
  const [state, action] = useFormState(signUpAction, { error: '' });
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <form action={action} className="flex flex-col gap-4">
        <div><Label htmlFor="full_name">Full name</Label><Input id="full_name" name="full_name" required /></div>
        <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div>
        <div><Label htmlFor="password">Password (8+ chars)</Label><Input id="password" name="password" type="password" required minLength={8} /></div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <SubmitButton />
      </form>
      <p className="text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="underline">Sign in</Link>
      </p>
    </main>
  );
}
```

- [ ] **Step 3: Test end-to-end in browser**

Run `npm run dev`. Go to `/signup`. Create account with your real email. Expect redirect to `/` (will 404 for now — that's fine, we build the dashboard next). Stop server.

Verify in Supabase Studio (`http://127.0.0.1:54323`) that `auth.users` and `public.profiles` have rows.

- [ ] **Step 4: Promote yourself to admin**

In Supabase Studio SQL editor (or psql):
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL_HERE');
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(auth\)/signup
git commit -m "feat(auth): add signup page"
```

---

### Task 17: Logout action

**Files:**
- Create: `src/server-actions/account.ts`

- [ ] **Step 1: Implement logout**

```ts
'use server';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';

export async function signOutAction() {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server-actions/account.ts
git commit -m "feat(auth): add logout action"
```

---

## Phase 4 — App shell (sidebar + topbar + error boundary)

### Task 18: App shell layout

**Files:**
- Create: `src/app/(app)/layout.tsx`
- Create: `src/components/sidebar.tsx`
- Create: `src/components/topbar.tsx`
- Create: `src/lib/auth/require-role.ts`
- Create: `src/app/error.tsx`
- Modify: `src/app/layout.tsx` (add Toaster)

- [ ] **Step 1: Add role helper** — `src/lib/auth/require-role.ts`:

```ts
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type UserRole = Database['public']['Enums']['user_role'];

export async function getCurrentUser() {
  const supabase = getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();
  if (!profile) redirect('/login');
  return { user, profile };
}

export async function requireRole(allowed: UserRole[]) {
  const { profile } = await getCurrentUser();
  if (!allowed.includes(profile.role)) {
    throw new Error('Forbidden: insufficient role');
  }
  return profile;
}
```

- [ ] **Step 2: Sidebar** — `src/components/sidebar.tsx`:

```tsx
import Link from 'next/link';
import { LayoutDashboard, Calendar, Building2, Users, UserCircle } from 'lucide-react';
import type { UserRole } from '@/lib/auth/require-role';

export function Sidebar({ role }: { role: UserRole }) {
  return (
    <aside className="flex w-56 flex-col gap-1 border-r bg-muted/30 p-4">
      <Link href="/" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><LayoutDashboard size={16} />Dashboard</Link>
      <Link href="/calendar" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><Calendar size={16} />Calendar</Link>
      <Link href="/brands" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><Building2 size={16} />Brands</Link>
      {role === 'admin' && (
        <Link href="/team" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><Users size={16} />Team</Link>
      )}
      <Link href="/account" className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"><UserCircle size={16} />Account</Link>
    </aside>
  );
}
```

- [ ] **Step 3: Topbar** — `src/components/topbar.tsx`:

```tsx
import { signOutAction } from '@/server-actions/account';
import { Button } from '@/components/ui/button';

export function Topbar({ fullName, role }: { fullName: string; role: string }) {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="text-lg font-semibold">Synergeek Shoot Planner</div>
      <div className="flex items-center gap-3 text-sm">
        <span>{fullName || 'Unnamed'} <span className="text-muted-foreground">({role})</span></span>
        <form action={signOutAction}><Button type="submit" variant="ghost" size="sm">Log out</Button></form>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: App layout** — `src/app/(app)/layout.tsx`:

```tsx
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { getCurrentUser } from '@/lib/auth/require-role';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getCurrentUser();
  return (
    <div className="flex min-h-screen">
      <Sidebar role={profile.role} />
      <div className="flex flex-1 flex-col">
        <Topbar fullName={profile.full_name} role={profile.role} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Global error boundary** — `src/app/error.tsx`:

```tsx
'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded bg-foreground px-3 py-1.5 text-sm text-background">Reload</button>
    </main>
  );
}
```

- [ ] **Step 6: Add Toaster to root** — Modify `src/app/layout.tsx`, add inside `<body>` before `{children}`:

```tsx
import { Toaster } from '@/components/ui/sonner';
// ...inside body:
<Toaster richColors />
```

- [ ] **Step 7: Dashboard stub** — `src/app/(app)/page.tsx`:

```tsx
export default function DashboardPage() {
  return <h1 className="text-2xl font-semibold">Dashboard</h1>;
}
```

- [ ] **Step 8: Smoke test**

Run `npm run dev`. Log in as your admin user. Confirm you see the sidebar, topbar with your name, and "Dashboard" in main area. Log out button works.

- [ ] **Step 9: Commit**

```bash
git add src/app src/components src/lib/auth
git commit -m "feat: app shell with sidebar, topbar, error boundary"
```

---

## Phase 5 — Brands CRUD

### Task 19: Brand Zod schema + unit tests

**Files:**
- Create: `src/lib/schemas/brand.ts`
- Create: `tests/unit/schemas/brand.test.ts`

- [ ] **Step 1: Write failing test**

```ts
import { describe, it, expect } from 'vitest';
import { brandCreateSchema, brandUpdateSchema } from '@/lib/schemas/brand';

describe('brandCreateSchema', () => {
  it('requires a name', () => {
    expect(brandCreateSchema.safeParse({ name: '' }).success).toBe(false);
  });
  it('accepts a minimum payload', () => {
    expect(brandCreateSchema.safeParse({ name: 'Acme' }).success).toBe(true);
  });
  it('rejects oversized names', () => {
    expect(brandCreateSchema.safeParse({ name: 'x'.repeat(201) }).success).toBe(false);
  });
});

describe('brandUpdateSchema', () => {
  it('allows partial updates', () => {
    expect(brandUpdateSchema.safeParse({ description: 'new desc' }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run — expect fail**

```bash
npm test -- brand
```

- [ ] **Step 3: Implement** — `src/lib/schemas/brand.ts`:

```ts
import { z } from 'zod';

export const brandCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(2000).optional().default(''),
  logo_url: z.string().url().nullable().optional(),
});

export const brandUpdateSchema = brandCreateSchema.partial();

export type BrandCreateInput = z.infer<typeof brandCreateSchema>;
export type BrandUpdateInput = z.infer<typeof brandUpdateSchema>;
```

- [ ] **Step 4: Run — expect pass**

```bash
npm test -- brand
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas/brand.ts tests/unit/schemas/brand.test.ts
git commit -m "feat(brand): add Zod schema"
```

---

### Task 20: Brand server actions

**Files:**
- Create: `src/server-actions/brands.ts`

- [ ] **Step 1: Implement**

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { brandCreateSchema, brandUpdateSchema } from '@/lib/schemas/brand';
import { getCurrentUser } from '@/lib/auth/require-role';

export async function createBrand(formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Viewers cannot create brands' };

  const parsed = brandCreateSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('brands')
    .insert({ ...parsed.data, created_by: profile.id })
    .select('id')
    .single();
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    entity_type: 'brand', entity_id: data.id, action: 'created',
    actor_id: profile.id, payload: { name: parsed.data.name },
  });

  revalidatePath('/brands');
  redirect(`/brands/${data.id}`);
}

export async function updateBrand(brandId: string, patch: unknown) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = brandUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getServerSupabase();
  const { error } = await supabase.from('brands').update(parsed.data).eq('id', brandId);
  if (error) return { error: error.message };

  revalidatePath(`/brands/${brandId}`);
  revalidatePath('/brands');
  return { ok: true };
}

export async function deleteBrand(brandId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') return { error: 'Only admins can delete brands' };

  const supabase = getServerSupabase();
  const { error } = await supabase.from('brands').delete().eq('id', brandId);
  if (error) return { error: error.message };
  revalidatePath('/brands');
  redirect('/brands');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server-actions/brands.ts
git commit -m "feat(brand): add create/update/delete server actions"
```

---

### Task 21: Brands list page + new-brand dialog

**Files:**
- Create: `src/app/(app)/brands/page.tsx`
- Create: `src/components/new-brand-dialog.tsx`

- [ ] **Step 1: New-brand dialog** — `src/components/new-brand-dialog.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBrand } from '@/server-actions/brands';
import { toast } from 'sonner';

export function NewBrandDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>+ New brand</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create brand</DialogTitle></DialogHeader>
        <form action={async (fd) => {
          const res = await createBrand(fd);
          if (res?.error) toast.error(res.error);
        }} className="flex flex-col gap-4">
          <div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div>
          <div><Label htmlFor="description">Description (optional)</Label><Textarea id="description" name="description" /></div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Brands list page** — `src/app/(app)/brands/page.tsx`:

```tsx
import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewBrandDialog } from '@/components/new-brand-dialog';
import { Card } from '@/components/ui/card';

export default async function BrandsPage() {
  const { profile } = await getCurrentUser();
  const supabase = getServerSupabase();
  const { data: brands } = await supabase
    .from('brands')
    .select('id, name, description, logo_url, shoots(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Brands</h1>
        {profile.role !== 'viewer' && <NewBrandDialog />}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(brands ?? []).map((b) => (
          <Link key={b.id} href={`/brands/${b.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition">
              <h2 className="font-medium">{b.name}</h2>
              <p className="line-clamp-2 text-sm text-muted-foreground">{b.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{(b.shoots as {count:number}[])[0]?.count ?? 0} shoots</p>
            </Card>
          </Link>
        ))}
        {(brands ?? []).length === 0 && <p className="text-muted-foreground">No brands yet.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Smoke test**

Run dev server. Log in as admin. Go to `/brands`. Create a brand. Confirm redirect to `/brands/<id>` (will 404 — next task). Go back to `/brands`, see the new brand card.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/brands src/components/new-brand-dialog.tsx
git commit -m "feat(brand): add brands list and creation"
```

---

### Task 22: Brand detail page

**Files:**
- Create: `src/app/(app)/brands/[brandId]/page.tsx`

- [ ] **Step 1: Implement**

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewShootDialog } from '@/components/new-shoot-dialog';
import { Card } from '@/components/ui/card';

export default async function BrandDetailPage({ params }: { params: { brandId: string } }) {
  const { profile } = await getCurrentUser();
  const supabase = getServerSupabase();
  const { data: brand } = await supabase
    .from('brands').select('*').eq('id', params.brandId).single();
  if (!brand) notFound();
  const { data: shoots } = await supabase
    .from('shoots').select('id, title, scheduled_at, location_notes')
    .eq('brand_id', brand.id).order('scheduled_at', { ascending: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{brand.name}</h1>
        {brand.description && <p className="text-muted-foreground">{brand.description}</p>}
      </header>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Shoots</h2>
        {profile.role !== 'viewer' && <NewShootDialog brandId={brand.id} />}
      </div>
      <div className="grid gap-3">
        {(shoots ?? []).map((s) => (
          <Link key={s.id} href={`/shoots/${s.id}`}>
            <Card className="p-4 hover:bg-muted/50 transition">
              <div className="flex items-baseline justify-between">
                <h3 className="font-medium">{s.title}</h3>
                <span className="text-sm text-muted-foreground">{format(new Date(s.scheduled_at), 'PP p')}</span>
              </div>
              {s.location_notes && <p className="mt-1 text-sm text-muted-foreground">{s.location_notes}</p>}
            </Card>
          </Link>
        ))}
        {(shoots ?? []).length === 0 && <p className="text-muted-foreground">No shoots yet.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Commit after Task 24 adds `NewShootDialog`. For now this file won't compile — that's expected.

---

## Phase 6 — Shoots CRUD

### Task 23: Shoot schema + server actions

**Files:**
- Create: `src/lib/schemas/shoot.ts`
- Create: `tests/unit/schemas/shoot.test.ts`
- Create: `src/server-actions/shoots.ts`

- [ ] **Step 1: Test** — `tests/unit/schemas/shoot.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { shootCreateSchema } from '@/lib/schemas/shoot';

describe('shootCreateSchema', () => {
  it('requires brand_id, title, scheduled_at', () => {
    expect(shootCreateSchema.safeParse({}).success).toBe(false);
  });
  it('accepts valid payload', () => {
    const result = shootCreateSchema.safeParse({
      brand_id: 'b6f6c0b2-9f9a-4a1e-9b1a-8f8f8f8f8f8f',
      title: 'Spring launch',
      scheduled_at: '2026-05-01T10:00:00Z',
    });
    expect(result.success).toBe(true);
  });
  it('rejects invalid brand_id (not uuid)', () => {
    expect(shootCreateSchema.safeParse({ brand_id: 'not-uuid', title: 't', scheduled_at: '2026-05-01T10:00:00Z' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run — expect fail.** `npm test -- shoot`

- [ ] **Step 3: Schema** — `src/lib/schemas/shoot.ts`:

```ts
import { z } from 'zod';

export const shootCreateSchema = z.object({
  brand_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  scheduled_at: z.string().datetime(),
  location_notes: z.string().max(2000).optional().default(''),
});

export const shootUpdateSchema = shootCreateSchema.partial().omit({ brand_id: true });

export type ShootCreateInput = z.infer<typeof shootCreateSchema>;
export type ShootUpdateInput = z.infer<typeof shootUpdateSchema>;
```

- [ ] **Step 4: Run — expect pass.** `npm test -- shoot`

- [ ] **Step 5: Server actions** — `src/server-actions/shoots.ts`:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { shootCreateSchema, shootUpdateSchema } from '@/lib/schemas/shoot';

export async function createShoot(brandId: string, formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = shootCreateSchema.safeParse({
    brand_id: brandId,
    title: formData.get('title'),
    scheduled_at: formData.get('scheduled_at'),
    location_notes: formData.get('location_notes') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('shoots').insert({ ...parsed.data, created_by: profile.id })
    .select('id').single();
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    entity_type: 'shoot', entity_id: data.id, action: 'created',
    actor_id: profile.id, payload: { title: parsed.data.title },
  });

  revalidatePath(`/brands/${brandId}`);
  redirect(`/shoots/${data.id}`);
}

export async function updateShoot(shootId: string, patch: unknown) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };
  const parsed = shootUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = getServerSupabase();
  const { error } = await supabase.from('shoots').update(parsed.data).eq('id', shootId);
  if (error) return { error: error.message };
  revalidatePath(`/shoots/${shootId}`);
  return { ok: true };
}

export async function deleteShoot(shootId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') return { error: 'Forbidden' };
  const supabase = getServerSupabase();
  const { data: shoot } = await supabase.from('shoots').select('brand_id').eq('id', shootId).single();
  const { error } = await supabase.from('shoots').delete().eq('id', shootId);
  if (error) return { error: error.message };
  if (shoot) revalidatePath(`/brands/${shoot.brand_id}`);
  redirect('/brands');
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/schemas/shoot.ts tests/unit/schemas/shoot.test.ts src/server-actions/shoots.ts
git commit -m "feat(shoot): add schema and server actions"
```

---

### Task 24: New-shoot dialog + shoot detail page

**Files:**
- Create: `src/components/new-shoot-dialog.tsx`
- Create: `src/app/(app)/shoots/[shootId]/page.tsx`

- [ ] **Step 1: New-shoot dialog** — `src/components/new-shoot-dialog.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createShoot } from '@/server-actions/shoots';
import { toast } from 'sonner';

export function NewShootDialog({ brandId }: { brandId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>+ New shoot</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Schedule a shoot</DialogTitle></DialogHeader>
        <form
          action={async (fd) => {
            const res = await createShoot(brandId, fd);
            if (res?.error) toast.error(res.error);
          }}
          className="flex flex-col gap-4"
        >
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <div><Label htmlFor="scheduled_at">Date & time</Label><Input id="scheduled_at" name="scheduled_at" type="datetime-local" required /></div>
          <div><Label htmlFor="location_notes">Location notes (optional)</Label><Textarea id="location_notes" name="location_notes" /></div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

Note: `datetime-local` returns `YYYY-MM-DDTHH:mm` without timezone. We convert it in the server action by appending `:00Z` OR (preferred) accept any ISO-like string — update `scheduled_at` input to be normalized. Simpler fix: coerce on server. Update `src/server-actions/shoots.ts` `createShoot` parsing:

```ts
const raw = String(formData.get('scheduled_at') ?? '');
const normalized = raw.includes('Z') || raw.includes('+') ? raw : new Date(raw).toISOString();

const parsed = shootCreateSchema.safeParse({
  brand_id: brandId,
  title: formData.get('title'),
  scheduled_at: normalized,
  location_notes: formData.get('location_notes') ?? '',
});
```

- [ ] **Step 2: Shoot detail page** — `src/app/(app)/shoots/[shootId]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { NewReelDialog } from '@/components/new-reel-dialog';
import { StatusBadge } from '@/components/status-badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function ShootDetailPage({ params }: { params: { shootId: string } }) {
  const { profile } = await getCurrentUser();
  const supabase = getServerSupabase();
  const { data: shoot } = await supabase
    .from('shoots').select('*, brand:brands(id, name)').eq('id', params.shootId).single();
  if (!shoot) notFound();
  const { data: reels } = await supabase
    .from('reels').select('id, title, status, position')
    .eq('shoot_id', shoot.id).order('position', { ascending: true });

  return (
    <div className="space-y-6">
      <header>
        <Link href={`/brands/${shoot.brand.id}`} className="text-sm text-muted-foreground underline">{shoot.brand.name}</Link>
        <h1 className="text-2xl font-semibold">{shoot.title}</h1>
        <p className="text-sm text-muted-foreground">{format(new Date(shoot.scheduled_at), 'PPPP p')}</p>
        {shoot.location_notes && <p className="mt-2">{shoot.location_notes}</p>}
      </header>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Reels</h2>
        {profile.role !== 'viewer' && <NewReelDialog shootId={shoot.id} />}
      </div>
      <div className="grid gap-3">
        {(reels ?? []).map((r) => (
          <Link key={r.id} href={`/reels/${r.id}`}>
            <Card className="flex items-center justify-between p-4 hover:bg-muted/50 transition">
              <span className="font-medium">{r.title}</span>
              <StatusBadge status={r.status} />
            </Card>
          </Link>
        ))}
        {(reels ?? []).length === 0 && <p className="text-muted-foreground">No reels yet.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit** (page won't compile until Task 25/26 add Reel pieces — fine, we commit after those).

---

## Phase 7 — Reels CRUD and inline editor

### Task 25: Reel schema + status badge

**Files:**
- Create: `src/lib/schemas/reel.ts`
- Create: `tests/unit/schemas/reel.test.ts`
- Create: `src/components/status-badge.tsx`

- [ ] **Step 1: Test** — `tests/unit/schemas/reel.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { reelCreateSchema, reelUpdateSchema, REEL_STATUSES } from '@/lib/schemas/reel';

describe('reelCreateSchema', () => {
  it('requires shoot_id and title', () => {
    expect(reelCreateSchema.safeParse({}).success).toBe(false);
  });
  it('accepts minimum payload', () => {
    expect(reelCreateSchema.safeParse({
      shoot_id: 'b6f6c0b2-9f9a-4a1e-9b1a-8f8f8f8f8f8f', title: 'Reel A',
    }).success).toBe(true);
  });
});

describe('reelUpdateSchema', () => {
  it('accepts valid status', () => {
    expect(reelUpdateSchema.safeParse({ status: 'shot' }).success).toBe(true);
  });
  it('rejects unknown status', () => {
    expect(reelUpdateSchema.safeParse({ status: 'bogus' }).success).toBe(false);
  });
});

describe('REEL_STATUSES', () => {
  it('has 5 statuses', () => {
    expect(REEL_STATUSES).toHaveLength(5);
  });
});
```

- [ ] **Step 2: Schema** — `src/lib/schemas/reel.ts`:

```ts
import { z } from 'zod';

export const REEL_STATUSES = ['planning', 'ready_to_shoot', 'shot', 'edited', 'posted'] as const;
export const reelStatusSchema = z.enum(REEL_STATUSES);

export const reelCreateSchema = z.object({
  shoot_id: z.string().uuid(),
  title: z.string().min(1).max(200),
});

export const reelUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  status: reelStatusSchema.optional(),
  script_text: z.string().max(20000).optional(),
  script_file_url: z.string().nullable().optional(),
  product_name: z.string().max(500).optional(),
  product_image_url: z.string().nullable().optional(),
  location_text: z.string().max(2000).optional(),
  location_image_url: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

export type ReelStatus = z.infer<typeof reelStatusSchema>;
export type ReelCreateInput = z.infer<typeof reelCreateSchema>;
export type ReelUpdateInput = z.infer<typeof reelUpdateSchema>;
```

- [ ] **Step 3: Run tests — expect pass.** `npm test -- reel`

- [ ] **Step 4: Status badge** — `src/components/status-badge.tsx`:

```tsx
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
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/schemas/reel.ts tests/unit/schemas/reel.test.ts src/components/status-badge.tsx
git commit -m "feat(reel): add schema and status badge"
```

---

### Task 26: Reel server actions (CRUD + status + references)

**Files:**
- Create: `src/server-actions/reels.ts`
- Create: `src/server-actions/reel-references.ts`

- [ ] **Step 1: Reel actions** — `src/server-actions/reels.ts`:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { reelCreateSchema, reelUpdateSchema } from '@/lib/schemas/reel';

export async function createReel(shootId: string, formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = reelCreateSchema.safeParse({
    shoot_id: shootId,
    title: formData.get('title'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getServerSupabase();
  const { count } = await supabase.from('reels').select('id', { count: 'exact', head: true }).eq('shoot_id', shootId);
  const { data, error } = await supabase
    .from('reels').insert({ ...parsed.data, position: count ?? 0 })
    .select('id').single();
  if (error) return { error: error.message };

  await supabase.from('activity_log').insert({
    entity_type: 'reel', entity_id: data.id, action: 'created',
    actor_id: profile.id, payload: { title: parsed.data.title },
  });

  revalidatePath(`/shoots/${shootId}`);
  redirect(`/reels/${data.id}`);
}

export async function updateReel(reelId: string, patch: unknown) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };

  const parsed = reelUpdateSchema.safeParse(patch);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = getServerSupabase();

  if (parsed.data.status) {
    const { data: before } = await supabase.from('reels').select('status, shoot_id').eq('id', reelId).single();
    const { error } = await supabase.from('reels').update(parsed.data).eq('id', reelId);
    if (error) return { error: error.message };
    if (before && before.status !== parsed.data.status) {
      await supabase.from('activity_log').insert({
        entity_type: 'reel', entity_id: reelId, action: 'status_changed',
        actor_id: profile.id, payload: { from: before.status, to: parsed.data.status },
      });
    }
    revalidatePath(`/reels/${reelId}`);
    if (before) revalidatePath(`/shoots/${before.shoot_id}`);
    return { ok: true };
  }

  const { error } = await supabase.from('reels').update(parsed.data).eq('id', reelId);
  if (error) return { error: error.message };
  revalidatePath(`/reels/${reelId}`);
  return { ok: true };
}

export async function deleteReel(reelId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') return { error: 'Forbidden' };
  const supabase = getServerSupabase();
  const { data: reel } = await supabase.from('reels').select('shoot_id').eq('id', reelId).single();
  const { error } = await supabase.from('reels').delete().eq('id', reelId);
  if (error) return { error: error.message };
  if (reel) {
    await supabase.storage.from('reel-assets').remove([
      `${reelId}/script`, `${reelId}/product`, `${reelId}/location`,
    ]);
    revalidatePath(`/shoots/${reel.shoot_id}`);
    redirect(`/shoots/${reel.shoot_id}`);
  }
  redirect('/brands');
}
```

- [ ] **Step 2: References actions** — `src/server-actions/reel-references.ts`:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';

const refSchema = z.object({
  url: z.string().url(),
  label: z.string().max(200).optional().default(''),
});

export async function addReference(reelId: string, formData: FormData) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' as const };
  const parsed = refSchema.safeParse({
    url: formData.get('url'),
    label: formData.get('label') ?? '',
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('reel_references')
    .insert({ ...parsed.data, reel_id: reelId })
    .select('id, url, label')
    .single();
  if (error) return { error: error.message };
  revalidatePath(`/reels/${reelId}`);
  return { reference: data };
}

export async function removeReference(referenceId: string, reelId: string) {
  const { profile } = await getCurrentUser();
  if (profile.role === 'viewer') return { error: 'Forbidden' };
  const supabase = getServerSupabase();
  const { error } = await supabase.from('reel_references').delete().eq('id', referenceId);
  if (error) return { error: error.message };
  revalidatePath(`/reels/${reelId}`);
  return { ok: true };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/server-actions/reels.ts src/server-actions/reel-references.ts
git commit -m "feat(reel): add CRUD and reference server actions"
```

---

### Task 27: File upload action + helper

**Files:**
- Create: `src/server-actions/uploads.ts`
- Create: `src/components/file-upload.tsx`

- [ ] **Step 1: Upload action** — `src/server-actions/uploads.ts`:

```ts
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
  if (profile.role === 'viewer') return { error: 'Forbidden' };
  if (file.size > MAX_BYTES) return { error: 'File too large (max 10MB)' };
  if (!ALLOWED_MIME.has(file.type)) return { error: `Unsupported file type: ${file.type}` };

  const supabase = getServerSupabase();
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
```

- [ ] **Step 2: File-upload component** — `src/components/file-upload.tsx`:

```tsx
'use client';
import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
```

- [ ] **Step 3: Commit**

```bash
git add src/server-actions/uploads.ts src/components/file-upload.tsx
git commit -m "feat: add file upload action and component"
```

---

### Task 28: Reel detail page (inline editor) + new-reel dialog

**Files:**
- Create: `src/components/new-reel-dialog.tsx`
- Create: `src/components/reel-editor.tsx`
- Create: `src/components/reel-references-list.tsx`
- Create: `src/app/(app)/reels/[reelId]/page.tsx`

- [ ] **Step 1: New-reel dialog** — `src/components/new-reel-dialog.tsx`:

```tsx
'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createReel } from '@/server-actions/reels';
import { toast } from 'sonner';

export function NewReelDialog({ shootId }: { shootId: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>+ New reel</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add a reel</DialogTitle></DialogHeader>
        <form
          action={async (fd) => {
            const res = await createReel(shootId, fd);
            if (res?.error) toast.error(res.error);
          }}
          className="flex flex-col gap-4"
        >
          <div><Label htmlFor="title">Title</Label><Input id="title" name="title" required /></div>
          <Button type="submit">Create</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Inline editor** — `src/components/reel-editor.tsx`:

```tsx
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
```

- [ ] **Step 3: References list** — `src/components/reel-references-list.tsx`:

```tsx
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
```

- [ ] **Step 4: Reel detail page** — `src/app/(app)/reels/[reelId]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { ReelEditor } from '@/components/reel-editor';
import { ReelReferencesList } from '@/components/reel-references-list';

export default async function ReelDetailPage({ params }: { params: { reelId: string } }) {
  const { profile } = await getCurrentUser();
  const supabase = getServerSupabase();
  const { data: reel } = await supabase
    .from('reels')
    .select('*, shoot:shoots(id, title, brand_id, brand:brands(name))')
    .eq('id', params.reelId).single();
  if (!reel) notFound();
  const { data: refs } = await supabase
    .from('reel_references').select('id, url, label').eq('reel_id', reel.id);

  const canEdit = profile.role !== 'viewer';

  return (
    <div className="space-y-6">
      <nav className="text-sm text-muted-foreground">
        <Link href={`/brands/${reel.shoot.brand_id}`} className="underline">{reel.shoot.brand.name}</Link>
        {' / '}
        <Link href={`/shoots/${reel.shoot.id}`} className="underline">{reel.shoot.title}</Link>
      </nav>
      <ReelEditor reel={reel} canEdit={canEdit} />
      <ReelReferencesList reelId={reel.id} initial={refs ?? []} canEdit={canEdit} />
    </div>
  );
}
```

- [ ] **Step 5: Smoke test (full brand → shoot → reel flow)**

Run dev server. As admin: create brand → create shoot → create reel → edit script text → upload a small image for product → add a reference link → change status to "shot". Reload page — all persisted.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(app\) src/components
git commit -m "feat(reel): add detail page with inline editor and references"
```

---

## Phase 8 — Calendar view

### Task 29: Calendar grid

**Files:**
- Create: `src/components/calendar-grid.tsx`
- Create: `src/app/(app)/calendar/page.tsx`

- [ ] **Step 1: Calendar grid** — `src/components/calendar-grid.tsx`:

```tsx
'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { addMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';

type Event = { id: string; title: string; scheduled_at: string; brand_name: string; brand_id: string };

function hashColor(id: string) {
  let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 45%)`;
}

export function CalendarGrid({ events }: { events: Event[] }) {
  const [cursor, setCursor] = useState(new Date());
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor));
    const end = endOfWeek(endOfMonth(cursor));
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{format(cursor, 'MMMM yyyy')}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setCursor(addMonths(cursor, -1))}>←</Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>Today</Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(addMonths(cursor, 1))}>→</Button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-xs text-muted-foreground">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => <div key={d} className="p-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-px rounded border bg-border">
        {days.map((d) => {
          const dayEvents = events.filter((e) => isSameDay(new Date(e.scheduled_at), d));
          return (
            <div key={d.toISOString()} className="min-h-28 bg-background p-1 text-xs">
              <div className="text-muted-foreground">{format(d, 'd')}</div>
              <div className="mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <Link key={e.id} href={`/shoots/${e.id}`}
                    className="block truncate rounded px-1.5 py-1 text-white"
                    style={{ background: hashColor(e.brand_id) }}>
                    <span className="font-medium">{format(new Date(e.scheduled_at), 'HH:mm')}</span>{' '}{e.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Calendar page** — `src/app/(app)/calendar/page.tsx`:

```tsx
import { getServerSupabase } from '@/lib/supabase/server';
import { CalendarGrid } from '@/components/calendar-grid';

export default async function CalendarPage() {
  const supabase = getServerSupabase();
  const { data: shoots } = await supabase
    .from('shoots').select('id, title, scheduled_at, brand:brands(id, name)')
    .order('scheduled_at', { ascending: true });

  const events = (shoots ?? []).map((s) => ({
    id: s.id, title: s.title, scheduled_at: s.scheduled_at,
    brand_id: s.brand.id, brand_name: s.brand.name,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Calendar</h1>
      <CalendarGrid events={events} />
    </div>
  );
}
```

- [ ] **Step 3: Smoke test.** Visit `/calendar`, confirm shoots appear on their days color-coded by brand. Clicking a shoot navigates.

- [ ] **Step 4: Commit**

```bash
git add src/components/calendar-grid.tsx src/app/\(app\)/calendar
git commit -m "feat: add monthly calendar view"
```

---

## Phase 9 — Dashboard, Team, Account

### Task 30: Dashboard with upcoming shoots + status counts

**Files:**
- Modify: `src/app/(app)/page.tsx`

- [ ] **Step 1: Replace stub**

```tsx
import Link from 'next/link';
import { addDays, format } from 'date-fns';
import { getServerSupabase } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { REEL_STATUSES } from '@/lib/schemas/reel';

export default async function DashboardPage() {
  const supabase = getServerSupabase();
  const now = new Date();
  const weekOut = addDays(now, 7);

  const [{ data: upcoming }, { data: statusRows }, { data: recent }] = await Promise.all([
    supabase.from('shoots')
      .select('id, title, scheduled_at, brand:brands(name)')
      .gte('scheduled_at', now.toISOString()).lte('scheduled_at', weekOut.toISOString())
      .order('scheduled_at', { ascending: true }),
    supabase.from('reels').select('status'),
    supabase.from('activity_log').select('*, actor:profiles(full_name)').order('created_at', { ascending: false }).limit(10),
  ]);

  const counts = Object.fromEntries(REEL_STATUSES.map((s) => [s, 0]));
  for (const r of statusRows ?? []) counts[r.status as keyof typeof counts]++;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="mb-3 text-lg font-medium">Upcoming shoots (next 7 days)</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(upcoming ?? []).map((s) => (
            <Link key={s.id} href={`/shoots/${s.id}`}>
              <Card className="p-4 hover:bg-muted/50 transition">
                <div className="text-sm text-muted-foreground">{s.brand.name}</div>
                <div className="font-medium">{s.title}</div>
                <div className="text-sm text-muted-foreground">{format(new Date(s.scheduled_at), 'PP p')}</div>
              </Card>
            </Link>
          ))}
          {(upcoming ?? []).length === 0 && <p className="text-muted-foreground">Nothing scheduled this week.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Reels by status</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {REEL_STATUSES.map((s) => (
            <Card key={s} className="p-4">
              <div className="text-sm text-muted-foreground">{s.replace('_',' ')}</div>
              <div className="text-2xl font-semibold">{counts[s]}</div>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">Recent activity</h2>
        <ul className="space-y-2 text-sm">
          {(recent ?? []).map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded border px-3 py-2">
              <span><span className="font-medium">{a.actor?.full_name || 'someone'}</span> {a.action.replace('_',' ')} a {a.entity_type}</span>
              <span className="text-muted-foreground">{format(new Date(a.created_at), 'PP p')}</span>
            </li>
          ))}
          {(recent ?? []).length === 0 && <p className="text-muted-foreground">No activity yet.</p>}
        </ul>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(app\)/page.tsx
git commit -m "feat: dashboard with upcoming shoots, status counts, activity"
```

---

### Task 31: Team page (admin-only) + role-change action

**Files:**
- Create: `src/app/(app)/team/page.tsx`
- Create: `src/server-actions/team.ts`

- [ ] **Step 1: Server action** — `src/server-actions/team.ts`:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/require-role';

const roleSchema = z.enum(['admin', 'editor', 'viewer']);

export async function updateUserRole(userId: string, role: string) {
  await requireRole(['admin']);
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: 'Invalid role' };
  const supabase = getServerSupabase();
  const { error } = await supabase.from('profiles').update({ role: parsed.data }).eq('id', userId);
  if (error) return { error: error.message };
  revalidatePath('/team');
  return { ok: true };
}
```

- [ ] **Step 2: Team page** — `src/app/(app)/team/page.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';
import { RoleSelect } from './role-select';
import { Card } from '@/components/ui/card';

export default async function TeamPage() {
  const { profile } = await getCurrentUser();
  if (profile.role !== 'admin') redirect('/');
  const supabase = getServerSupabase();
  const { data: members } = await supabase.from('profiles').select('id, full_name, role').order('full_name');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Team</h1>
      <div className="grid gap-3">
        {(members ?? []).map((m) => (
          <Card key={m.id} className="flex items-center justify-between p-4">
            <span>{m.full_name || 'Unnamed'}</span>
            <RoleSelect userId={m.id} current={m.role as 'admin' | 'editor' | 'viewer'} disabled={m.id === profile.id} />
          </Card>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Role select client component** — `src/app/(app)/team/role-select.tsx`:

```tsx
'use client';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateUserRole } from '@/server-actions/team';

export function RoleSelect({ userId, current, disabled }: { userId: string; current: 'admin'|'editor'|'viewer'; disabled?: boolean }) {
  const [, start] = useTransition();
  return (
    <Select
      value={current}
      disabled={disabled}
      onValueChange={(v) => start(async () => {
        const res = await updateUserRole(userId, v);
        if ('error' in res && res.error) toast.error(res.error);
        else toast.success('Role updated');
      })}
    >
      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/team src/server-actions/team.ts
git commit -m "feat: admin team management page"
```

---

### Task 32: Account page (name + password)

**Files:**
- Create: `src/app/(app)/account/page.tsx`
- Modify: `src/server-actions/account.ts`

- [ ] **Step 1: Extend actions** — `src/server-actions/account.ts`:

```ts
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getServerSupabase } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth/require-role';

export async function signOutAction() {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function updateFullName(formData: FormData) {
  const { profile } = await getCurrentUser();
  const name = z.string().min(1).max(100).safeParse(formData.get('full_name'));
  if (!name.success) return { error: 'Name must be 1–100 characters' };
  const supabase = getServerSupabase();
  const { error } = await supabase.from('profiles').update({ full_name: name.data }).eq('id', profile.id);
  if (error) return { error: error.message };
  revalidatePath('/account');
  return { ok: true };
}

export async function updatePassword(formData: FormData) {
  const pw = z.string().min(8).safeParse(formData.get('password'));
  if (!pw.success) return { error: 'Password must be 8+ characters' };
  const supabase = getServerSupabase();
  const { error } = await supabase.auth.updateUser({ password: pw.data });
  if (error) return { error: error.message };
  return { ok: true };
}
```

- [ ] **Step 2: Account page** — `src/app/(app)/account/page.tsx`:

```tsx
import { getCurrentUser } from '@/lib/auth/require-role';
import { AccountForms } from './forms';

export default async function AccountPage() {
  const { user, profile } = await getCurrentUser();
  return (
    <div className="space-y-6 max-w-md">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="text-sm text-muted-foreground">{user.email} ({profile.role})</p>
      <AccountForms initialName={profile.full_name} />
    </div>
  );
}
```

- [ ] **Step 3: Forms component** — `src/app/(app)/account/forms.tsx`:

```tsx
'use client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateFullName, updatePassword } from '@/server-actions/account';

export function AccountForms({ initialName }: { initialName: string }) {
  return (
    <div className="space-y-8">
      <form
        action={async (fd) => {
          const res = await updateFullName(fd);
          if ('error' in res && res.error) toast.error(res.error);
          else toast.success('Name updated');
        }}
        className="flex flex-col gap-3"
      >
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={initialName} />
        <Button type="submit" className="self-start">Save name</Button>
      </form>

      <form
        action={async (fd) => {
          const res = await updatePassword(fd);
          if ('error' in res && res.error) toast.error(res.error);
          else toast.success('Password updated');
        }}
        className="flex flex-col gap-3"
      >
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" minLength={8} />
        <Button type="submit" className="self-start">Change password</Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(app\)/account src/server-actions/account.ts
git commit -m "feat: account page with name and password update"
```

---

## Phase 10 — Integration & E2E tests

### Task 33: RLS integration tests — viewer cannot mutate

**Files:**
- Create: `tests/integration/_helpers.ts`
- Create: `tests/integration/rls-viewer.test.ts`

- [ ] **Step 1: Helpers** — `tests/integration/_helpers.ts`:

```ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const admin = () => createClient<Database>(URL, SERVICE, { auth: { persistSession: false } });

export async function createUserWithRole(role: 'admin'|'editor'|'viewer') {
  const a = admin();
  const email = `${role}-${Date.now()}-${Math.random().toString(36).slice(2,8)}@test.local`;
  const password = 'test-password-123';
  const { data, error } = await a.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw error ?? new Error('no user');
  await a.from('profiles').update({ role, full_name: role }).eq('id', data.user.id);
  const anon = createClient<Database>(URL, ANON, { auth: { persistSession: false } });
  await anon.auth.signInWithPassword({ email, password });
  return { client: anon, userId: data.user.id, email };
}

export async function seedBrand() {
  const a = admin();
  const { data: u } = await a.auth.admin.listUsers();
  const firstUser = u.users[0];
  const { data, error } = await a.from('brands').insert({ name: 'Seed brand', created_by: firstUser!.id }).select('id').single();
  if (error) throw error;
  return data.id;
}
```

- [ ] **Step 2: Viewer test** — `tests/integration/rls-viewer.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createUserWithRole, seedBrand } from './_helpers';

let viewer: Awaited<ReturnType<typeof createUserWithRole>>;
let brandId: string;

beforeAll(async () => {
  viewer = await createUserWithRole('viewer');
  brandId = await seedBrand();
});

describe('RLS: viewer', () => {
  it('can read brands', async () => {
    const { data, error } = await viewer.client.from('brands').select('id').eq('id', brandId).single();
    expect(error).toBeNull();
    expect(data?.id).toBe(brandId);
  });
  it('cannot insert a brand', async () => {
    const { error } = await viewer.client.from('brands').insert({ name: 'Nope', created_by: viewer.userId });
    expect(error).not.toBeNull();
  });
  it('cannot update a brand', async () => {
    const { error, count } = await viewer.client.from('brands').update({ name: 'Hacked' }).eq('id', brandId).select('*', { count: 'exact' });
    // RLS returns no rows affected rather than error on update
    expect(count ?? 0).toBe(0);
    void error;
  });
  it('cannot delete a brand', async () => {
    const { count } = await viewer.client.from('brands').delete().eq('id', brandId).select('*', { count: 'exact' });
    expect(count ?? 0).toBe(0);
  });
});
```

- [ ] **Step 3: Add integration script** — in `package.json`:

```json
"test:integration": "vitest run tests/integration"
```

- [ ] **Step 4: Run**

```bash
npm run test:integration
```
Expected: all pass. If viewer CAN mutate, RLS is broken — go back to Task 12.

- [ ] **Step 5: Commit**

```bash
git add tests/integration package.json
git commit -m "test: RLS viewer cannot mutate"
```

---

### Task 34: RLS integration — editor and admin

**Files:**
- Create: `tests/integration/rls-editor.test.ts`
- Create: `tests/integration/rls-admin.test.ts`

- [ ] **Step 1: Editor** — `tests/integration/rls-editor.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createUserWithRole } from './_helpers';

let editor: Awaited<ReturnType<typeof createUserWithRole>>;
let brandId: string;

beforeAll(async () => {
  editor = await createUserWithRole('editor');
  const { data, error } = await editor.client.from('brands').insert({ name: 'Editor brand', created_by: editor.userId }).select('id').single();
  if (error) throw error;
  brandId = data!.id;
});

describe('RLS: editor', () => {
  it('can create and update', async () => {
    const { error } = await editor.client.from('brands').update({ name: 'Updated' }).eq('id', brandId);
    expect(error).toBeNull();
  });
  it('cannot delete', async () => {
    const { count } = await editor.client.from('brands').delete().eq('id', brandId).select('*', { count: 'exact' });
    expect(count ?? 0).toBe(0);
  });
});
```

- [ ] **Step 2: Admin** — `tests/integration/rls-admin.test.ts`:

```ts
import { describe, it, expect, beforeAll } from 'vitest';
import { createUserWithRole } from './_helpers';

let adminUser: Awaited<ReturnType<typeof createUserWithRole>>;

beforeAll(async () => {
  adminUser = await createUserWithRole('admin');
});

describe('RLS: admin', () => {
  it('can create + delete', async () => {
    const { data: insert, error: e1 } = await adminUser.client.from('brands').insert({ name: 'AdminBrand', created_by: adminUser.userId }).select('id').single();
    expect(e1).toBeNull();
    const { error: e2 } = await adminUser.client.from('brands').delete().eq('id', insert!.id);
    expect(e2).toBeNull();
  });
});
```

- [ ] **Step 3: Run and commit**

```bash
npm run test:integration
git add tests/integration
git commit -m "test: RLS editor and admin permissions"
```

---

### Task 35: Playwright E2E — editor flow

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/e2e/editor-flow.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Config** — `playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI, timeout: 60_000 },
});
```

- [ ] **Step 2: Add scripts**

```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

- [ ] **Step 3: Editor flow test** — `tests/e2e/editor-flow.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import { createUserWithRole } from '../integration/_helpers';

test('editor can create brand → shoot → reel and change status', async ({ page }) => {
  const { email } = await createUserWithRole('editor');
  const password = 'test-password-123';

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/brands');
  await page.getByRole('button', { name: /new brand/i }).click();
  await page.getByLabel('Name').fill('E2E Brand');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page.getByRole('heading', { name: 'E2E Brand' })).toBeVisible();

  await page.getByRole('button', { name: /new shoot/i }).click();
  await page.getByLabel('Title').fill('E2E Shoot');
  await page.getByLabel(/date/i).fill('2026-06-15T10:00');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page.getByRole('heading', { name: 'E2E Shoot' })).toBeVisible();

  await page.getByRole('button', { name: /new reel/i }).click();
  await page.getByLabel('Title').fill('E2E Reel');
  await page.getByRole('button', { name: /create/i }).click();

  // On reel page, change status
  await page.getByRole('combobox').first().click();
  await page.getByRole('option', { name: /shot/i }).click();
  await expect(page.getByRole('combobox').first()).toContainText('Shot');
});
```

- [ ] **Step 4: Run**

```bash
npm run test:e2e
```
Expected: passes. If redirects loop, check middleware.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e package.json
git commit -m "test(e2e): editor can create brand/shoot/reel and change status"
```

---

### Task 36: E2E — viewer flow

**Files:**
- Create: `tests/e2e/viewer-flow.spec.ts`

- [ ] **Step 1: Test**

```ts
import { test, expect } from '@playwright/test';
import { createUserWithRole } from '../integration/_helpers';

test('viewer sees data but cannot edit', async ({ page }) => {
  const { email } = await createUserWithRole('viewer');
  const password = 'test-password-123';

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('/');

  await page.goto('/brands');
  await expect(page.getByRole('heading', { name: /brands/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /new brand/i })).toHaveCount(0);
});
```

- [ ] **Step 2: Run + commit**

```bash
npm run test:e2e
git add tests/e2e/viewer-flow.spec.ts
git commit -m "test(e2e): viewer cannot see edit/create buttons"
```

---

## Phase 11 — CI and deployment

### Task 37: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Workflow**

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  lint-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - uses: supabase/setup-cli@v1
        with: { version: latest }
      - run: npm ci
      - run: supabase start
      - run: npm run db:types
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run test:integration
        env:
          NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ env.SUPABASE_ANON }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ env.SUPABASE_SERVICE }}
```

Note: `supabase start` prints keys; capture them into env. Simpler approach — use a composite action or set known fixed keys via `supabase/config.toml`. For MVP, rely on the stable local keys that `supabase start` always produces (hardcoded in Supabase CLI). Replace `${{ env.SUPABASE_ANON }}` with the literal anon key once known; or add a step to parse `supabase status` output.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "chore: add CI workflow"
```

---

### Task 38: Deploy to Vercel + hosted Supabase

**Files:**
- Modify: `.env.local.example` (add production guidance)
- Create: `README.md`

- [ ] **Step 1: Create hosted Supabase project**

On https://supabase.com → New project → region closest to you. Wait for provisioning.

Grab: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from Settings → API.

- [ ] **Step 2: Push migrations to hosted DB**

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

- [ ] **Step 3: Create Vercel project**

- Push the repo to GitHub.
- On Vercel → Import → select the repo.
- Add the three env vars above.
- Deploy.

- [ ] **Step 4: Bootstrap first admin on prod**

Sign up via the deployed URL, then in Supabase Studio (hosted):
```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

- [ ] **Step 5: README**

Create `README.md`:

````markdown
# Shoot Planner

Team planner for Synergeek video shoots.

## Local dev
```bash
npm install
npx supabase start
cp .env.local.example .env.local  # fill in keys from supabase start
npm run db:reset
npm run db:types
npm run dev
```

Then sign up at `/signup`, and in Supabase Studio (localhost:54323) promote yourself to admin:
```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

## Tests
- `npm test` — unit
- `npm run test:integration` — RLS (needs Supabase running)
- `npm run test:e2e` — Playwright (needs dev server or CI runner)

## Deploy
- Push migrations: `npx supabase db push` (after `supabase link`)
- Vercel: connect repo, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
````

- [ ] **Step 6: Commit**

```bash
git add README.md .env.local.example
git commit -m "docs: README and deployment guide"
```

---

## Done

At this point:
- All spec features are implemented.
- Unit, integration (RLS), and E2E tests cover the critical paths.
- CI runs on every PR.
- App is deployed and usable.

Next: invite the team, create your first real brand, and plan your first shoot.
