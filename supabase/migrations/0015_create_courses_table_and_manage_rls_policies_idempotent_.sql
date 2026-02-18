-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  credits INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for courses table to ensure idempotency
DROP POLICY IF EXISTS "All authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can delete courses" ON public.courses;

-- Recreate policies for courses table
CREATE POLICY "All authenticated users can view courses" ON public.courses
FOR SELECT TO authenticated USING (true);

-- WARNING: These policies allow any authenticated user to manage courses.
-- In a production app, restrict these to specific roles (e.g., SUPER_ADMIN).
CREATE POLICY "Authenticated users can insert courses" ON public.courses
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update courses" ON public.courses
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete courses" ON public.courses
FOR DELETE TO authenticated USING (true);