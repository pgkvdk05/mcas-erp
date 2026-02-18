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

-- Policies for courses table
DROP POLICY IF EXISTS "All authenticated users can view courses" ON public.courses;
CREATE POLICY "All authenticated users can view courses" ON public.courses
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert courses" ON public.courses;
CREATE POLICY "Authenticated users can insert courses" ON public.courses
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update courses" ON public.courses;
CREATE POLICY "Authenticated users can update courses" ON public.courses
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete courses" ON public.courses;
CREATE POLICY "Authenticated users can delete courses" ON public.courses
FOR DELETE TO authenticated USING (true);