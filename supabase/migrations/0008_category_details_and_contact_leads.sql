-- 1) Categories are managed from the admin: each one gets a description and a
--    cover image (shown on the homepage "Browse by Category" cards) and an
--    explicit display order. The three original categories keep the copy and
--    images that used to be hard-coded in the site.
alter table public.property_types
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists sort_order integer not null default 0;

update public.property_types set
  sort_order = 1,
  description = coalesce(description, 'Contemporary living in the city''s most sought-after addresses.'),
  image_url = coalesce(image_url, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80')
where slug = 'apartments';

update public.property_types set
  sort_order = 2,
  description = coalesce(description, 'Private estates with pools, gardens and uninterrupted views.'),
  image_url = coalesce(image_url, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')
where slug = 'villas';

update public.property_types set
  sort_order = 3,
  description = coalesce(description, 'Restored courtyard houses in the heart of the Medina.'),
  image_url = coalesce(image_url, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80')
where slug = 'riads';

-- 2) Contact-page messages are saved through the same public insert policy as
--    property enquiries, so the contact form no longer needs the service-role
--    key. Still INSERT-only and value-constrained; reads stay staff-only.
drop policy if exists leads_insert_public on public.leads;
create policy leads_insert_public on public.leads
  for insert
  to anon, authenticated
  with check (
    status = 'new'
    and assigned_agent_id is null
    and source in ('website', 'contact_page')
  );
