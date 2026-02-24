-- Make department uniqueness case-insensitive.
-- WARNING: Review and backup your data before running in production.

-- Drop existing UNIQUE constraints if they exist (created by earlier migrations)
ALTER TABLE IF EXISTS public.departments
  DROP CONSTRAINT IF EXISTS departments_name_key,
  DROP CONSTRAINT IF EXISTS departments_code_key;

-- Create functional unique indexes for case-insensitive uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_name_lower
  ON public.departments (LOWER(name));

CREATE UNIQUE INDEX IF NOT EXISTS idx_departments_code_upper
  ON public.departments (UPPER(code));

-- Note: If you prefer the citext extension instead, consider converting the
-- columns to citext and re-creating UNIQUE constraints.
