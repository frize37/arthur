-- Advisor logo, part two. 0014 added the column and the storage bucket, but
-- only a full admin could write either — so an advisor had no way at all to
-- put their own logo up, and the dashboard header just showed initials.
-- This lets an advisor manage their own logo, and nothing else.

-- 1. Storage: an advisor may write inside the folder named after their own
-- advisor id (uploadAdvisorLogo writes to `<advisorId>/<timestamp>-<file>`).
-- Note the explicit `objects.name`: a bare `name` here binds to advisors.name
-- instead of the storage path, which is exactly the bug that cost three
-- migrations in 0019-0021.
drop policy if exists "Advisors manage their own logo" on storage.objects;
create policy "Advisors manage their own logo"
on storage.objects for all
to authenticated
using (
  bucket_id = 'advisor-logos'
  and exists (
    select 1 from advisors a
    where a.auth_user_id = auth.uid()
      and a.id::text = (storage.foldername(objects.name))[1]
  )
)
with check (
  bucket_id = 'advisor-logos'
  and exists (
    select 1 from advisors a
    where a.auth_user_id = auth.uid()
      and a.id::text = (storage.foldername(objects.name))[1]
  )
);

-- 2. The advisors row: an advisor may update their own record. UPDATE was
-- already granted to `authenticated` back in 0001, so RLS is the only gate.
drop policy if exists "advisors can update their own row" on advisors;
create policy "advisors can update their own row" on advisors for update
  to authenticated
  using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- ...but only the logo. Commission, rating and cases_won are the business's
-- numbers, not the advisor's. Column-level GRANT can't express this (admin and
-- advisor are both the `authenticated` role — see 0018), so it's a trigger.
create or replace function enforce_advisor_self_update_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- The admin API routes write as service_role, which carries no auth.uid().
  -- (anon can't reach this trigger at all — it has no UPDATE policy here.)
  if auth.uid() is null then
    return new;
  end if;

  if exists (select 1 from admins where admins.auth_user_id = auth.uid()) then
    return new; -- admins may change anything
  end if;

  if (
    new.id is distinct from old.id
    or new.name is distinct from old.name
    or new.specialty is distinct from old.specialty
    or new.rating is distinct from old.rating
    or new.cases_won is distinct from old.cases_won
    or new.avg_response_hours is distinct from old.avg_response_hours
    or new.created_at is distinct from old.created_at
    or new.auth_user_id is distinct from old.auth_user_id
    or new.email is distinct from old.email
    or new.commission_type is distinct from old.commission_type
    or new.commission_value is distinct from old.commission_value
  ) then
    raise exception 'An advisor may only update their own logo.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_advisor_self_update_columns on advisors;
create trigger trg_enforce_advisor_self_update_columns
before update on advisors
for each row execute function enforce_advisor_self_update_columns();
