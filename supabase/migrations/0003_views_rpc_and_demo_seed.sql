-- RPC to let public visitors increment a property's view counter without
-- granting them general UPDATE rights on properties (RLS still blocks that).
create or replace function public.increment_property_views(p_property_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.properties set views_count = views_count + 1 where id = p_property_id;
end;
$$;

grant execute on function public.increment_property_views(uuid) to anon, authenticated;

-- ============================================================================
-- Demo content so the storefront isn't empty before real listings are added.
-- Media rows use placeholder Cloudinary ids + Unsplash-hosted images so the
-- gallery renders; swap them for real signed uploads from the admin media tab.
-- ============================================================================

insert into public.agents (name, email, phone, whatsapp, bio, avatar_url) values
  ('Yasmine Idrissi', 'yasmine@tinoubia-immobilier.com', '+212 661 234 567', '212661234567',
   'Senior property consultant specializing in riads and villas across Marrakech.',
   'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80'),
  ('Karim Bennani', 'karim@tinoubia-immobilier.com', '+212 662 345 678', '212662345678',
   'Apartment and rental specialist with a decade of experience in Gueliz and Hivernage.',
   'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&w=400&q=80');

insert into public.testimonials (client_name, client_avatar, rating, message, featured) values
  ('Sophie Laurent', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', 5,
   'Tinoubia found us the riad of our dreams in the Medina. Discreet, professional, and genuinely caring throughout.', true),
  ('Ahmed El Fassi', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=200&q=80', 5,
   'We rented a villa in Palmeraie through Tinoubia — the whole process was seamless from the first WhatsApp message to signing.', true),
  ('Claire Dubois', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', 4,
   'Excellent knowledge of the Marrakech market. They understood exactly what we were looking for.', false),
  ('Youssef Amrani', null, 5,
   'Sold our apartment in Gueliz above asking price within three weeks. Highly recommend the Tinoubia team.', true);

-- Properties -----------------------------------------------------------------

with
  cat as (select id, slug from public.property_types),
  loc as (select c.id as city_id, n.id as neighborhood_id, n.slug as n_slug
          from public.cities c join public.neighborhoods n on n.city_id = c.id),
  ag as (select id, email from public.agents)

insert into public.properties (
  title, listing_type, property_type_id, status, show_when_unavailable, featured,
  price, currency, bedrooms, bathrooms, living_area, land_area, floors, year_built, furnished,
  description, country_id, city_id, neighborhood_id, address, show_full_address,
  latitude, longitude, google_maps_url, agent_id, slug
)
select v.title, v.listing_type, cat.id, v.status, v.show_when_unavailable, v.featured,
  v.price, 'MAD', v.bedrooms, v.bathrooms, v.living_area, v.land_area, v.floors, v.year_built, v.furnished,
  v.description, (select id from public.countries where slug = 'morocco'), loc.city_id, loc.neighborhood_id,
  v.address, true, v.latitude, v.longitude, v.google_maps_url, ag.id,
  lower(v.title || '-' || v.listing_type_label || '-marrakech-ref-' || v.ref_suffix)
from (values
  ('Riad Yasmine', 'sale', 'riads', 'available', false, true, 3500000, 4, 3, 220, 180, 2, 1920, true,
   'A meticulously restored 1920s riad in the heart of the Medina, blending traditional zellige craftsmanship with modern comfort. Centered on a plunge-pool courtyard and topped by a panoramic roof terrace.',
   'medina', '12 Derb El Ferrane, Medina', 31.6295, -7.9811, 'https://maps.google.com/?q=31.6295,-7.9811', 'yasmine@tinoubia-immobilier.com', '1024', 'a-vendre'),
  ('Villa Zahra', 'sale', 'villas', 'available', false, true, 8900000, 5, 4, 420, 1200, 2, 2018, false,
   'A contemporary villa set within the Palmeraie''s palm groves, featuring a 20-metre infinity pool, landscaped gardens and floor-to-ceiling glazing throughout.',
   'palmeraie', 'Route de Fes, Palmeraie', 31.6969, -7.9328, 'https://maps.google.com/?q=31.6969,-7.9328', 'yasmine@tinoubia-immobilier.com', '1025', 'a-vendre'),
  ('Appartement Gueliz Vue', 'sale', 'apartments', 'available', false, false, 1450000, 2, 2, 95, null, 3, 2015, false,
   'A bright, well-proportioned apartment in a secure residence in the heart of Gueliz, moments from cafes, galleries and boutiques.',
   'gueliz', 'Avenue Mohammed V, Gueliz', 31.6373, -8.0089, 'https://maps.google.com/?q=31.6373,-8.0089', 'karim@tinoubia-immobilier.com', '1026', 'a-vendre'),
  ('Villa Hivernage Prestige', 'rent', 'villas', 'available', false, true, 45000, 4, 3, 350, 600, 2, 2019, true,
   'A fully furnished prestige villa in Hivernage available for long-term rental, with private pool, mature garden and staff quarters.',
   'hivernage', 'Rue de la Mosquee, Hivernage', 31.6187, -8.0053, 'https://maps.google.com/?q=31.6187,-8.0053', 'karim@tinoubia-immobilier.com', '1027', 'a-louer'),
  ('Loft Gueliz Central', 'rent', 'apartments', 'available', false, false, 9500, 1, 1, 65, null, 2, 2012, true,
   'A compact, fully furnished loft in central Gueliz — ideal for professionals, with fast fibre internet and a shared rooftop terrace.',
   'gueliz', 'Rue de la Liberte, Gueliz', 31.6361, -8.0104, 'https://maps.google.com/?q=31.6361,-8.0104', 'karim@tinoubia-immobilier.com', '1028', 'a-louer'),
  ('Dar Zellige', 'rent', 'riads', 'available', false, false, 15000, 3, 3, 180, null, 2, 1910, true,
   'An intimate riad available for long-term rental in the historic Medina, with a hand-carved cedar salon and a small plunge pool.',
   'medina', 'Derb Sidi Bouloukate, Medina', 31.6258, -7.9892, 'https://maps.google.com/?q=31.6258,-7.9892', 'yasmine@tinoubia-immobilier.com', '1029', 'a-louer'),
  ('Residence Palmeraie Golf', 'sale', 'apartments', 'reserved', false, false, 2200000, 3, 2, 140, null, 1, 2020, false,
   'A ground-floor apartment overlooking the fairways, with a private terrace and direct garden access.',
   'palmeraie', 'Route de l''Ourika, Palmeraie', 31.6912, -7.9401, 'https://maps.google.com/?q=31.6912,-7.9401', 'karim@tinoubia-immobilier.com', '1030', 'a-vendre'),
  ('Villa Atlas View', 'sale', 'villas', 'available', false, true, 12500000, 6, 5, 550, 2000, 2, 2021, false,
   'An architectural statement villa with uninterrupted Atlas Mountain views, a 25-metre pool, and a dedicated hammam and gym wing.',
   'palmeraie', 'Douar Tensift, Palmeraie', 31.7021, -7.9256, 'https://maps.google.com/?q=31.7021,-7.9256', 'yasmine@tinoubia-immobilier.com', '1031', 'a-vendre'),
  ('Villa Gueliz Signature', 'sale', 'villas', 'sold', true, false, 6000000, 4, 3, 300, 500, 2, 2016, false,
   'A signature contemporary villa sold in Gueliz — kept here for reference as a recently completed sale.',
   'gueliz', 'Avenue Hassan II, Gueliz', 31.6402, -8.0121, 'https://maps.google.com/?q=31.6402,-8.0121', 'karim@tinoubia-immobilier.com', '1032', 'a-vendre')
) as v(title, listing_type, cat_slug, status, show_when_unavailable, featured, price, bedrooms, bathrooms, living_area, land_area, floors, year_built, furnished, description, n_slug, address, latitude, longitude, google_maps_url, agent_email, ref_suffix, listing_type_label)
join cat on cat.slug = v.cat_slug
join loc on loc.n_slug = v.n_slug
join ag on ag.email = v.agent_email;

-- Feature tags per property (by title, for readability in this seed) --------
insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('furnished', 'terrace', 'air-conditioning')
where p.title = 'Riad Yasmine';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('pool', 'garden', 'parking', 'air-conditioning', 'security')
where p.title = 'Villa Zahra';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('elevator', 'air-conditioning', 'parking')
where p.title = 'Appartement Gueliz Vue';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('pool', 'garden', 'furnished', 'security', 'parking')
where p.title = 'Villa Hivernage Prestige';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('furnished', 'air-conditioning', 'elevator')
where p.title = 'Loft Gueliz Central';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('furnished', 'pool', 'terrace')
where p.title = 'Dar Zellige';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('terrace', 'parking')
where p.title = 'Residence Palmeraie Golf';

insert into public.property_features (property_id, feature_id)
select p.id, f.id from public.properties p
join public.features f on f.slug in ('pool', 'garden', 'terrace', 'parking', 'security', 'fireplace')
where p.title = 'Villa Atlas View';

-- Media ------------------------------------------------------------------
insert into public.property_media (property_id, cloudinary_public_id, secure_url, resource_type, width, height, position, is_cover, alt_text)
select p.id, 'demo/' || p.slug || '-1', img.url, 'image', 1600, 1067, 0, true, p.title
from public.properties p
join (values
  ('Riad Yasmine', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Zahra', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'),
  ('Appartement Gueliz Vue', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Hivernage Prestige', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1600&q=80'),
  ('Loft Gueliz Central', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80'),
  ('Dar Zellige', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1600&q=80'),
  ('Residence Palmeraie Golf', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Atlas View', 'https://images.unsplash.com/photo-1524230507669-5ff97982bb5e?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Gueliz Signature', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80')
) as img(title, url) on img.title = p.title;

insert into public.property_media (property_id, cloudinary_public_id, secure_url, resource_type, width, height, position, is_cover, alt_text)
select p.id, 'demo/' || p.slug || '-2', img.url, 'image', 1600, 1067, 1, false, p.title || ' interior'
from public.properties p
join (values
  ('Riad Yasmine', 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Zahra', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'),
  ('Appartement Gueliz Vue', 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Hivernage Prestige', 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1600&q=80'),
  ('Loft Gueliz Central', 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1600&q=80'),
  ('Dar Zellige', 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1600&q=80'),
  ('Residence Palmeraie Golf', 'https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Atlas View', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80'),
  ('Villa Gueliz Signature', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80')
) as img(title, url) on img.title = p.title;
