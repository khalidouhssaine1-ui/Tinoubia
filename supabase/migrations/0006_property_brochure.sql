-- Optional downloadable PDF brochure per property. Uploaded to Cloudinary as a
-- raw asset by staff; a "Download brochure" button appears on the public page.
alter table public.properties
  add column brochure_url text,
  add column brochure_public_id text;
