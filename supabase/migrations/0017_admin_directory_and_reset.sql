-- Lets a full admin see the list of other admin/staff accounts (previously
-- only "select your own admins row" existed, so the team page had no way to
-- list existing team members at all — only create new ones) and stores
-- their email so the team page can show it without a separate Auth lookup.

alter table admins add column if not exists email text;

-- The admin check goes through a SECURITY DEFINER function on purpose. A
-- policy ON admins whose USING clause selects FROM admins re-triggers RLS
-- on admins while evaluating it — Postgres raises "infinite recursion
-- detected in policy for relation admins", which would break every query
-- against the table, including the one getCurrentRole() runs on login.
-- Inside a SECURITY DEFINER function the lookup runs as the owner, with
-- RLS skipped, so there's nothing to recurse into.
create or replace function public.is_full_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from admins where auth_user_id = auth.uid() and role = 'admin');
$$;

grant execute on function public.is_full_admin() to authenticated;

drop policy if exists "full admins can view all admin rows" on admins;
create policy "full admins can view all admin rows" on admins for select
  using (public.is_full_admin());
