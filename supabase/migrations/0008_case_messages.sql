-- Internal chat between admin and the advisors assigned to a case.

create table if not exists case_messages (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases(id) on delete cascade,
  sender_kind text not null check (sender_kind in ('admin', 'advisor')),
  sender_admin uuid references admins(auth_user_id),
  sender_advisor uuid references advisors(id),
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

grant usage on schema public to authenticated;
grant select, insert on case_messages to authenticated;
alter table case_messages enable row level security;

create policy "admins manage case messages" on case_messages for all
  using (exists (select 1 from admins where admins.auth_user_id = auth.uid()))
  with check (exists (select 1 from admins where admins.auth_user_id = auth.uid()));

create policy "advisors read messages on assigned cases" on case_messages for select
  using (exists (
    select 1 from case_advisors ca join advisors a on a.id = ca.advisor_id
    where ca.case_id = case_messages.case_id and a.auth_user_id = auth.uid()
  ));

create policy "advisors insert their own messages on assigned cases" on case_messages for insert
  with check (
    sender_kind = 'advisor'
    and sender_advisor = (select id from advisors where auth_user_id = auth.uid())
    and exists (
      select 1 from case_advisors ca
      where ca.case_id = case_messages.case_id and ca.advisor_id = sender_advisor
    )
  );
