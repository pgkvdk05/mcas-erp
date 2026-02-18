-- Recreate policies for 'fees' table to enforce role-based access

-- Existing: Students can view their own fees
-- CREATE POLICY "Students can view their own fees" ON fees FOR SELECT USING (auth.uid() = student_id);
-- This policy is already good.

-- Revoke existing broad policies for INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS "Admins can insert fees" ON public.fees;
DROP POLICY IF EXISTS "Admins can update fees" ON public.fees;
DROP POLICY IF EXISTS "Admins can delete fees" ON public.fees;

-- New: Only ADMIN and SUPER_ADMIN can insert fees
CREATE POLICY "Admins and SuperAdmins can insert fees" ON public.fees
FOR INSERT TO authenticated WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- New: Only ADMIN and SUPER_ADMIN can update fees
CREATE POLICY "Admins and SuperAdmins can update fees" ON public.fees
FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('ADMIN', 'SUPER_ADMIN'))
);

-- New: Only ADMIN and SUPER_ADMIN can delete fees
CREATE POLICY "Admins and SuperAdmins can delete fees" ON public.fees
FOR DELETE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('ADMIN', 'SUPER_ADMIN'))
);