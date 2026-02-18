-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'Present', 'Absent'
  reason TEXT, -- Reason for absence
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (student_id, course_id, date) -- Ensure unique attendance per student per course per day
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for attendance table to ensure idempotency
DROP POLICY IF EXISTS "Students can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers/Admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers/Admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers/Admins can delete attendance" ON public.attendance;

-- Recreate policies for attendance table
CREATE POLICY "Students can view their own attendance" ON public.attendance
FOR SELECT TO authenticated USING (auth.uid() = student_id);

-- WARNING: This policy allows any authenticated user to insert/update attendance.
-- In a production app, restrict this to TEACHER/ADMIN roles based on class assignments.
CREATE POLICY "Teachers/Admins can insert attendance" ON public.attendance
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Teachers/Admins can update attendance" ON public.attendance
FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Teachers/Admins can delete attendance" ON public.attendance
FOR DELETE TO authenticated USING (true);