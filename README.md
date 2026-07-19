# Tinoubia Immobilier

A premium real-estate platform for apartment, villa and riad sales and rentals in Marrakech, Morocco — built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase and Cloudinary.

## Stack

- **Next.js 16** (App Router, Server Components by default, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Supabase** — Postgres, Auth, Row Level Security
- **Cloudinary** — signed uploads for property photos/videos
- **React Hook Form** + **Zod** — every form, client- and server-validated
- **Google Maps JavaScript API** — property location picker (admin) and map views (public)
- **SendPulse** — transactional email for enquiry notifications
- **Framer Motion** — scroll reveals, page/drawer/modal transitions (respects `prefers-reduced-motion`)

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the admin dashboard.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** secret. **Never expose this to the browser.** Required for the enquiry pipeline, newsletter signups, and admin user management. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary dashboard → Settings → API Keys |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Cloud Console → enable "Maps JavaScript API" |
| `SENDPULSE_API_USER_ID` / `SENDPULSE_API_SECRET` | SendPulse → Settings → API |
| `SENDPULSE_SENDER_EMAIL` / `SENDPULSE_SENDER_NAME` | The verified sender identity in SendPulse |
| `CONTACT_EMAIL` | Where enquiry notifications are sent (defaults to `hmounayt17@gmail.com`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Agency WhatsApp number, digits only with country code (e.g. `212600000000`) |

Until Cloudinary/Google Maps/SendPulse keys are supplied, the app degrades gracefully: media upload shows a configuration notice, maps show a static fallback with a "view on Google Maps" link, and enquiry emails are skipped with a server-side warning (the enquiry itself is still saved to the database).

## Database

The Supabase project's schema lives in `supabase/migrations/`, applied in order:

1. `0001_init_schema.sql` — tables, indexes, RLS policies, seed reference data (property types, amenities, Marrakech/Gueliz/Hivernage/Palmeraie/Medina)
2. `0002_security_performance_fixes.sql` — advisor-driven hardening (missing FK indexes, `search_path` pinning, relocated `pg_trgm` extension, RLS performance patterns)
3. `0003_views_rpc_and_demo_seed.sql` — the `increment_property_views` RPC, plus demo agents/testimonials/properties so the site isn't empty on first run

Run them against a fresh Supabase project via the Supabase CLI (`supabase db push`) or the Supabase SQL editor, in order.

### Roles

Four roles are enforced both in Postgres RLS and server-side in every Server Action/route handler (`lib/permissions.ts`):

- **super_admin** — full access, including user management and settings
- **admin** — manages properties, media, locations, leads
- **agent** — manages only their own assigned properties and leads
- **editor** — can edit content but cannot delete properties or manage users

### Creating your first admin user

This project doesn't ship a seed super-admin (creating live login credentials isn't something this build should do unattended). To create one:

1. Supabase Dashboard → Authentication → Add User (set email + password, confirm email).
2. Run this SQL, replacing the UUID with the new user's ID (shown in the Authentication table):

   ```sql
   insert into public.profiles (id, full_name, email, role, is_active)
   values ('<user-id-from-auth-users>', 'Your Name', 'you@example.com', 'super_admin', true);
   ```

## Project Structure

```
app/
  (public)/            Public site — homepage, listings, property detail, about, contact
  admin/                Admin dashboard (protected by middleware + role checks)
  api/                  Route handlers: enquiries, contact, newsletter, Cloudinary signing, CSV export
  sitemap.ts, robots.ts
components/
  layout/, home/, properties/, property-detail/, admin/, shared/, ui/ (shadcn primitives)
lib/
  supabase/             Browser/server/admin/middleware Supabase clients
  actions/              Server Actions (properties, media, leads, locations, categories, users, settings)
  data/                 Read-only data-fetching functions
  validations/          Zod schemas
  cloudinary/, email/   Cloudinary signing + SendPulse email
supabase/migrations/    SQL migrations (source of truth for the schema)
types/                  Domain types + generated Supabase types
```

## Notes on the brand assets

`public/logo.png` was regenerated from the originally-supplied file: the source had a solid black background with no alpha channel and visible render-grain noise (not actually transparent, despite the filename's intent). `scripts/make-logo-transparent.mjs` and `scripts/denoise-logo-alpha.mjs` document the one-off, local, lossless reconstruction (no third-party service was used) that produced the current true-alpha PNG.

## Verification

- `npm run build` — production build (Turbopack)
- `npx tsc --noEmit` — type check
- `npx eslint .` — lint
- Manual QA covered: homepage → search → listing filters (grid/list/map) → property detail → enquiry submission → admin login/dashboard/property CRUD/media upload/leads/locations/categories/users/settings/activity logs, at desktop and mobile viewports.
