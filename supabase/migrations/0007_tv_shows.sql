-- TV shows: reviews and watchlists can hold shows as well as movies
-- Run once in Supabase, after 0006: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- media_type says what movie_id points at: 'movie' or 'tv'. TMDB numbers movies and
-- shows separately (movie 1399 and show 1399 are different things), so a title is
-- only identified by both together. Everything saved so far is a movie.

-------------------------------------------------------------------------------
-- Reviews: one per person per movie, and now one per person per show
-------------------------------------------------------------------------------
alter table public.reviews
  add column media_type text not null default 'movie' check (media_type in ('movie', 'tv'));

alter table public.reviews drop constraint reviews_user_id_movie_id_key;
alter table public.reviews add constraint reviews_user_id_media_type_movie_id_key unique (user_id, media_type, movie_id);

drop index public.reviews_movie_idx;
create index reviews_title_idx on public.reviews (media_type, movie_id);

-- Shows have no single runtime, so theirs stays empty (Year in Film counts movie hours)
comment on column public.reviews.runtime is 'Minutes, for movies only (Year in Film hours)';

-------------------------------------------------------------------------------
-- Watchlist: the same for saved titles
-------------------------------------------------------------------------------
alter table public.watchlist
  add column media_type text not null default 'movie' check (media_type in ('movie', 'tv'));

alter table public.watchlist drop constraint watchlist_pkey;
alter table public.watchlist add primary key (user_id, media_type, movie_id);

-- Reviewing something means you watched it, so it leaves your watchlist (same type only)
create or replace function public.remove_reviewed_from_watchlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.watchlist
   where user_id = new.user_id and movie_id = new.movie_id and media_type = new.media_type;
  return new;
end;
$$;

-------------------------------------------------------------------------------
-- Shared review links also say whether it's a movie or a show
-------------------------------------------------------------------------------
-- What it returns changes, so it's replaced rather than edited
drop function public.get_shared_review(uuid);

create function public.get_shared_review(review_id uuid)
returns table (
  id uuid,
  movie_id integer,
  media_type text,
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
  select r.id, r.movie_id, r.media_type, r.title, r.poster_path, r.release_date, r.rating, r.review, r.watched_on,
         r.shared_at, p.id, p.name, p.username, p.avatar
  from public.reviews r
  join public.profiles p on p.id = r.user_id
  where r.id = review_id and r.shared_at is not null and p.deletion_requested_at is null;
$$;

grant execute on function public.get_shared_review(uuid) to anon, authenticated;
