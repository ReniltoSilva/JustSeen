-- Google sign-in
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Accounts made with Google arrive without a username (Google only knows the
-- email and name). Before this change the profile insert failed and so did the
-- sign-in. Now the database picks a temporary username from the email and marks
-- the profile, so the app can ask the person to choose their own on first visit.

alter table public.profiles add column needs_setup boolean not null default false;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  chosen text := lower(meta ->> 'username');
  base text;
  candidate text;
  display_name text;
  animals text[] := array['fox', 'panda', 'koala', 'tiger', 'lion', 'frog', 'monkey', 'penguin',
    'owl', 'octopus', 'bear', 'rabbit', 'cat', 'dog', 'unicorn', 'dragon',
    'wolf', 'raccoon', 'hamster', 'pig', 'cow', 'giraffe', 'whale', 'hedgehog'];
begin
  -- Email sign-up: the form already chose everything
  if chosen is not null then
    insert into public.profiles (id, username, name, avatar)
    values (
      new.id,
      chosen,
      coalesce(nullif(trim(meta ->> 'name'), ''), chosen),
      coalesce(meta ->> 'avatar', '')
    );
    return new;
  end if;

  -- Google (or any sign-in without a username): "Maya.Lopez+films@gmail.com" -> "maya.lopezfilms"
  -- (0004 replaces this with a username built from the name instead)
  base := left(regexp_replace(lower(split_part(coalesce(new.email, ''), '@', 1)), '[^a-z0-9._]', '', 'g'), 15);
  if char_length(base) < 3 then
    base := 'movielover';
  end if;

  -- Taken? Add numbers until it isn't
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := base || floor(random() * 10000)::int;
  end loop;

  display_name := left(coalesce(nullif(trim(meta ->> 'full_name'), ''), nullif(trim(meta ->> 'name'), ''), base), 40);

  insert into public.profiles (id, username, name, avatar, needs_setup)
  values (
    new.id,
    candidate,
    display_name,
    'animal:' || animals[1 + floor(random() * array_length(animals, 1))::int],
    true
  );
  return new;
end;
$$;
