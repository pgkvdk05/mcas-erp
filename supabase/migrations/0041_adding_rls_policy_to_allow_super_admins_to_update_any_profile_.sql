CREATE POLICY "SuperAdmins can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'SUPER_ADMIN'));