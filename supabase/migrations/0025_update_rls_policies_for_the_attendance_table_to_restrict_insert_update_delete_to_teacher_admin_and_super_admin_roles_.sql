-- Recreate policies for 'attendance' table to enforce role-based access

-- Existing: Students can view their own attendance
-- CREATE POLICY "Students can view their own attendance" ON attendance FOR SELECT USING (auth.uid() = student_id);
-- This policy is already good.

-- Revoke existing broad policies for INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Teachers/Admins can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers/Admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers/Admins can delete attendance" ON public.attendance;

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can insert attendance
CREATE POLICY "Teachers, Admins, SuperAdmins can insert attendance" ON public.attendance
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can update attendance
CREATE POLICY "Teachers, Admins, SuperAdmins can update attendance" ON public.attendance
FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can delete attendance
CREATE POLICY "Teachers, Admins, SuperAdmins can delete attendance" ON public.attendance
FOR DELETE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);