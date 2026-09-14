-- Wizard now asks whether an existing loan is ending soon, since a loan
-- ending within ~18 months is excluded from the new-mortgage affordability
-- check.

alter table cases add column if not exists other_loans_ending_soon text;
alter table cases add column if not exists other_loans_months_left text;
