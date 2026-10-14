-- Shareable review links (justseenapp.com/r/<review id>)
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- When someone shares a review, the app uploads a preview picture and stamps the
-- review with shared_at. From then on, anyone with the link can see that one review
-- (the page and the WhatsApp / X / Facebook preview). Reviews never shared stay
-- visible to logged-in JustSeen users only, as before.

alter table public.reviews add column shared_at timestamptz;

-- The one thing logged-out visitors can read: a review its author has shared,
-- with only what the share page shows
create function public.get_shared_review(review_id uuid)
returns table (
  id uuid,
  movie_id integer,
  title text,
  poster_path text,
  release_date date,
  rating numeric,
  review text,
  watched_on date,
  shared_at timestamptz,
  author_id uuid,
  author_name text,
  author_username text,
  author_avatar text
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.movie_id, r.title, r.poster_path, r.release_date, r.rating, r.review, r.watched_on,
         r.shared_at, p.id, p.name, p.username, p.avatar
  from public.reviews r
  join public.profiles p on p.id = r.user_id
  where r.id = review_id and r.shared_at is not null;
$$;

grant execute on function public.get_shared_review(uuid) to anon, authenticated;

-- Preview pictures: a public folder anyone can look at, where people can only put
-- files into their own sub-folder (share-cards/<their user id>/<review id>.jpg)
insert into storage.buckets (id, name, public)
values ('share-cards', 'share-cards', true)
on conflict (id) do nothing;

create policy "people see their own share pictures" on storage.objects
  for select to authenticated
  using (bucket_id = 'share-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "people add their own share pictures" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'share-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "people replace their own share pictures" on storage.objects
  for update to authenticated
  using (bucket_id = 'share-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "people remove their own share pictures" on storage.objects
  for delete to authenticated
  using (bucket_id = 'share-cards' and (storage.foldername(name))[1] = (select auth.uid())::text);
