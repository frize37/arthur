-- Migrations 0009 and 0010 each ran as one transaction in the SQL
-- editor. Both ended with a `create or replace view advisor_cases`
-- that tried to rename the view's old doc_skipped output column to
-- doc_source at the same position — Postgres rejects that (error
-- 42P16; only appending new columns at the end is allowed via CREATE
-- OR REPLACE). That error rolled back the ENTIRE transaction, which
-- silently undid every ALTER TABLE earlier in the same script too:
-- cases.doc_source, cases.completion_note, cases.completed_by,
-- advisors.email, advisors.commission_type, advisors.commission_value
-- never actually got created, even though the scripts reported success
-- up to that point. This migration re-adds all of them, then rebuilds
-- the view with DROP + CREATE instead of REPLACE to sidestep the
-- rename restriction for good.

alter table cases add column if not exists doc_source text;
alter table cases add column if not exists completion_note text;
alter table cases add column if not exists completed_by text;

alter table advisors add column if not exists email text;
alter table advisors add column if not exists commission_type text not null default 'percent';
alter table advisors add column if not exists commission_value numeric not null default 10;

drop view if exists advisor_cases;

create view advisor_cases
  with (security_invoker = true) as
select
  c.id, c.status, c.complex, c.request_type, c.goal,
  c.property_source, c.property_legal, c.property_value, c.mortgage_amount, c.equity,
  c.comfort_payment, c.max_stress_payment,
  c.future_release, c.future_release_amount, c.future_release_timing, c.upcoming_event, c.income_change,
  c.has_second_applicant, c.employment1, c.seniority1, c.employment2, c.seniority2, c.income, c.extra,
  c.other_loans, c.other_loans_payment, c.other_loans_ending_soon, c.other_loans_months_left, c.credit_issues,
  c.doc_confirmed, c.doc_source, c.doc_balance, c.doc_rate, c.doc_years, c.doc_months,
  c.doc_quote_valid_date, c.doc_total_principal, c.doc_total_early_repayment_fee, c.doc_total_payoff,
  c.doc_account_comparison_rate, c.doc_account_forecast_rate,
  c.completion_note, c.completed_by,
  c.created_at, c.updated_at,
  case when exists (
    select 1 from offers o join advisors a on a.id = o.advisor_id
    where o.case_id = c.id and o.is_winner and a.auth_user_id = auth.uid()
  ) then c.contact_name else null end as contact_name,
  case when exists (
    select 1 from offers o join advisors a on a.id = o.advisor_id
    where o.case_id = c.id and o.is_winner and a.auth_user_id = auth.uid()
  ) then c.contact_phone else null end as contact_phone,
  case when exists (
    select 1 from offers o join advisors a on a.id = o.advisor_id
    where o.case_id = c.id and o.is_winner and a.auth_user_id = auth.uid()
  ) then c.contact_email else null end as contact_email
from cases c;

grant select on advisor_cases to authenticated;

-- advisors_directory (0010) also needs commission_type/commission_value/
-- email to exist on the base table — recreate it now that they do.
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

-- Re-assert the full-admin-only write policy on advisors (from 0011)
-- in case that part of the script also rolled back.
drop policy if exists "admins can manage advisors" on advisors;
drop policy if exists "full admins can manage advisors" on advisors;
create policy "full admins can manage advisors" on advisors for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin'))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid() and admins.role = 'admin'));
