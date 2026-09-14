-- Arthur: initial schema for advisors, cases, and offers.
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> paste -> Run).

create extension if not exists "pgcrypto";

create table if not exists advisors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  rating numeric(2,1) not null default 5.0,
  cases_won integer not null default 0,
  avg_response_hours numeric not null default 24,
  created_at timestamptz not null default now()
);

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'verifying', -- verifying | awaiting | ready | sent | closed
  complex boolean not null default false,

  request_type text,
  goal text,

  property_source text,
  property_legal text,
  property_value numeric,
  mortgage_amount numeric,
  equity numeric,

  comfort_payment numeric,
  max_stress_payment numeric,

  future_release text,
  future_release_amount numeric,
  future_release_timing text,
  upcoming_event text,
  income_change text,

  has_second_applicant text,
  employment1 text,
  seniority1 text,
  employment2 text,
  seniority2 text,
  income numeric,
  extra numeric,

  other_loans text,
  other_loans_payment numeric,
  credit_issues text,

  doc_confirmed boolean not null default false,
  doc_skipped boolean not null default false,
  doc_balance numeric,
  doc_rate numeric,
  doc_years integer,
  doc_months integer,

  contact_name text,
  contact_phone text,
  contact_email text,
  contact_time text,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  advisor_id uuid not null references advisors(id) on delete cascade,
  savings numeric,
  fee numeric,
  notes text,
  is_winner boolean not null default false,
  submitted_at timestamptz not null default now()
);

-- Base table grants: without these, anon/authenticated get "permission denied"
-- regardless of RLS policies below (RLS only restricts rows, it doesn't grant access).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on advisors, cases, offers to anon, authenticated;

-- Row Level Security: on, but temporarily permissive until real auth (advisor/admin login) exists.
-- TODO: once auth is wired up, replace these with policies scoped to auth.uid() / role claims.
alter table advisors enable row level security;
alter table cases enable row level security;
alter table offers enable row level security;

drop policy if exists "temp_allow_all_advisors" on advisors;
create policy "temp_allow_all_advisors" on advisors for all using (true) with check (true);

drop policy if exists "temp_allow_all_cases" on cases;
create policy "temp_allow_all_cases" on cases for all using (true) with check (true);

drop policy if exists "temp_allow_all_offers" on offers;
create policy "temp_allow_all_offers" on offers for all using (true) with check (true);

-- Seed the four advisors from the prototype so the dashboards have real data to show.
insert into advisors (name, specialty, rating, cases_won, avg_response_hours)
values
  ('רותם כהן', 'מיחזור ואיחוד הלוואות', 4.9, 18, 3),
  ('אבי לוגסי', 'מסלולים משתנים ותמהיל ריבית', 4.8, 14, 5),
  ('מאיה שגיא', 'עצמאים ותיקים מורכבים', 4.7, 11, 6),
  ('דניאל אשכנזי', 'לקוחות חדשים ורכישת דירה ראשונה', 4.6, 9, 8)
on conflict do nothing;
