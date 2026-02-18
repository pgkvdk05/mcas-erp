-- Create marks table
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  marks INTEGER NOT NULL,
  grade TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, course_id) -- Ensure unique marks per student per course
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for marks table to ensure idempotency
DROP POLICY IF EXISTS "Students can view their own marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers/Admins can insert marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers/Admins can update marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers/Admins can delete marks" ON public.marks;

-- Recreate policies for marks table
CREATE POLICY "Students can view their own marks" ON public.marks
FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- WARNING: This policy allows any authenticated user to insert/update marks.
-- In a production app, restrict this to TEACHER/ADMIN roles based on class assignments.
CREATE POLICY "Teachers/Admins can insert marks" ON public.marks
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Teachers/Admins can update marks" ON public.marks
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Teachers/Admins can delete marks" ON public.marks
FOR DELETE TO authenticated USING (true);