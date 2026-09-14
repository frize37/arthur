-- 1) Raw rate-basis label per track (e.g. "פריים", "עוגן בנק ישראל"), so the
--    UI can label a Prime-anchored variable track as "פריים" instead of a
--    generic "משתנה".
alter table case_loan_tracks add column if not exists anchor_basis text;

-- 2) Security fix: today, any advisor assigned to a case can read the full
-- `cases` row via the API — including contact_name/phone/email — because
-- Postgres RLS is row-level, not column-level, and the existing "advisors
-- can read assigned cases" policy grants the whole row. The app just never
-- asked for those columns, which is not real access control.
--
-- This view nulls out contact fields unless the querying advisor is the
-- one whose offer actually won the case. `security_invoker` makes it run
-- with the caller's own permissions, so the underlying RLS on `cases` still
-- restricts which rows are visible at all; the advisor app should query
-- this view instead of the `cases` table directly.
create or replace view advisor_cases
  with (security_invoker = true) as
select
  c.id, c.status, c.complex, c.request_type, c.goal,
  c.property_source, c.property_legal, c.property_value, c.mortgage_amount, c.equity,
  c.comfort_payment, c.max_stress_payment,
  c.future_release, c.future_release_amount, c.future_release_timing, c.upcoming_event, c.income_change,
  c.has_second_applicant, c.employment1, c.seniority1, c.employment2, c.seniority2, c.income, c.extra,
  c.other_loans, c.other_loans_payment, c.other_loans_ending_soon, c.other_loans_months_left, c.credit_issues,
  c.doc_confirmed, c.doc_skipped, c.doc_balance, c.doc_rate, c.doc_years, c.doc_months,
  c.doc_quote_valid_date, c.doc_total_principal, c.doc_total_early_repayment_fee, c.doc_total_payoff,
  c.doc_account_comparison_rate, c.doc_account_forecast_rate,
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
