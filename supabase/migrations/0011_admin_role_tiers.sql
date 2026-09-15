-- Two admin tiers: 'admin' (full access — commissions, add/remove
-- advisors and team) and 'staff' (day-to-day case work, no commission
-- visibility, can't add/remove advisors or team members).

alter table admins add column if not exists role text not null default 'admin';

-- advisors_directory (0010): only a full admin, or the advisor's own
-- row, sees commission_type/commission_value/email — a staff admin
-- gets null for those, same as any other advisor looking at a peer.
create or replace view advisors_directory
  with (security_invoker = true) as
select
  a.id, a.name, a.specialty, a.rating, a.cases_won, a.avg_response_hours, a.created_at,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin') or a.auth_user_id = auth.uid()
    then a.commission_type else null end as commission_type,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin') or a.auth_user_id = auth.uid()
    then a.commission_value else null end as commission_value,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin')
    then a.email else null end as email
from advisors a;

grant select on advisors_directory to authenticated;

-- Adding/editing/removing advisor rows (name, commission, deletion) is
-- now full-admin only. Staff keeps read access via the existing
-- "signed in users can read advisors" policy, and keeps managing case
-- assignment/offers/chat/completion through the unchanged case-scoped
-- policies — this only narrows the advisors table itself.
drop policy if exists "admins can manage advisors" on advisors;
create policy "full admins can manage advisors" on advisors for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin'))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin'));
