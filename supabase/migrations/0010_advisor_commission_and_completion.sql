-- Advisor commission terms (what they pay Arthur), an email column for
-- account creation, and case-completion tracking (deal executed / not).

alter table advisors add column if not exists email text;
alter table advisors add column if not exists commission_type text not null default 'percent'; -- 'percent' | 'fixed'
alter table advisors add column if not exists commission_value numeric not null default 10;

alter table cases add column if not exists completion_note text;
alter table cases add column if not exists completed_by text; -- 'advisor' | 'admin'

-- Advisors table already has a blanket "signed in users can read advisors"
-- policy — fine for name/specialty/rating, but commission_value and email
-- are not something one advisor should see on another advisor's row.
-- This view nulls those two fields out unless the caller is an admin or
-- it's the advisor's own row; both apps should read through it instead
-- of the raw table.
create or replace view advisors_directory
  with (security_invoker = true) as
select
  a.id, a.name, a.specialty, a.rating, a.cases_won, a.avg_response_hours, a.created_at,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid()) or a.auth_user_id = auth.uid()
    then a.commission_type else null end as commission_type,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid()) or a.auth_user_id = auth.uid()
    then a.commission_value else null end as commission_value,
  case when exists (select 1 from admins where admins.auth_user_id = auth.uid())
    then a.email else null end as email
from advisors a;

grant select on advisors_directory to authenticated;

-- advisor_cases (migration 0007/0009) also lists columns explicitly.
create or replace view advisor_cases
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

-- advisors can now update a case's completion fields (but only cases
-- assigned to them, and only completion-related — enforced at the
-- application layer since column-level RLS isn't practical here; the
-- existing "advisors can read assigned cases" policy already scopes
-- which rows are visible, this adds the matching UPDATE.
create policy "advisors can mark completion on assigned cases" on cases for update
  using (exists (
    select 1 from case_advisors ca join advisors a on a.id = ca.advisor_id
    where ca.case_id = cases.id and a.auth_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from case_advisors ca join advisors a on a.id = ca.advisor_id
    where ca.case_id = cases.id and a.auth_user_id = auth.uid()
  ));

-- RLS is row-level only — without this, an advisor granted UPDATE by the
-- policy above could rewrite any column on a case assigned to them (the
-- client's contact info included), not just mark it complete. Column-
-- level grants apply regardless of which policy matched, so this caps
-- every authenticated UPDATE (admin's included — admin's app code only
-- ever touches these same columns anyway) to just the completion fields.
revoke update on cases from authenticated;
grant update (status, completion_note, completed_by) on cases to authenticated;
