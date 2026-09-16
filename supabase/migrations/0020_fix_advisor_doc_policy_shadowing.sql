-- 0019's policy compared `name` (meant to be storage.objects.name, the
-- object's path) to 'clean/' || ca.case_id::text — but the subquery also
-- joins `advisors`, which has its own `name` column (the advisor's display
-- name, e.g. "דוד"). Postgres resolves an unqualified column to the nearest
-- enclosing scope, so `name` inside that subquery bound to advisors.name,
-- not storage.objects.name — silently comparing "דוד" to "clean/<uuid>",
-- which is never true. Verified directly (signed in as the test advisor via
-- the Auth admin API) that this made every download return "Object not
-- found" even though the row-level checks all passed on their own.

drop policy if exists "advisors read clean case docs for assigned cases" on storage.objects;
create policy "advisors read clean case docs for assigned cases" on storage.objects for select
using (
  bucket_id = 'case-documents'
  and exists (
    select 1 from case_advisors ca
    join advisors adv on adv.id = ca.advisor_id
    where adv.auth_user_id = auth.uid()
      and storage.objects.name = 'clean/' || ca.case_id::text
  )
);
