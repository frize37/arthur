-- Case chat privacy: while several advisors are still competing on a
-- case, each of them should see admin's messages (broadcast to
-- everyone assigned) and their own messages, but never another
-- advisor's messages — they're competitors. Once a winner is chosen,
-- only that advisor keeps seeing (and sending) admin messages; the
-- others lose access to the ongoing conversation, though they keep
-- their own past messages for their own record.

drop policy if exists "advisors read messages on assigned cases" on case_messages;
create policy "advisors read relevant messages" on case_messages for select
  using (
    exists (
      select 1 from advisors a
      where a.auth_user_id = auth.uid()
      and (
        -- always see your own messages
        case_messages.sender_advisor = a.id
        or (
          -- admin's messages, only while you're still relevant to the case
          case_messages.sender_kind = 'admin'
          and exists (select 1 from case_advisors ca where ca.case_id = case_messages.case_id and ca.advisor_id = a.id)
          and (
            not exists (select 1 from offers o where o.case_id = case_messages.case_id and o.is_winner)
            or exists (select 1 from offers o where o.case_id = case_messages.case_id and o.is_winner and o.advisor_id = a.id)
          )
        )
      )
    )
  );

drop policy if exists "advisors insert their own messages on assigned cases" on case_messages;
create policy "advisors insert messages while relevant" on case_messages for insert
  with check (
    sender_kind = 'advisor'
    and sender_advisor = (select id from advisors where auth_user_id = auth.uid())
    and exists (
      select 1 from case_advisors ca
      where ca.case_id = case_messages.case_id and ca.advisor_id = sender_advisor
    )
    and (
      not exists (select 1 from offers o where o.case_id = case_messages.case_id and o.is_winner)
      or exists (select 1 from offers o where o.case_id = case_messages.case_id and o.is_winner and o.advisor_id = sender_advisor)
    )
  );
