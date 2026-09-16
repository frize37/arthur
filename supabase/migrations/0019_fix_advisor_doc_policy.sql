-- The advisor read policy from 0015 compared storage.filename(name) to the
-- case id. Every other document policy in this project only needed
-- storage.foldername() (well-documented, definitely available) — this was
-- the one spot relying on storage.filename(), which isn't a function this
-- checked carefully, and downloads for advisors were failing exactly here
-- (admin downloads, which don't use it, worked fine). Rewritten to match
-- the full object path directly instead of depending on that function at
-- all — simpler and removes the uncertainty for good.

drop policy if exists "advisors read clean case docs for assigned cases" on storage.objects;
create policy "advisors read clean case docs for assigned cases" on storage.objects for select
using (
  bucket_id = 'case-documents'
  and exists (
    select 1 from case_advisors ca
    join advisors adv on adv.id = ca.advisor_id
    where adv.auth_user_id = auth.uid()
      and name = 'clean/' || ca.case_id::text
  )
);
