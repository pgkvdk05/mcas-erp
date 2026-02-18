-- Recreate policies for 'departments' table to enforce role-based access

-- Revoke existing broad policies
DROP POLICY IF EXISTS "All authenticated users can view departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can insert departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can update departments" ON public.departments;
DROP POLICY IF EXISTS "Authenticated users can delete departments" ON public.departments;

-- New: All authenticated users can view departments (for dropdowns, etc.)
CREATE POLICY "Authenticated users can view departments" ON public.departments
FOR SELECT TO authenticated USING (true);

-- New: Only SUPER_ADMIN can insert departments
CREATE POLICY "SuperAdmins can insert departments" ON public.departments
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
);

-- New: Only SUPER_ADMIN can update departments
CREATE POLICY "SuperAdmins can update departments" ON public.departments
FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
);

-- New: Only SUPER_ADMIN can delete departments
CREATE POLICY "SuperAdmins can delete departments" ON public.departments
FOR DELETE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN')
);