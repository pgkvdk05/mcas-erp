-- Create departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for departments table to ensure idempotency
DROP POLICY IF EXISTS "All authenticated users can view departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can update departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can delete departments" ON public.departments;

-- Recreate policies for departments table
CREATE POLICY "All authenticated users can view departments" ON public.departments
FOR SELECT TO authenticated USING (true);

-- WARNING: These policies allow any authenticated user to manage departments.
-- In a production app, restrict these to specific roles (e.g., SUPER_ADMIN).
CREATE POLICY "Authenticated users can insert departments" ON public.departments
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update departments" ON public.departments
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete departments" ON public.departments
FOR DELETE TO authenticated USING (true);