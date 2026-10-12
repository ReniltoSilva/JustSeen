-- Safer temporary usernames for Google sign-ins (replaces the version in 0003)
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.
--
-- Two changes:
-- 1. The username comes from the person's name ("Maya López" -> "maya.lpez"),
--    not their email, so other people can't learn part of their email address.
-- 2. If two people sign up at the same moment and grab the same username, the
--    second one retries with a new number instead of their sign-in failing.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  chosen text := lower(meta ->> 'username');
  display_name text;
  base text;
  candidate text;
  attempts int := 0;
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

  -- Google (or any sign-in without a username): build one from their name
  display_name := left(coalesce(nullif(trim(meta ->> 'full_name'), ''), nullif(trim(meta ->> 'name'), ''), 'Movie lover'), 40);

  -- "Maya Lopez" -> "maya.lopez": spaces become dots, other characters are dropped
  base := regexp_replace(lower(display_name), '\s+', '.', 'g');
  base := regexp_replace(base, '[^a-z0-9._]', '', 'g');
  base := left(trim(both '.' from base), 15);
  if char_length(base) < 3 then
    base := 'movielover';
  end if;

  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    candidate := base || floor(random() * 10000)::int;
  end loop;

  -- Someone else may take the same name between the check above and this insert;
  -- if so, try another number rather than failing the sign-in
  loop
    begin
      insert into public.profiles (id, username, name, avatar, needs_setup)
      values (
        new.id,
        candidate,
        display_name,
        'animal:' || animals[1 + floor(random() * array_length(animals, 1))::int],
        true
      );
      return new;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts >= 10 then
        raise;
      end if;
      candidate := base || floor(random() * 10000)::int;
    end;
  end loop;
end;
$$;
