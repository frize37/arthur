-- Arthur: real accounts + per-case advisor assignment.
-- Run this once in the Supabase SQL Editor.

-- Link an advisor row to a real login account (nullable until we create the account).
alter table advisors add column if not exists auth_user_id uuid unique references auth.users(id);

-- Internal team accounts (full access, no advisor row).
create table if not exists admins (
  auth_user_id uuid primary key references auth.users(id),
  name text not null,
  created_at timestamptz not null default now()
);

-- Which advisors a given case was actually routed to (admin decides, not a fixed "4").
create table if not exists case_advisors (
  case_id uuid not null references cases(id) on delete cascade,
  advisor_id uuid not null references advisors(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (case_id, advisor_id)
);

grant select, insert, update, delete on admins, case_advisors to anon, authenticated;
alter table admins enable row level security;
alter table case_advisors enable row level security;

-- Replace the permissive "allow everyone" policies from the first migration
-- with real, role-aware access now that login accounts exist.

drop policy if exists "temp_allow_all_advisors" on advisors;
drop policy if exists "temp_allow_all_cases" on cases;
drop policy if exists "temp_allow_all_offers" on offers;

-- advisors: any signed-in team member (admin or advisor) can see the roster; public cannot.
create policy "signed in users can read advisors" on advisors for select
  using (auth.role() = 'authenticated');
create policy "admins can manage advisors" on advisors for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid()));

-- cases: anyone (including the public wizard) can create one; only admins can see/update
-- everything, advisors only see cases actually assigned to them.
create policy "anyone can submit a case" on cases for insert
  with check (true);
create policy "admins can read all cases" on cases for select
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()));
create policy "admins can update cases" on cases for update
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid()));
create policy "advisors can read assigned cases" on cases for select
  using (exists (
    select 1 from case_advisors ca
    join advisors a on a.id = ca.advisor_id
    where ca.case_id = cases.id and a.auth_user_id = auth.uid()
  ));

-- case_advisors: admins manage assignments; advisors can see their own.
create policy "admins manage case_advisors" on case_advisors for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid()));
create policy "advisors read their own assignments" on case_advisors for select
  using (exists (select 1 from advisors a where a.id = case_advisors.advisor_id and a.auth_user_id = auth.uid()));

-- offers: admins see/manage everything; an advisor can only insert/read their own.
create policy "admins manage offers" on offers for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid()));
create policy "advisors insert their own offers" on offers for insert
  with check (exists (select 1 from advisors a where a.id = offers.advisor_id and a.auth_user_id = auth.uid()));
create policy "advisors read their own offers" on offers for select
  using (exists (select 1 from advisors a where a.id = offers.advisor_id and a.auth_user_id = auth.uid()));
