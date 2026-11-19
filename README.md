# Tinoubia Immobilier

A premium real-estate platform for apartment, villa and riad sales and rentals in Marrakech and Agadir, Morocco — built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase and Cloudinary.

## Stack

- **Next.js 16** (App Router, Server Components by default, Turbopack)
- **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Base UI primitives)
- **Supabase** — Postgres, Auth, Row Level Security
- **Cloudinary** — signed uploads for property photos/videos and PDF brochures
- **React Hook Form** + **Zod** — every form, client- and server-validated
- **Leaflet + OpenStreetMap** — public property maps, the listings map view and the admin location picker (no API key)
- **Email notifications** — Resend, Gmail SMTP or SendPulse server-side, with a FormSubmit fallback from the visitor's browser (see below)
- **Framer Motion** — scroll reveals, page/drawer/modal transitions (respects `prefers-reduced-motion`)

## Getting Started

```bash
npm ci
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

Install dependencies on the machine you run the app on. `node_modules` contains platform-specific native binaries (Next.js SWC, Tailwind's oxide, lightningcss, sharp), so a folder installed on Windows won't run on macOS and vice versa — copy the project without `node_modules` and run `npm ci` again.

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the admin dashboard.

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Your deployed URL (`http://localhost:3000` in dev) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (publishable/anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → **service_role** secret. **Never expose this to the browser.** Required for admin user management (inviting users). The enquiry and contact forms don't need it — they insert through the public `leads_insert_public` RLS policy. |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary dashboard → Settings → API Keys |
| `CONTACT_EMAIL` | Where enquiry notifications are sent (defaults to `hmounayt17@gmail.com`) |
| `RESEND_API_KEY` / `RESEND_FROM` | *Optional, email option 1.* Resend → API Keys; `RESEND_FROM` is the verified sender (defaults to Resend's onboarding address) |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | *Optional, email option 2.* A Gmail address and a Google App Password for it |
| `SENDPULSE_API_KEY` or `SENDPULSE_API_USER_ID` + `SENDPULSE_API_SECRET` | *Optional, email option 3.* SendPulse → Settings → API |
| `SENDPULSE_SENDER_EMAIL` / `SENDPULSE_SENDER_NAME` | The verified sender identity in SendPulse (the name is also used as the Gmail sender name) |
| `NEXT_PUBLIC_FORMSUBMIT_EMAIL` | *Optional browser fallback.* Inbox that FormSubmit forwards notifications to when no server-side provider sent one |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Agency WhatsApp number, digits only with country code (e.g. `212600000000`) |

### How enquiry emails are sent

Every enquiry and contact message is saved to the `leads` table first, so nothing is lost if email fails. The notification then goes out through the first configured option in `lib/email/send.ts`: **Resend → Gmail SMTP → SendPulse**. If none of them sends it, the API answers `emailed: false` and the visitor's browser sends the notification through **FormSubmit** instead (FormSubmit blocks requests from server IPs, so it can only run client-side).

Until Cloudinary/email keys are supplied, the app degrades gracefully: media upload shows a configuration notice, and enquiry emails fall through to FormSubmit or are skipped with a server-side warning (the enquiry itself is still saved to the database).

## Database

The Supabase project's schema lives in `supabase/migrations/`, applied in order:

1. `0001_init_schema.sql` — tables, indexes, RLS policies, seed reference data (property types, amenities, Marrakech/Gueliz/Hivernage/Palmeraie/Medina)
2. `0002_security_performance_fixes.sql` — advisor-driven hardening (missing FK indexes, `search_path` pinning, relocated `pg_trgm` extension, RLS performance patterns)
3. `0003_views_rpc_and_demo_seed.sql` — the `increment_property_views` RPC, plus demo agents/testimonials/properties so the site isn't empty on first run
4. `0004_rental_term_and_agadir.sql` — `rental_term` (short-term / long-term) on rentals, and Agadir as a second city
5. `0005_allow_public_lead_inserts.sql` — lets anonymous visitors insert clean `new` website leads (reads stay staff-only)
6. `0006_property_brochure.sql` — optional PDF brochure per property (`brochure_url`, `brochure_public_id`)
7. `0007_instagram_videos.sql` — the `instagram_videos` table shown on the homepage
8. `0008_category_details_and_contact_leads.sql` — description, photo and display order for categories (managed in Admin → Categories), and lets the contact form save leads without the service-role key

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

### Passwords

- **Change it:** signed-in staff open the account menu (top right) → **My Account & Password**.
- **Forgot it:** the login page's **Forgot password?** link emails a reset link that lands on `/admin/auth/callback` and then My Account. The link only works in the browser that requested it. Supabase's built-in mailer only delivers to members of the Supabase organization, so for anyone else turn on **Authentication → Emails → SMTP Settings** (for example with the Gmail address and App Password used for enquiry emails). The project's Site URL must be the live domain (Authentication → URL Configuration), or the link will point to the wrong site.
- **Locked out with no email access:** run this in the Supabase SQL editor, with the account's email and a new password of your choice:

  ```sql
  update auth.users
  set encrypted_password = extensions.crypt('NEW-PASSWORD', extensions.gen_salt('bf')), updated_at = now()
  where email = 'admin@example.com';
  ```

## Project Structure

```
app/
  (public)/            Public site — homepage, listings, property detail, about, contact
  admin/                Admin dashboard (protected by proxy.ts + role checks)
  api/                  Route handlers: enquiries, contact, Cloudinary signing, leads CSV export
  sitemap.ts, robots.ts
components/
  layout/, home/, properties/, property-detail/, admin/, shared/, ui/ (shadcn primitives)
lib/
  supabase/             Browser/server/admin Supabase clients + the session refresh used by proxy.ts
  actions/              Server Actions (properties, media, leads, locations, categories, users, settings, videos)
  data/                 Read-only data-fetching functions
  validations/          Zod schemas
  cloudinary/, email/   Cloudinary signing + email providers (Resend, Gmail, SendPulse)
proxy.ts                Next.js 16 proxy (formerly "middleware"): guards /admin/*
supabase/migrations/    SQL migrations (source of truth for the schema)
types/                  Domain types + generated Supabase types
```

## Notes on the brand assets

`public/logo.png` is the TINOUBIA wordmark as a true-alpha PNG. The one-off, local scripts in `scripts/` (run with `node`, using `sharp`) document how the logo variants were produced:

- `scripts/extract-logo-on-white.mjs` — turns the supplied dark-ink-on-white logo into a transparent PNG.
- `scripts/crop-header-logo.mjs` — crops the header variants (`logo-header.png`, `logo-header-white.png`) to the skyline mark + wordmark, without the "IMMOBILIER" bar.

## Verification

- `npm run build` — production build (Turbopack)
- `npx tsc --noEmit` — type check
- `npx eslint .` — lint
- Manual QA covered: homepage → search → listing filters (grid/list/map) → property detail → enquiry submission → admin login/dashboard/property CRUD/media upload/leads/locations/categories/users/settings/activity logs, at desktop and mobile viewports.
