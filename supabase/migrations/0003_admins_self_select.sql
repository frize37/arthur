-- Fix: the "admins can ..." policies on other tables check
-- `exists (select 1 from admins where auth_user_id = auth.uid())`, but that
-- subquery is itself subject to RLS on `admins` — and admins had RLS enabled
-- with zero policies, so it always returned no rows, silently breaking every
-- admin-only policy. This lets a user look up their own admins row (and
-- nothing else), which is exactly what those checks need.

create policy "users can check their own admin row" on admins for select
  using (auth_user_id = auth.uid());
