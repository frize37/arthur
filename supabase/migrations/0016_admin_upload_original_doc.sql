-- The admin needs to attach the original payoff statement by hand too —
-- not every client uploads one through the wizard (manual-entry cases),
-- but the client might still send it separately (email, WhatsApp) and the
-- admin needs a way to get it into the case. The storage write policy from
-- 0015 already allows this (no folder restriction), but the column-level
-- grant only covered clean_doc_name/clean_doc_type — original_doc_name/
-- original_doc_type were only ever written by the service-role parse route.

grant update (original_doc_name, original_doc_type) on cases to authenticated;
