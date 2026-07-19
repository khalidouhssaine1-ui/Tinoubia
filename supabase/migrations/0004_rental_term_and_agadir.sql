-- Adds short-term / long-term duration to rental listings, and Agadir as a
-- second city so "For Rent" can be filtered by duration and Agadir listings
-- are queryable/filterable like Marrakech.

alter table public.properties
  add column rental_term text check (rental_term in ('short_term','long_term'));

comment on column public.properties.rental_term is
  'Only meaningful when listing_type = ''rent''. Null for sale listings.';

create index idx_properties_rental_term on public.properties(rental_term);

insert into public.cities (country_id, name, slug)
select id, 'Agadir', 'agadir' from public.countries where slug = 'morocco'
on conflict (country_id, slug) do nothing;
