# Shoot Planner — Design Spec

**Date:** 2026-04-22
**Owner:** Sidharth (Synergeek)
**Status:** Approved for planning

## Summary

A team web app for Synergeek (a digital marketing agency) to plan video shoots for its brand clients. A planner organizes brands, shoots (one shoot = one day/session), and reels (individual pieces of content inside a shoot). Each reel captures script, product, location, and reference links. The team tracks each reel through a status pipeline from planning to posted. A calendar view shows all shoots across all brands.

## Goals

- One place for the Synergeek team to plan and coordinate shoots across all client brands.
- Capture everything needed for a reel: script (text or file), product (text or image), location (text or image), reference links.
- Track progress through the production pipeline via per-reel status.
- Support three permission levels so admins control sensitive actions.

## Non-goals (v1)

- Comments / discussion threads on reels.
- Email or push notifications.
- Client-facing access (only the internal team uses the app).
- Video reference uploads (only links and small images in v1).
- Analytics, reporting, exports.
- Mobile native app (responsive web only).

## Users & roles

Three roles, gated at the database level via Supabase RLS:

| Action | Viewer | Editor | Admin |
|---|---|---|---|
| View brands/shoots/reels | ✓ | ✓ | ✓ |
| Create/edit brands, shoots, reels | ✗ | ✓ | ✓ |
| Change reel status | ✗ | ✓ | ✓ |
| Delete anything | ✗ | ✗ | ✓ |
| Manage team (change roles) | ✗ | ✗ | ✓ |

**Signup:** email + password. New users default to `viewer`. An admin promotes them via the Team page.

**First admin bootstrapping:** after the first user signs up, run this once in the Supabase SQL editor:

```sql
update profiles set role = 'admin' where id = (select id from auth.users where email = 'YOUR_EMAIL');
```

## Tech stack

- **Frontend + backend:** Next.js (App Router, React Server Components, server actions).
- **Database + auth + storage:** Supabase (Postgres with RLS, email/password auth, Storage buckets).
- **Validation:** Zod (shared between client and server).
- **Hosting:** Vercel (connects to Supabase via env vars).
- **Language:** TypeScript everywhere.

## Data model

Six Postgres tables.

### `profiles`
One row per user. Linked 1:1 to `auth.users` via shared `id`.
- `id` (uuid, PK, FK → `auth.users.id`)
- `full_name` (text)
- `role` (enum: `admin` | `editor` | `viewer`, default `viewer`)
- `created_at` (timestamptz, default now())

A Postgres trigger on `auth.users` insert creates the `profiles` row automatically.

### `brands`
- `id` (uuid, PK)
- `name` (text, not null)
- `description` (text)
- `logo_url` (text, nullable — path in `brand-logos` bucket)
- `created_by` (uuid, FK → `profiles.id`)
- `created_at` (timestamptz)

### `shoots`
- `id` (uuid, PK)
- `brand_id` (uuid, FK → `brands.id`, on delete cascade)
- `title` (text, not null)
- `scheduled_at` (timestamptz, not null) — used by the calendar
- `location_notes` (text, nullable) — overall shoot-day location info
- `created_by` (uuid, FK → `profiles.id`)
- `created_at` (timestamptz)

### `reels`
- `id` (uuid, PK)
- `shoot_id` (uuid, FK → `shoots.id`, on delete cascade)
- `title` (text, not null)
- `status` (enum: `planning` | `ready_to_shoot` | `shot` | `edited` | `posted`, default `planning`)
- `script_text` (text, nullable)
- `script_file_url` (text, nullable)
- `product_name` (text, nullable)
- `product_image_url` (text, nullable)
- `location_text` (text, nullable)
- `location_image_url` (text, nullable)
- `position` (int, default 0) — controls ordering inside a shoot
- `created_at` (timestamptz)

Each of script/product/location has both a text column and a file/image column so users can provide either or both.

### `reel_references`
One row per reference link on a reel.
- `id` (uuid, PK)
- `reel_id` (uuid, FK → `reels.id`, on delete cascade)
- `url` (text, not null)
- `label` (text, nullable)
- `created_at` (timestamptz)

### `activity_log`
Audit trail for status changes and edits.
- `id` (uuid, PK)
- `entity_type` (enum: `shoot` | `reel`)
- `entity_id` (uuid)
- `action` (text, e.g. `status_changed`, `created`, `updated`)
- `actor_id` (uuid, FK → `profiles.id`)
- `payload` (jsonb — before/after for status changes)
- `created_at` (timestamptz)

## Row-Level Security policies

Every table has `enable row level security`.

- **`SELECT`** (all tables): allowed for any authenticated user.
- **`INSERT` / `UPDATE`** on `brands`, `shoots`, `reels`, `reel_references`: allowed if `(select role from profiles where id = auth.uid()) in ('admin', 'editor')`.
- **`DELETE`** on all content tables: allowed if `(select role from profiles where id = auth.uid()) = 'admin'`.
- **`profiles`**:
  - `SELECT`: all authenticated.
  - `UPDATE`: users can update their own `full_name`. Only admins can update anyone's `role` (including their own).
  - `INSERT`: disabled (the trigger handles it).
  - `DELETE`: admin only.
- **`activity_log`**:
  - `SELECT`: all authenticated.
  - `INSERT`: all authenticated (written by server actions).
  - `UPDATE` / `DELETE`: disabled.

## File storage

Supabase Storage buckets:

- `brand-logos` — public read, authenticated write.
- `reel-assets` — authenticated read + write.

### Path conventions

- `brand-logos/{brandId}/logo.{ext}`
- `reel-assets/{reelId}/script.{ext}`
- `reel-assets/{reelId}/product.{ext}`
- `reel-assets/{reelId}/location.{ext}`

### Upload flow

1. Client picks a file.
2. Next.js server action validates: size ≤ 10 MB, MIME type in the allowed list (jpg, png, webp, pdf, txt, docx).
3. Server action uploads to Supabase Storage.
4. On success, writes the resulting path/URL into the reel (or brand) row.
5. On DB write failure, deletes the orphaned file.

When a reel or brand is deleted, the same server action deletes associated files from storage.

## Pages & navigation

**Public:**
- `/login` — email + password sign in.
- `/signup` — email + password sign up. New users default to viewer.

**Authenticated:**
- `/` — Dashboard: upcoming shoots (next 7 days), counts per status, recent activity.
- `/calendar` — month/week grid of all shoots across brands, color-coded by brand. Click a shoot → `/shoots/[id]`.
- `/brands` — list of brands with logos and shoot counts. "+ New brand" button (editor/admin).
- `/brands/[brandId]` — brand detail with its shoots list.
- `/shoots/[shootId]` — shoot detail: date, location notes, list of reels inside. "+ New reel" button.
- `/reels/[reelId]` — reel detail: inline-editable fields for script/product/location, references list, status dropdown.
- `/team` — admin only: list of team members with role dropdowns.
- `/account` — change password, update full name.

**Global layout:** left sidebar (Dashboard / Calendar / Brands / Team [admin only] / Account). Top bar shows user name and logout.

**Editing UX:** inline editing on the reel detail page. Clicking a field turns it into an input; changes auto-save on blur (with debounce). Cuts clicks compared to a separate edit screen.

**Creation UX:** clicking "+ New brand", "+ New shoot", or "+ New reel" opens a small dialog asking only for the required fields (brand: name; shoot: title + scheduled_at; reel: title). On submit, the user lands on the new entity's detail page where they fill the rest inline.

## Error handling

- **Validation:** Zod schemas per entity, shared between client forms and server actions. Client shows immediate feedback; server is the source of truth.
- **Server action errors:** return `{ error: string }`. UI shows inline under the field or as a toast.
- **RLS denials:** caught by error code; shown as "You don't have permission to do that" rather than raw DB error.
- **Auth expiry:** middleware refreshes the session. On failure, redirect to `/login` with a banner.
- **File upload failures:** server action deletes the orphaned file if the DB write fails after upload (try/finally).
- **Global fallback:** Next.js root `error.tsx` shows "Something went wrong — reload" with a support email.

## Testing strategy

- **Unit:** Zod schemas — valid + invalid cases per entity.
- **Integration:** server actions against a test Supabase project. Must confirm viewer can read but not mutate; editor can edit but not delete; admin can do everything. This is the most critical layer since it validates RLS enforcement end-to-end.
- **E2E (Playwright):** two flows:
  1. Login → create brand → create shoot → create reel → change reel status.
  2. Log in as viewer → can see data, cannot see edit/create buttons, server action returns error if called directly.
- **CI:** GitHub Actions runs lint + typecheck + unit + integration on every PR. E2E runs on pushes to `main`.
- **Deferred for v1:** component UI tests, visual regression, load testing.

## Constraints & assumptions

- Single Synergeek team — no multi-tenant separation. Every authenticated user sees every brand.
- Small file uploads only in v1 (≤ 10 MB). Video support deferred.
- Email + password auth only. OAuth/magic-link deferred.
- Timezone: all `timestamptz` values stored in UTC, displayed in the user's browser local time.

## Open items for the plan

- Exact Zod schemas per entity.
- Calendar library choice (e.g. FullCalendar vs. a lighter custom grid).
- Whether to host Playwright E2E against a permanent test Supabase project or spin one up per CI run.
- Migration workflow (Supabase CLI vs. raw SQL files).
