-- Instagram videos the agency shows on the homepage for social proof / trust.
-- Any active staff member (incl. agents) can add their own reels/posts.
create table public.instagram_videos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  caption text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.instagram_videos enable row level security;

create policy instagram_videos_select on public.instagram_videos
  for select using (true);

create policy instagram_videos_write on public.instagram_videos
  for all using (public.is_staff()) with check (public.is_staff());
