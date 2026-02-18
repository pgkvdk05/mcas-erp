-- Recreate policies for 'marks' table to enforce role-based access

-- Existing: Students can view their own marks
-- CREATE POLICY "Students can view their own marks" ON marks FOR SELECT USING (auth.uid() = student_id);
-- This policy is already good.

-- Revoke existing broad policies for INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Teachers/Admins can insert marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers/Admins can update marks" ON public.marks;
DROP POLICY IF EXISTS "Teachers/Admins can delete marks" ON public.marks;

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can insert marks
CREATE POLICY "Teachers, Admins, SuperAdmins can insert marks" ON public.marks
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can update marks
CREATE POLICY "Teachers, Admins, SuperAdmins can update marks" ON public.marks
FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can delete marks
CREATE POLICY "Teachers, Admins, SuperAdmins can delete marks" ON public.marks
FOR DELETE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);