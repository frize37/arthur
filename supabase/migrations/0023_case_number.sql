-- Cases are keyed by UUID, which is right for storage paths and foreign
-- keys but unusable as something a person says out loud on the phone.
-- Adds a short sequential number for display; the UUID stays the key.

create sequence if not exists case_number_seq start with 1000021;

alter table cases add column if not exists case_number bigint;

-- Backfill existing rows one by one (nextval per row, oldest case first)
-- rather than letting a single default fill them all with one value.
update cases set case_number = nextval('case_number_seq') where case_number is null;

alter table cases alter column case_number set default nextval('case_number_seq');
alter table cases alter column case_number set not null;
create unique index if not exists cases_case_number_key on cases (case_number);

-- The wizard inserts as the anonymous role and never supplies case_number,
-- so the default has to be reachable by that role.
grant usage, select on sequence case_number_seq to anon, authenticated;

drop view if exists advisor_cases;
create view advisor_cases
  with (security_invoker = true) as
select
  c.id, c.case_number, c.status, c.complex, c.request_type, c.goal,
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
