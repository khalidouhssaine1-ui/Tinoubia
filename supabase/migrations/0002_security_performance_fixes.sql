-- Follow-up hardening pass based on Supabase advisor output after 0001:
--  1) missing FK indexes
--  2) mutable search_path on SECURITY DEFINER-adjacent functions
--  3) pg_trgm extension relocated out of public schema
--  4) RLS policies wrapping auth.uid() in (select ...) so it's evaluated once
--     per statement instead of once per row (initplan optimization)
--  5) split "for all" write policies from the dedicated select policy so
--     Postgres doesn't evaluate two overlapping permissive policies per row

-- 1) missing FK indexes ------------------------------------------------------
create index if not exists idx_activity_logs_actor on public.activity_logs(actor_id);
create index if not exists idx_agents_profile on public.agents(profile_id);
create index if not exists idx_favorites_property on public.favorites(property_id);
create index if not exists idx_lead_notes_author on public.lead_notes(author_id);
create index if not exists idx_properties_country on public.properties(country_id);
create index if not exists idx_properties_created_by on public.properties(created_by);

-- 2) fixed search_path --------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_property_reference()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.reference is null then
    new.reference := 'TIN-' || nextval('public.property_reference_seq');
  end if;
  return new;
end;
$$;

create or replace function public.property_is_public(p_status text, p_show_when_unavailable boolean)
returns boolean
language sql immutable
set search_path = public
as $$
  select (p_status in ('available','reserved'))
      or (p_status in ('sold','rented') and p_show_when_unavailable);
$$;

-- 3) relocate pg_trgm ---------------------------------------------------------
create schema if not exists extensions;
drop index if exists public.idx_properties_title_trgm;
drop index if exists public.idx_properties_description_trgm;
drop extension if exists pg_trgm;
create extension if not exists pg_trgm with schema extensions;

create index idx_properties_title_trgm on public.properties using gin (title extensions.gin_trgm_ops);
create index idx_properties_description_trgm on public.properties using gin (description extensions.gin_trgm_ops);

-- 4) wrap auth.uid() in (select ...) -----------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = (select auth.uid()) or public.current_profile_role() in ('super_admin','admin'));

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (id = (select auth.uid()) or public.current_profile_role() = 'super_admin')
  with check (id = (select auth.uid()) or public.current_profile_role() = 'super_admin');

drop policy if exists lead_notes_insert on public.lead_notes;
create policy lead_notes_insert on public.lead_notes for insert
  with check (
    author_id = (select auth.uid())
    and exists (
      select 1 from public.leads l
      where l.id = lead_notes.lead_id
        and (
          public.current_profile_role() in ('super_admin','admin')
          or (public.current_profile_role() = 'agent' and l.assigned_agent_id = any(public.current_agent_ids()))
        )
    )
  );

drop policy if exists favorites_select on public.favorites;
create policy favorites_select on public.favorites for select using (profile_id = (select auth.uid()));

drop policy if exists favorites_insert on public.favorites;
create policy favorites_insert on public.favorites for insert with check (profile_id = (select auth.uid()));

drop policy if exists favorites_delete on public.favorites;
create policy favorites_delete on public.favorites for delete using (profile_id = (select auth.uid()));

drop policy if exists activity_logs_insert on public.activity_logs;
create policy activity_logs_insert on public.activity_logs for insert
  with check (actor_id = (select auth.uid()) and public.is_staff());

-- 5) split "for all" write policies so they don't overlap the select policy --
drop policy if exists countries_write on public.countries;
create policy countries_insert on public.countries for insert with check (public.current_profile_role() in ('super_admin','admin'));
create policy countries_update on public.countries for update
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));
create policy countries_delete on public.countries for delete using (public.current_profile_role() in ('super_admin','admin'));

drop policy if exists cities_write on public.cities;
create policy cities_insert on public.cities for insert with check (public.current_profile_role() in ('super_admin','admin'));
create policy cities_update on public.cities for update
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));
create policy cities_delete on public.cities for delete using (public.current_profile_role() in ('super_admin','admin'));

drop policy if exists neighborhoods_write on public.neighborhoods;
create policy neighborhoods_insert on public.neighborhoods for insert with check (public.current_profile_role() in ('super_admin','admin'));
create policy neighborhoods_update on public.neighborhoods for update
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));
create policy neighborhoods_delete on public.neighborhoods for delete using (public.current_profile_role() in ('super_admin','admin'));

drop policy if exists property_types_write on public.property_types;
create policy property_types_insert on public.property_types for insert with check (public.current_profile_role() in ('super_admin','admin'));
create policy property_types_update on public.property_types for update
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));
create policy property_types_delete on public.property_types for delete using (public.current_profile_role() in ('super_admin','admin'));

drop policy if exists features_write on public.features;
create policy features_insert on public.features for insert with check (public.current_profile_role() in ('super_admin','admin'));
create policy features_update on public.features for update
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));
create policy features_delete on public.features for delete using (public.current_profile_role() in ('super_admin','admin'));

drop policy if exists agents_write on public.agents;
create policy agents_insert on public.agents for insert with check (public.current_profile_role() in ('super_admin','admin'));
create policy agents_update on public.agents for update
  using (public.current_profile_role() in ('super_admin','admin'))
  with check (public.current_profile_role() in ('super_admin','admin'));
create policy agents_delete on public.agents for delete using (public.current_profile_role() in ('super_admin','admin'));

drop policy if exists property_media_write on public.property_media;
create policy property_media_insert on public.property_media for insert with check (
  exists (
    select 1 from public.properties p
    where p.id = property_media.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);
create policy property_media_update on public.property_media for update
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_media.property_id
        and (
          public.current_profile_role() in ('super_admin','admin','editor')
          or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
        )
    )
  )
  with check (
    exists (
      select 1 from public.properties p
      where p.id = property_media.property_id
        and (
          public.current_profile_role() in ('super_admin','admin','editor')
          or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
        )
    )
  );
create policy property_media_delete on public.property_media for delete using (
  exists (
    select 1 from public.properties p
    where p.id = property_media.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);

drop policy if exists property_features_write on public.property_features;
create policy property_features_insert on public.property_features for insert with check (
  exists (
    select 1 from public.properties p
    where p.id = property_features.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);
create policy property_features_delete on public.property_features for delete using (
  exists (
    select 1 from public.properties p
    where p.id = property_features.property_id
      and (
        public.current_profile_role() in ('super_admin','admin','editor')
        or (public.current_profile_role() = 'agent' and p.agent_id = any(public.current_agent_ids()))
      )
  )
);

drop policy if exists settings_write on public.settings;
create policy settings_insert on public.settings for insert with check (public.current_profile_role() = 'super_admin');
create policy settings_update on public.settings for update
  using (public.current_profile_role() = 'super_admin')
  with check (public.current_profile_role() = 'super_admin');
create policy settings_delete on public.settings for delete using (public.current_profile_role() = 'super_admin');
