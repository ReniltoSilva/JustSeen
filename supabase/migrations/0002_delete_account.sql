-- Lets people delete their own account from inside the app.
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
--
-- Deleting the login (auth.users) removes the profile, and through
-- "on delete cascade" every review, follow, reaction, watchlist entry and
-- notification that belongs to it.

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

-- Only logged-in people can call it, and it only ever deletes the caller
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
