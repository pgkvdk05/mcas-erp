CREATE POLICY "Allow admin and teachers to view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM public.profiles
    WHERE role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER')
  )
);