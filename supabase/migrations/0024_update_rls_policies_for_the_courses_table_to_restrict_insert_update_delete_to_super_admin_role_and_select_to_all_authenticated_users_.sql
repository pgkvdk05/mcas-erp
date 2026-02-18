-- Recreate policies for 'courses' table to enforce role-based access

-- Revoke existing broad policies
DROP POLICY IF EXISTS "All authenticated users can view courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can insert courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can update courses" ON public.courses;
DROP POLICY IF EXISTS "Authenticated users can delete courses" ON public.courses;

-- New: All authenticated users can view courses (for dropdowns, etc.)
CREATE POLICY "Authenticated users can view courses" ON public.courses
FOR SELECT TO authenticated USING (true);

-- New: Only SUPER_ADMIN can insert courses
CREATE POLICY "SuperAdmins can insert courses" ON public.courses
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
);

-- New: Only SUPER_ADMIN can update courses
CREATE POLICY "SuperAdmins can update courses" ON public.courses
FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
);

-- New: Only SUPER_ADMIN can delete courses
CREATE POLICY "SuperAdmins can delete courses" ON public.courses
FOR DELETE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
);