-- Add restaurant as a supported program category.
-- The production database already contains the category; this migration
-- documents the schema change for future environments.

alter table public.programs
  drop constraint if exists programs_category_check;

alter table public.programs
  add constraint programs_category_check
  check (category in ('termeszet','viz','gyerek','latnivalo','kisvasut','etterem'));
