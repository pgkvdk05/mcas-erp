-- Recreate policies for 'od_requests' table to enforce role-based access

-- Existing: Students can view their own OD requests
-- CREATE POLICY "Students can view their own OD requests" ON od_requests FOR SELECT USING (auth.uid() = student_id);
-- This policy is already good.

-- Existing: Students can insert their own OD requests
-- CREATE POLICY "Students can insert their own OD requests" ON od_requests FOR INSERT WITH CHECK (auth.uid() = student_id);
-- This policy is already good.

-- Existing: Students can delete their own pending OD requests
-- CREATE POLICY "Students can delete their own pending OD requests" ON od_requests FOR DELETE USING ((auth.uid() = student_id) AND (status = 'Pending'::text));
-- This policy is already good.

-- Revoke existing broad policy for UPDATE
DROP POLICY IF EXISTS "Teachers/Admins can update OD requests" ON public.od_requests;

-- New: Only TEACHER, ADMIN, and SUPER_ADMIN can update OD requests
CREATE POLICY "Teachers, Admins, SuperAdmins can update OD requests" ON public.od_requests
FOR UPDATE TO authenticated USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('TEACHER', 'ADMIN', 'SUPER_ADMIN'))
);