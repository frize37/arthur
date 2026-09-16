-- Fix 1: migrations 0015/0016 granted UPDATE on clean_doc_name/clean_doc_type/
-- original_doc_name/original_doc_type to `authenticated` so the admin's
-- browser session could write them. But `authenticated` is shared by every
-- signed-in advisor too, and advisors already have a row-level UPDATE policy
-- on cases (for status/completion) with no column restriction of its own —
-- so those grants accidentally let any advisor assigned to a case rewrite
-- its document metadata directly via the client, bypassing the "only admins
-- write case documents" rule those migrations state in their own comments.
-- Column-level GRANT can't distinguish admin from advisor (both are the same
-- Postgres role), so enforce it with a trigger instead.

create or replace function enforce_admin_only_doc_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.clean_doc_name is distinct from old.clean_doc_name
    or new.clean_doc_type is distinct from old.clean_doc_type
    or new.original_doc_name is distinct from old.original_doc_name
    or new.original_doc_type is distinct from old.original_doc_type
  ) and not exists (select 1 from admins where admins.auth_user_id = auth.uid()) then
    raise exception 'Only admins may update case document metadata.';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_admin_only_doc_columns on cases;
create trigger trg_enforce_admin_only_doc_columns
before update on cases
for each row execute function enforce_admin_only_doc_columns();

-- Fix 2: admins has had RLS enabled since 0002, but only SELECT policies
-- ever existed (0003: your own row; 0017: any row, for full admins) — no
-- UPDATE policy at all, so the Team page's "edit name" feature has been
-- silently doing nothing: a 0-row UPDATE isn't an error, so the UI reports
-- success and shows the old name again on reload.

create policy "full admins can update admin rows" on admins for update
  using (exists (select 1 from admins a2 where a2.auth_user_id = auth.uid() and a2.role = 'admin'))
  with check (exists (select 1 from admins a2 where a2.auth_user_id = auth.uid() and a2.role = 'admin'));
