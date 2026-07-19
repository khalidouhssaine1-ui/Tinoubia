-- Tinoubia Immobilier — initial schema, RLS policies, and seed data.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ============================================================================
-- TABLES
-- ============================================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  phone text,
  role text not null default 'agent' check (role in ('super_admin','admin','agent','editor')),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (country_id, slug)
);

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  city_id uuid not null references public.cities(id) on delete cascade,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (city_id, slug)
);

create table public.property_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug in ('apartments','villas','riads')),
  icon text,
  created_at timestamptz not null default now()
);

create table public.features (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  created_at timestamptz not null default now()
);

create table public.agents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text,
  phone text,
  whatsapp text,
  avatar_url text,
  bio text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create sequence public.property_reference_seq start 1024;

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  reference text unique,
  title text not null,
  slug text not null unique,
  listing_type text not null check (listing_type in ('sale','rent')),
  property_type_id uuid not null references public.property_types(id),
  status text not null default 'draft' check (status in ('draft','available','reserved','rented','sold','archived')),
  show_when_unavailable boolean not null default false,
  featured boolean not null default false,
  price numeric(14,2) not null check (price >= 0),
  currency text not null default 'MAD',
  bedrooms int check (bedrooms >= 0),
  bathrooms int check (bathrooms >= 0),
  living_area numeric(10,2),
  land_area numeric(10,2),
  floors int,
  year_built int,
  furnished boolean not null default false,
  description text,
  country_id uuid references public.countries(id),
  city_id uuid references public.cities(id),
  neighborhood_id uuid references public.neighborhoods(id),
  address text,
  show_full_address boolean not null default false,
  latitude numeric(10,7),
  longitude numeric(10,7),
  google_maps_url text,
  agent_id uuid references public.agents(id),
  seo_title text,
  seo_description text,
  og_image text,
  views_count int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  cloudinary_public_id text not null,
  secure_url text not null,
  resource_type text not null check (resource_type in ('image','video')),
  width int,
  height int,
  duration numeric,
  position int not null default 0,
  alt_text text,
  caption text,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.property_features (
  property_id uuid not null references public.properties(id) on delete cascade,
  feature_id uuid not null references public.features(id) on delete cascade,
  primary key (property_id, feature_id)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text not null,
  preferred_contact text not null default 'phone' check (preferred_contact in ('phone','email','whatsapp')),
  visit_date date,
  num_people int,
  message text,
  status text not null default 'new' check (status in ('new','contacted','qualified','visit_scheduled','negotiating','won','lost','spam')),
  assigned_agent_id uuid references public.agents(id),
  source text default 'website',
  ip_address text,
  created_at timestamptz not null default now()
);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.profiles(id),
  note text not null,
  created_at timestamptz not null default now()
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, property_id)
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  content text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_avatar text,
  rating int not null default 5 check (rating between 1 and 5),
  message text not null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

create index idx_properties_status on public.properties(status);
create index idx_properties_listing_type on public.properties(listing_type);
create index idx_properties_property_type on public.properties(property_type_id);
create index idx_properties_city on public.properties(city_id);
create index idx_properties_neighborhood on public.properties(neighborhood_id);
create index idx_properties_featured on public.properties(featured);
create index idx_properties_agent on public.properties(agent_id);
create index idx_properties_created_at on public.properties(created_at desc);
create index idx_properties_title_trgm on public.properties using gin (title gin_trgm_ops);
create index idx_properties_description_trgm on public.properties using gin (description gin_trgm_ops);

create index idx_property_media_property on public.property_media(property_id, position);
create index idx_property_features_feature on public.property_features(feature_id);

create index idx_cities_country on public.cities(country_id);
create index idx_neighborhoods_city on public.neighborhoods(city_id);

create index idx_leads_status on public.leads(status);
create index idx_leads_property on public.leads(property_id);
create index idx_leads_assigned_agent on public.leads(assigned_agent_id);
create index idx_leads_created_at on public.leads(created_at desc);

create index idx_lead_notes_lead on public.lead_notes(lead_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);
create index idx_activity_logs_entity on public.activity_logs(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_properties_updated_at
  before update on public.properties
  for each row execute function public.set_updated_at();

create trigger trg_pages_updated_at
  before update on public.pages
  for each row execute function public.set_updated_at();

create or replace function public.set_property_reference()
returns trigger language plpgsql as $$
begin
  if new.reference is null then
    new.reference := 'TIN-' || nextval('public.property_reference_seq');
  end if;
  return new;
end;
$$;

create trigger trg_properties_reference
  before insert on public.properties
  for each row execute function public.set_property_reference();

-- ============================================================================
-- HELPER FUNCTIONS (security definer to avoid recursive RLS on profiles)
-- ============================================================================

create or replace function public.current_profile_role()
returns text
language sql security definer stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_agent_ids()
returns uuid[]
language sql security definer stable
set search_path = public
as $$
  select coalesce(array_agg(id), '{}') from public.agents where profile_id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql security definer stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and is_active = true);
$$;

create or replace function public.property_is_public(p_status text, p_show_when_unavailable boolean)
returns boolean
language sql immutable
as $$
  select (p_status in ('available','reserved'))
      or (p_status in ('sold','rented') and p_show_when_unavailable);
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.countries enable row level security;
alter table public.cities enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.property_types enable row level security;
alter table public.features enable row level security;
alter table public.agents enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.property_features enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.favorites enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.pages enable row level security;
alter table public.testimonials enable row level security;
alter table public.settings enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: read own, staff (admin/super_admin) read all; update own or super_admin; delete super_admin only
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.current_profile_role() in ('super_admin','admin'));

create policy profiles_update on public.profiles
  for update using (id = auth.uid() or public.current_profile_role() = 'super_admin')
  with check (id = auth.uid() or public.current_profile_role() = 'super_admin');

create policy profiles_delete on public.profiles
  for delete using (public.current_profile_role() = 'super_admin');

-- reference/lookup tables: public read, staff (admin/super_admin) write
create policy countries_select on public.countries for select using (true);
create policy countries_write on public.countries for all
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));

create policy cities_select on public.cities for select using (true);
create policy cities_write on public.cities for all
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));

create policy neighborhoods_select on public.neighborhoods for select using (true);
create policy neighborhoods_write on public.neighborhoods for all
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));

create policy property_types_select on public.property_types for select using (true);
create policy property_types_write on public.property_types for all
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));

create policy features_select on public.features for select using (true);
create policy features_write on public.features for all
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));

create policy agents_select on public.agents for select using (true);
create policy agents_write on public.agents for all
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));

-- testimonials & pages: public read (only relevant rows), staff manage (admin/super_admin/editor, no delete for editor)
create policy testimonials_select on public.testimonials for select using (true);
create policy testimonials_insert on public.testimonials for insert
  with check (public.current_profile_role() in ('super_admin','admin','editor'));
create policy testimonials_update on public.testimonials for update
  using (public.current_profile_role() in ('super_admin','admin','editor'))
  with check (public.current_profile_role() in ('super_admin','admin','editor'));
create policy testimonials_delete on public.testimonials for delete
  using (public.current_profile_role() in ('super_admin','admin'));

create policy pages_select on public.pages for select using (true);
create policy pages_insert on public.pages for insert
  with check (public.current_profile_role() in ('super_admin','admin','editor'));
create policy pages_update on public.pages for update
  using (public.current_profile_role() in ('super_admin','admin','editor'))
  with check (public.current_profile_role() in ('super_admin','admin','editor'));
create policy pages_delete on public.pages for delete
  using (public.current_profile_role() in ('super_admin','admin'));

-- properties
create policy properties_select on public.properties for select using (
  public.property_is_public(status, show_when_unavailable)
  or public.current_profile_role() in ('super_admin','admin','editor')
  or (public.current_profile_role() = 'agent' and agent_id = any(public.current_agent_ids()))
);

create policy properties_insert on public.properties for insert
  with check (public.current_profile_role() in ('super_admin','admin','editor'));

create policy properties_update on public.properties for update
  using (
    public.current_profile_role() in ('super_admin','admin','editor')
    or (public.current_profile_role() = 'agent' and agent_id = any(public.current_agent_ids()))
  )
  with check (
    public.current_profile_role() in ('super_admin','admin','editor')
    or (public.current_profile_role() = 'agent' and agent_id = any(public.current_agent_ids()))
  );

create policy properties_delete on public.properties for delete
  using (public.current_profile_role() in ('super_admin','admin'));

-- property_media: visible if parent property visible; writable by same roles as properties_update
create policy property_media_select on public.property_media for select using (
  exists (
    select 1 from public.properties p
    where p.id = property_media.property_id
      and (
        public.property_is_public(p.status, p.show_when_unavailable)
        or public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);

create policy property_media_write on public.property_media for all using (
  exists (
    select 1 from public.properties p
    where p.id = property_media.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
) with check (
  exists (
    select 1 from public.properties p
    where p.id = property_media.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);

-- property_features: same visibility pattern
create policy property_features_select on public.property_features for select using (
  exists (
    select 1 from public.properties p
    where p.id = property_features.property_id
      and (
        public.property_is_public(p.status, p.show_when_unavailable)
        or public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);

create policy property_features_write on public.property_features for all using (
  exists (
    select 1 from public.properties p
    where p.id = property_features.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
) with check (
  exists (
    select 1 from public.properties p
    where p.id = property_features.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);

-- leads: no anon policy at all (public submissions go through the service-role
-- server route). Staff can see all (admin/super_admin) or only their own
-- assigned leads (agent). Editors are content-only and have no lead access.
create policy leads_select on public.leads for select using (
  public.current_profile_role() in ('super_admin','admin')
  or (public.current_profile_role() = 'agent' and assigned_agent_id = any(public.current_agent_ids()))
);

create policy leads_insert on public.leads for insert
  with check (public.current_profile_role() in ('super_admin','admin'));

create policy leads_update on public.leads for update
  using (
    public.current_profile_role() in ('super_admin','admin')
    or (public.current_profile_role() = 'agent' and assigned_agent_id = any(public.current_agent_ids()))
  )
  with check (
    public.current_profile_role() in ('super_admin','admin')
    or (public.current_profile_role() = 'agent' and assigned_agent_id = any(public.current_agent_ids()))
  );

create policy leads_delete on public.leads for delete
  using (public.current_profile_role() in ('super_admin','admin'));

create policy lead_notes_select on public.lead_notes for select using (
  exists (
    select 1 from public.leads l
    where l.id = lead_notes.lead_id
      and (
        public.current_profile_role() in ('super_admin','admin')
        or (public.current_profile_role() = 'agent' and l.assigned_agent_id = any(public.current_agent_ids()))
      )
  )
);

create policy lead_notes_insert on public.lead_notes for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.leads l
      where l.id = lead_notes.lead_id
        and (
          public.current_profile_role() in ('super_admin','admin')
          or (public.current_profile_role() = 'agent' and l.assigned_agent_id = any(public.current_agent_ids()))
        )
    )
  );

-- favorites: reserved for signed-in staff/testing use; anonymous visitors use
-- localStorage on the client, so no anon policy is exposed here.
create policy favorites_select on public.favorites for select using (profile_id = auth.uid());
create policy favorites_insert on public.favorites for insert with check (profile_id = auth.uid());
create policy favorites_delete on public.favorites for delete using (profile_id = auth.uid());

-- newsletter_subscribers: no anon policy — inserts go through the service-role
-- API route, same pattern as leads. Staff can review the list.
create policy newsletter_subscribers_select on public.newsletter_subscribers for select
  using (public.current_profile_role() in ('super_admin','admin'));

-- settings: staff-only read, super_admin write
create policy settings_select on public.settings for select using (public.is_staff());
create policy settings_write on public.settings for all
  using (public.current_profile_role() = 'super_admin')
  with check (public.current_profile_role() = 'super_admin');

-- activity_logs: staff select (admin/super_admin all, others none), insert own, immutable (no update), super_admin delete
create policy activity_logs_select on public.activity_logs for select using (
  public.current_profile_role() in ('super_admin','admin')
);
create policy activity_logs_insert on public.activity_logs for insert
  with check (actor_id = auth.uid() and public.is_staff());
create policy activity_logs_delete on public.activity_logs for delete
  using (public.current_profile_role() = 'super_admin');

-- ============================================================================
-- SEED DATA
-- ============================================================================

insert into public.property_types (name, slug, icon) values
  ('Apartments', 'apartments', 'building-2'),
  ('Villas', 'villas', 'home'),
  ('Riads', 'riads', 'landmark');

insert into public.features (name, slug, icon) values
  ('Swimming Pool', 'pool', 'waves'),
  ('Garden', 'garden', 'trees'),
  ('Terrace', 'terrace', 'sun'),
  ('Parking', 'parking', 'car'),
  ('Furnished', 'furnished', 'sofa'),
  ('Air Conditioning', 'air-conditioning', 'wind'),
  ('Elevator', 'elevator', 'move-vertical'),
  ('24/7 Security', 'security', 'shield'),
  ('Fireplace', 'fireplace', 'flame'),
  ('Sea View', 'sea-view', 'eye');

insert into public.countries (name, slug) values ('Morocco', 'morocco');

insert into public.cities (country_id, name, slug)
select id, 'Marrakech', 'marrakech' from public.countries where slug = 'morocco';

insert into public.neighborhoods (city_id, name, slug)
select c.id, n.name, n.slug from public.cities c,
  (values ('Gueliz','gueliz'), ('Hivernage','hivernage'), ('Palmeraie','palmeraie'), ('Medina','medina')) as n(name, slug)
where c.slug = 'marrakech';

insert into public.settings (key, value) values
  ('agency_info', jsonb_build_object(
    'name', 'Tinoubia Immobilier',
    'phone', '+212 600 000 000',
    'whatsapp', '+212600000000',
    'email', 'hmounayt17@gmail.com',
    'address', 'Gueliz, Marrakech, Morocco',
    'instagram', '',
    'facebook', ''
  ));
