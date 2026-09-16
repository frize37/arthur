-- Original payoff-statement document (attached automatically when the
-- wizard parses it) plus a "clean" replacement the admin uploads by hand
-- after manually redacting personal details from the original — this
-- replaces the earlier automated-redaction attempt, which turned out to
-- leave the underlying PDF text layer intact (see /api/redact-mortgage-
-- document, kept but unused). The admin is the one who verifies the
-- clean copy is actually clean before advisors ever see it.

alter table cases add column if not exists original_doc_name text;
alter table cases add column if not exists original_doc_type text;
alter table cases add column if not exists clean_doc_name text;
alter table cases add column if not exists clean_doc_type text;

grant update (clean_doc_name, clean_doc_type) on cases to authenticated;

insert into storage.buckets (id, name, public)
values ('case-documents', 'case-documents', false)
on conflict (id) do nothing;

-- Object keys are `original/<caseId>` and `clean/<caseId>` — no file
-- extension in the key, so RLS can match the case id with a plain
-- equality check on storage.filename(name) instead of stripping one.

drop policy if exists "admins read original case docs" on storage.objects;
create policy "admins read original case docs" on storage.objects for select
using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1] = 'original'
  and exists (select 1 from admins where admins.auth_user_id = auth.uid())
);

drop policy if exists "admins read clean case docs" on storage.objects;
create policy "admins read clean case docs" on storage.objects for select
using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1] = 'clean'
  and exists (select 1 from admins where admins.auth_user_id = auth.uid())
);

drop policy if exists "advisors read clean case docs for assigned cases" on storage.objects;
create policy "advisors read clean case docs for assigned cases" on storage.objects for select
using (
  bucket_id = 'case-documents'
  and (storage.foldername(name))[1] = 'clean'
  and exists (
    select 1 from case_advisors ca
    join advisors adv on adv.id = ca.advisor_id
    where adv.auth_user_id = auth.uid()
      and ca.case_id::text = storage.filename(name)
  )
);

-- Only admins write case documents. The ORIGINAL is written server-side
-- via the service-role client from the parse route (bypasses RLS
-- entirely), so this only needs to cover the admin uploading the CLEAN
-- replacement through the browser.
drop policy if exists "admins write case docs" on storage.objects;
create policy "admins write case docs" on storage.objects for insert
with check (bucket_id = 'case-documents' and exists (select 1 from admins where admins.auth_user_id = auth.uid()));

drop policy if exists "admins update case docs" on storage.objects;
create policy "admins update case docs" on storage.objects for update
using (bucket_id = 'case-documents' and exists (select 1 from admins where admins.auth_user_id = auth.uid()))
with check (bucket_id = 'case-documents' and exists (select 1 from admins where admins.auth_user_id = auth.uid()));

drop policy if exists "admins delete case docs" on storage.objects;
create policy "admins delete case docs" on storage.objects for delete
using (bucket_id = 'case-documents' and exists (select 1 from admins where admins.auth_user_id = auth.uid()));

-- Expose the new columns to both dashboards. Using DROP + CREATE (not
-- REPLACE) throughout, per the 0012 lesson: REPLACE can only append
-- columns at the very end, and any mistake there rolls back the whole
-- migration silently.

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
