-- An advisor's legal name is often not the name their business trades under,
-- and `specialty` has been doing double duty as both an internal routing note
-- and public marketing copy. Split them: `name`/`specialty` stay the internal
-- record, and a separate public profile is what the landing page shows.
--
-- Also adds the two switches the office asked for: whether an advisor appears
-- on the site at all, and whether the advisor may edit their own profile or
-- it is locked to the office.

alter table advisors add column if not exists public_name text;
alter table advisors add column if not exists public_specialty text;
alter table advisors add column if not exists is_public boolean not null default true;
alter table advisors add column if not exists profile_locked boolean not null default false;

-- Appending columns at the end is safe with CREATE OR REPLACE VIEW (Postgres
-- only forbids renaming/reordering existing output columns — see 0012).
create or replace view advisors_directory
  with (security_invoker = true) as
select
  a.id, a.name, a.specialty, a.rating, a.cases_won, a.avg_response_hours, a.created_at,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin') or a.auth_user_id = auth.uid()
    then a.commission_type else null end as commission_type,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin') or a.auth_user_id = auth.uid()
    then a.commission_value else null end as commission_value,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin')
    then a.email else null end as email,
  a.logo_url,
  a.public_name, a.public_specialty, a.is_public, a.profile_locked
from advisors a;

grant select on advisors_directory to authenticated;

-- Replaces the version from 0024. An advisor may now edit their own public
-- profile — logo, trading name, what they specialise in — but only while the
-- office leaves it unlocked, and never the switches themselves.
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
    return new; -- the office may change anything
  end if;

  -- Never the advisor's own: internal record, money, and the two switches.
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
    or new.is_public is distinct from old.is_public
    or new.profile_locked is distinct from old.profile_locked
  ) then
    raise exception 'An advisor may only edit their own public profile.';
  end if;

  -- What is left is logo_url / public_name / public_specialty — allowed only
  -- while the office has not locked this advisor's profile.
  if old.profile_locked and (
    new.logo_url is distinct from old.logo_url
    or new.public_name is distinct from old.public_name
    or new.public_specialty is distinct from old.public_specialty
  ) then
    raise exception 'This advisor profile is locked by the office.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_advisor_self_update_columns on advisors;
create trigger trg_enforce_advisor_self_update_columns
before update on advisors
for each row execute function enforce_advisor_self_update_columns();
