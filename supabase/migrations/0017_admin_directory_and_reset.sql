-- Lets a full admin see the list of other admin/staff accounts (previously
-- only "select your own admins row" existed, so the team page had no way to
-- list existing team members at all — only create new ones) and stores
-- their email so the team page can show it without a separate Auth lookup.

alter table admins add column if not exists email text;

create policy "full admins can view all admin rows" on admins for select
  using (exists (select 1 from admins a2 where a2.auth_user_id = auth.uid() and a2.role = 'admin'));
