-- JustSeen database
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Tables: profiles, follows, reviews, watchlist, reactions, notifications.
-- Row Level Security (RLS) is on everywhere: the publishable key in the website
-- can only do what the policies below allow, so people can only change their own data.

-------------------------------------------------------------------------------
-- Profiles: one per login, created automatically when someone signs up
-------------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9._]{3,20}$'),
  name text not null check (char_length(name) between 1 and 40),
  bio text not null default '' check (char_length(bio) <= 80),
  location text not null default '' check (char_length(location) <= 40),
  avatar text not null default '',
  created_at timestamptz not null default now()
);

-- Sign-up passes username, name and avatar as metadata; this copies them into profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, name, avatar)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), new.raw_user_meta_data ->> 'username'),
    coalesce(new.raw_user_meta_data ->> 'avatar', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check a username before the account exists
create function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.profiles where username = lower(candidate));
$$;

grant execute on function public.username_available(text) to anon, authenticated;

-------------------------------------------------------------------------------
-- Follows: one-way, like Letterboxd
-------------------------------------------------------------------------------
create table public.follows (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index follows_following_idx on public.follows (following_id);

-------------------------------------------------------------------------------
-- Reviews: one per person per movie (the unique constraint makes duplicates impossible)
-------------------------------------------------------------------------------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  movie_id integer not null, -- TMDB id
  title text not null,
  poster_path text,
  overview text not null default '',
  genre_ids integer[] not null default '{}',
  release_date date,
  runtime integer, -- minutes, for the Year in Film stats
  rating numeric(2, 1) not null check (rating between 0.5 and 5 and rating * 2 = floor(rating * 2)),
  review text not null default '' check (char_length(review) <= 250),
  watched_on date not null default current_date check (watched_on <= current_date + 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, movie_id)
);

create index reviews_user_watched_idx on public.reviews (user_id, watched_on desc);
create index reviews_movie_idx on public.reviews (movie_id);

create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_touch_updated_at
  before update on public.reviews
  for each row execute function public.touch_updated_at();

-------------------------------------------------------------------------------
-- Watchlist: movies someone wants to see
-------------------------------------------------------------------------------
create table public.watchlist (
  user_id uuid not null references public.profiles (id) on delete cascade,
  movie_id integer not null,
  title text not null,
  poster_path text,
  overview text not null default '',
  genre_ids integer[] not null default '{}',
  release_date date,
  created_at timestamptz not null default now(),
  primary key (user_id, movie_id)
);

-- Reviewing a movie means you watched it, so it leaves your watchlist
create function public.remove_reviewed_from_watchlist()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.watchlist where user_id = new.user_id and movie_id = new.movie_id;
  return new;
end;
$$;

create trigger reviews_clear_watchlist
  after insert on public.reviews
  for each row execute function public.remove_reviewed_from_watchlist();

-------------------------------------------------------------------------------
-- Reactions: agree / not sure / disagree on someone's review, one per person
-------------------------------------------------------------------------------
create type public.reaction_kind as enum ('agree', 'unsure', 'disagree');

create table public.reactions (
  review_id uuid not null references public.reviews (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

create index reactions_user_idx on public.reactions (user_id);

-------------------------------------------------------------------------------
-- Notifications: written by triggers only, so nobody can fake one
-------------------------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('reaction', 'follow')),
  review_id uuid references public.reviews (id) on delete cascade,
  reaction public.reaction_kind,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on public.notifications (recipient_id, created_at desc);

-- Someone reacted (or changed their reaction): replace their old notification
create function public.notify_reaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner uuid;
begin
  select user_id into owner from public.reviews where id = new.review_id;

  delete from public.notifications
  where type = 'reaction' and review_id = new.review_id and actor_id = new.user_id;

  if owner is not null and owner <> new.user_id then
    insert into public.notifications (recipient_id, actor_id, type, review_id, reaction)
    values (owner, new.user_id, 'reaction', new.review_id, new.kind);
  end if;
  return new;
end;
$$;

create trigger reactions_notify
  after insert or update on public.reactions
  for each row execute function public.notify_reaction();

-- Reaction taken back: its notification goes too
create function public.unnotify_reaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications
  where type = 'reaction' and review_id = old.review_id and actor_id = old.user_id;
  return old;
end;
$$;

create trigger reactions_unnotify
  after delete on public.reactions
  for each row execute function public.unnotify_reaction();

-- New follower
create function public.notify_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications
  where type = 'follow' and recipient_id = new.following_id and actor_id = new.follower_id;

  insert into public.notifications (recipient_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$;

create trigger follows_notify
  after insert on public.follows
  for each row execute function public.notify_follow();

create function public.unnotify_follow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.notifications
  where type = 'follow' and recipient_id = old.following_id and actor_id = old.follower_id;
  return old;
end;
$$;

create trigger follows_unnotify
  after delete on public.follows
  for each row execute function public.unnotify_follow();

-------------------------------------------------------------------------------
-- Row Level Security: who can read and write what
-------------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.follows enable row level security;
alter table public.reviews enable row level security;
alter table public.watchlist enable row level security;
alter table public.reactions enable row level security;
alter table public.notifications enable row level security;

-- Profiles: logged-in people can see everyone, and change only their own
create policy "profiles are visible to logged-in users" on public.profiles
  for select to authenticated using (true);
create policy "people update their own profile" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Follows: visible to logged-in users; you can only follow/unfollow as yourself
create policy "follows are visible to logged-in users" on public.follows
  for select to authenticated using (true);
create policy "people follow as themselves" on public.follows
  for insert to authenticated with check (follower_id = auth.uid());
create policy "people unfollow as themselves" on public.follows
  for delete to authenticated using (follower_id = auth.uid());

-- Reviews: visible to logged-in users; you write, edit and delete only your own
create policy "reviews are visible to logged-in users" on public.reviews
  for select to authenticated using (true);
create policy "people add their own reviews" on public.reviews
  for insert to authenticated with check (user_id = auth.uid());
create policy "people edit their own reviews" on public.reviews
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "people delete their own reviews" on public.reviews
  for delete to authenticated using (user_id = auth.uid());

-- Watchlists: visible to logged-in users (profiles show them); you change only your own
create policy "watchlists are visible to logged-in users" on public.watchlist
  for select to authenticated using (true);
create policy "people add to their own watchlist" on public.watchlist
  for insert to authenticated with check (user_id = auth.uid());
create policy "people remove from their own watchlist" on public.watchlist
  for delete to authenticated using (user_id = auth.uid());

-- Reactions: visible to logged-in users; you react as yourself, never to your own review
create policy "reactions are visible to logged-in users" on public.reactions
  for select to authenticated using (true);
create policy "people react as themselves, not to their own reviews" on public.reactions
  for insert to authenticated with check (
    user_id = auth.uid()
    and not exists (select 1 from public.reviews r where r.id = review_id and r.user_id = auth.uid())
  );
create policy "people change their own reaction" on public.reactions
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "people take back their own reaction" on public.reactions
  for delete to authenticated using (user_id = auth.uid());

-- Notifications: only the recipient sees them, and can mark them read or delete them
create policy "people see their own notifications" on public.notifications
  for select to authenticated using (recipient_id = auth.uid());
create policy "people mark their own notifications read" on public.notifications
  for update to authenticated using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy "people delete their own notifications" on public.notifications
  for delete to authenticated using (recipient_id = auth.uid());

-------------------------------------------------------------------------------
-- Realtime: new notifications are pushed to the browser instantly
-------------------------------------------------------------------------------
alter publication supabase_realtime add table public.notifications;
