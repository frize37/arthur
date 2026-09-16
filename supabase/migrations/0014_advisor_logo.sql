-- Advisor logo: shown in the advisor's own dashboard, in the admin team
-- list, and in the "you won the case" email sent to the client.

alter table advisors add column if not exists logo_url text;

-- Adding logo_url at the END of the select list is safe with CREATE OR
-- REPLACE VIEW (Postgres only forbids renaming/reordering existing output
-- columns, see 0012's comment for the migration that got bitten by this).
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
  a.logo_url
from advisors a;

grant select on advisors_directory to authenticated;

-- Public bucket: logos are shown in emails (no auth context) and are not
-- sensitive, so reads are open; only a full admin may upload/replace/delete.
insert into storage.buckets (id, name, public)
values ('advisor-logos', 'advisor-logos', true)
on conflict (id) do nothing;

drop policy if exists "Public read advisor logos" on storage.objects;
create policy "Public read advisor logos"
on storage.objects for select
using (bucket_id = 'advisor-logos');

drop policy if exists "Admins manage advisor logos" on storage.objects;
create policy "Admins manage advisor logos"
on storage.objects for all
using (
  bucket_id = 'advisor-logos'
  and exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin')
)
with check (
  bucket_id = 'advisor-logos'
  and exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin')
);
