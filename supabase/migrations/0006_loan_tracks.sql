-- Real AI-read payoff statements can contain several loan tracks (מסלולים)
-- per mortgage account, each with its own rate type, balance and early-
-- repayment fee. This table holds one row per track; account-level totals
-- (as printed in the bank's own summary section) live directly on `cases`.

create table if not exists case_loan_tracks (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  track_order integer not null default 1,

  bank_name text,
  rate_kind text, -- 'fixed' | 'variable'
  linked_to_cpi boolean,
  repayment_method text,

  annual_rate numeric,
  anchor_rate numeric,
  margin_rate numeric,
  next_rate_change_date date,

  months_remaining integer,
  principal_balance numeric,
  accrued_interest numeric,
  arrears_balance numeric,
  arrears_interest numeric,

  payoff_balance numeric,
  early_repayment_fee numeric,
  comparison_rate numeric,
  forecast_rate numeric,

  created_at timestamptz not null default now()
);

-- Account-level fields, taken directly from the bank's own summary table.
alter table cases add column if not exists doc_quote_valid_date date;
alter table cases add column if not exists doc_total_principal numeric;
alter table cases add column if not exists doc_total_early_repayment_fee numeric;
alter table cases add column if not exists doc_total_payoff numeric;
alter table cases add column if not exists doc_account_comparison_rate numeric;
alter table cases add column if not exists doc_account_forecast_rate numeric;

grant usage on schema public to service_role;
grant select, insert, update, delete on case_loan_tracks to anon, authenticated, service_role;

alter table case_loan_tracks enable row level security;

-- Same shape as `cases`: the public wizard can insert tracks for the case
-- it just created, but can't read anything back; admins see/manage
-- everything; advisors only see tracks for cases assigned to them.
create policy "anyone can submit loan tracks" on case_loan_tracks for insert
  with check (true);
create policy "admins can read all loan tracks" on case_loan_tracks for select
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()));
create policy "admins can manage loan tracks" on case_loan_tracks for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid()));
create policy "advisors read tracks for assigned cases" on case_loan_tracks for select
  using (exists (
    select 1 from case_advisors ca
    join advisors a on a.id = ca.advisor_id
    where ca.case_id = case_loan_tracks.case_id and a.auth_user_id = auth.uid()
  ));
