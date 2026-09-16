-- 0020 tried to fix the name-shadowing bug by writing storage.objects.name
-- explicitly, but that still didn't take hold (or didn't actually resolve
-- it — schema-qualifying a table's own name inside its own policy can run
-- into its own edge cases). Sidestepping the whole issue instead: push the
-- advisors lookup into its own subquery scope (IN (select ...)) so
-- advisors.name is never visible in the same scope as the bare `name`
-- reference — there is then only one `name` in scope at all, no ambiguity
-- possible regardless of aliasing/qualification subtleties.

drop policy if exists "advisors read clean case docs for assigned cases" on storage.objects;
create policy "advisors read clean case docs for assigned cases" on storage.objects for select
using (
  bucket_id = 'case-documents'
  and exists (
    select 1 from case_advisors ca
    where ca.advisor_id in (select id from advisors where auth_user_id = auth.uid())
      and name = 'clean/' || ca.case_id::text
  )
);
