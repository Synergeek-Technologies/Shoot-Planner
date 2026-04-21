# Synergeek Shoot Planner

Internal team app for planning video shoots for client brands.

Stack: Next.js 15 (App Router, Server Actions), React 19, Supabase (Postgres + Auth + Storage + RLS), Zod, Tailwind, shadcn/ui (Base UI), Vitest, Playwright.

## What it does

- Organize work as **Brand → Shoot (day) → Reel (individual content)**
- Per reel: script (text + file), product (name + image), location (notes + image), reference links, status
- Status pipeline: Planning → Ready to shoot → Shot → Edited → Posted
- Monthly calendar across all brands
- Three roles: Admin (full control), Editor (create/edit, no delete), Viewer (read-only)

## Local development

Requires: Node 20+, Docker Desktop (for local Supabase).

```bash
npm install
npx supabase start                 # prints keys
cp .env.local.example .env.local   # then paste keys into .env.local
npm run db:reset                   # apply migrations
npm run db:types                   # regenerate TS types from schema
npm run dev                        # http://localhost:3000
```

Sign up at `/signup`. Promote yourself to admin in Supabase Studio (`http://127.0.0.1:54323`) SQL editor:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

## Tests

```bash
npm test                     # unit (Zod schemas)
npm run test:integration     # RLS policies — needs Supabase running
npm run test:e2e             # Playwright — needs Supabase running
npm run test:e2e:ui          # Playwright UI mode
```

## Deployment

**1. Hosted Supabase**

Create a project at https://supabase.com. From Settings → API, copy the `Project URL`, `anon` key, and `service_role` key. Then:

```bash
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

**2. Vercel**

Push this repo to GitHub. On vercel.com → Import the repo. Add three env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Deploy.

**3. Bootstrap the first admin on prod**

Sign up on the deployed URL, then in the hosted Supabase SQL editor:

```sql
update profiles set role = 'admin'
where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

Invite teammates by sharing the signup URL — they land as viewers until you promote them on `/team`.

## Project layout

```
src/
├── app/
│   ├── (auth)/{login,signup}     # unauthenticated pages
│   └── (app)/                     # authenticated shell (sidebar + topbar)
│       ├── page.tsx               # dashboard
│       ├── calendar/
│       ├── brands/[brandId]/
│       ├── shoots/[shootId]/
│       ├── reels/[reelId]/
│       ├── team/                  # admin only
│       └── account/
├── components/                    # UI components (editor, dialogs, calendar, etc.)
├── lib/
│   ├── supabase/                  # browser/server/middleware clients
│   ├── schemas/                   # Zod schemas (shared client+server)
│   └── auth/                      # getCurrentUser, requireRole
├── server-actions/                # all mutations live here
└── types/database.ts              # generated from Supabase schema
supabase/migrations/               # 8 SQL files (schema + RLS)
tests/{unit,integration,e2e}/      # vitest + Playwright
```
