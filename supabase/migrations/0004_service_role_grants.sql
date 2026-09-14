-- Fix: tables created by hand in the SQL Editor don't automatically get
-- Supabase's usual grants for the service_role (the role our server-side
-- "secret key" client connects as). Without this, even privileged
-- server-side scripts get "permission denied", the same class of bug we
-- hit earlier with anon/authenticated on the first migration.

grant usage on schema public to service_role;
grant select, insert, update, delete on advisors, cases, offers, admins, case_advisors to service_role;
