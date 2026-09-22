-- The wizard now collects the answers that actually move the regulatory
-- gates, rather than leaving the advisor to ask them all over again:
--   selling_existing — for a replacement home, selling before the purchase
--     counts as first-home (75%) and after it as replacement (70%); the rest
--     of the LTV ceiling follows from the purchase goal already collected
--   oldest_age — payments must end by 75, so this caps the term
--   has_zakaut — cheaper rate, no early-repayment fee, and it doesn't
--     count toward the bank's capital allocation
--   appraisal_value — the bank finances off the LOWER of contract price
--     and appraisal, so a gap here shows up as missing equity

alter table cases add column if not exists selling_existing text;
alter table cases add column if not exists oldest_age integer;
alter table cases add column if not exists has_zakaut text;
alter table cases add column if not exists appraisal_value numeric;

-- Rebuild the advisor view with the new columns. DROP + CREATE rather than
-- CREATE OR REPLACE, per the 0012 lesson.
drop view if exists advisor_cases;
create view advisor_cases
  with (security_invoker = true) as
select
  c.id, c.status, c.complex, c.request_type, c.goal,
  c.property_source, c.property_legal, c.property_value, c.mortgage_amount, c.equity,
  c.selling_existing, c.oldest_age, c.has_zakaut, c.appraisal_value,
  c.comfort_payment, c.max_stress_payment,
  c.future_release, c.future_release_amount, c.future_release_timing, c.upcoming_event, c.income_change,
  c.has_second_applicant, c.employment1, c.seniority1, c.employment2, c.seniority2, c.income, c.extra,
  c.other_loans, c.other_loans_payment, c.other_loans_ending_soon, c.other_loans_months_left, c.credit_issues,
  c.doc_confirmed, c.doc_source, c.doc_balance, c.doc_rate, c.doc_years, c.doc_months,
  c.doc_quote_valid_date, c.doc_total_principal, c.doc_total_early_repayment_fee, c.doc_total_payoff,
  c.doc_account_comparison_rate, c.doc_account_forecast_rate,
  c.completion_note, c.completed_by,
  c.clean_doc_name, c.clean_doc_type,
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
