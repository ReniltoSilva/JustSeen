-- Deleted accounts wait 30 days before they're gone for good
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- "Delete account" now stamps the profile with deletion_requested_at. From that moment
-- the account is hidden: nobody else can see the profile, reviews, watchlist,
-- follows or reactions, and shared review links stop working. Logging back in within
-- 30 days offers to restore everything. After 30 days a nightly job deletes the
-- login, and "on delete cascade" removes everything that belonged to it, as before.

alter table public.profiles add column deletion_requested_at timestamptz;

-------------------------------------------------------------------------------
-- Only the two functions below may change deletion_requested_at, so nobody can
-- shorten their own 30 days (or set a date for someone else)
-------------------------------------------------------------------------------
create function public.guard_deletion_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.deletion_requested_at is distinct from old.deletion_requested_at
     and coalesce(current_setting('justseen.changing_deletion', true), '') <> 'yes' then
    raise exception 'Use request_account_deletion() or cancel_account_deletion()';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_deletion_date
  before update on public.profiles
  for each row execute function public.guard_deletion_date();

-- Hides the account straight away; returns the day it will be deleted for good
create function public.request_account_deletion()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;
  perform set_config('justseen.changing_deletion', 'yes', true);
  update public.profiles
     set deletion_requested_at = coalesce(deletion_requested_at, now())
   where id = auth.uid()
  returning deletion_requested_at into requested;
  return requested + interval '30 days';
end;
$$;

-- Changed their mind within the 30 days: everything comes back
create function public.cancel_account_deletion()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;
  perform set_config('justseen.changing_deletion', 'yes', true);
  update public.profiles set deletion_requested_at = null where id = auth.uid();
end;
$$;

revoke execute on function public.request_account_deletion() from public, anon;
grant execute on function public.request_account_deletion() to authenticated;
revoke execute on function public.cancel_account_deletion() from public, anon;
grant execute on function public.cancel_account_deletion() to authenticated;

-- The old "delete straight away" function is replaced by the two above
drop function public.delete_my_account();

-------------------------------------------------------------------------------
-- Hide accounts waiting to be deleted from everyone except themselves
-------------------------------------------------------------------------------
-- Is this person's account active? (security definer, so the policies below can ask
-- without running into the profiles policy themselves)
create function public.is_active_account(person uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = person and deletion_requested_at is null);
$$;

drop policy "profiles are visible to logged-in users" on public.profiles;
create policy "profiles are visible to logged-in users" on public.profiles
  for select to authenticated using (deletion_requested_at is null or id = (select auth.uid()));

drop policy "reviews are visible to logged-in users" on public.reviews;
create policy "reviews are visible to logged-in users" on public.reviews
  for select to authenticated using (user_id = (select auth.uid()) or public.is_active_account(user_id));

drop policy "watchlists are visible to logged-in users" on public.watchlist;
create policy "watchlists are visible to logged-in users" on public.watchlist
  for select to authenticated using (user_id = (select auth.uid()) or public.is_active_account(user_id));

drop policy "follows are visible to logged-in users" on public.follows;
create policy "follows are visible to logged-in users" on public.follows
  for select to authenticated using (
    follower_id = (select auth.uid()) or following_id = (select auth.uid())
    or (public.is_active_account(follower_id) and public.is_active_account(following_id))
  );

drop policy "reactions are visible to logged-in users" on public.reactions;
create policy "reactions are visible to logged-in users" on public.reactions
  for select to authenticated using (user_id = (select auth.uid()) or public.is_active_account(user_id));

drop policy "people see their own notifications" on public.notifications;
create policy "people see their own notifications" on public.notifications
  for select to authenticated using (recipient_id = (select auth.uid()) and public.is_active_account(actor_id));

-- Shared review links stop working while an account waits to be deleted
create or replace function public.get_shared_review(review_id uuid)
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
  where r.id = review_id and r.shared_at is not null and p.deletion_requested_at is null;
$$;

-------------------------------------------------------------------------------
-- Every night at 03:15 (UTC), delete accounts whose 30 days are up
-------------------------------------------------------------------------------
create function public.purge_deleted_accounts()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  removed integer;
begin
  delete from auth.users
   where id in (
     select id from public.profiles where deletion_requested_at < now() - interval '30 days'
   );
  get diagnostics removed = row_count;
  return removed;
end;
$$;

-- Only the scheduled job runs this, never the apps
revoke execute on function public.purge_deleted_accounts() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;

select cron.schedule('purge-deleted-accounts', '15 3 * * *', 'select public.purge_deleted_accounts()');
