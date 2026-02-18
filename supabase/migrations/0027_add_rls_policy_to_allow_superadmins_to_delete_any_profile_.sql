CREATE POLICY "SuperAdmins can delete any profile" ON public.profiles
FOR DELETE TO authenticated
USING (auth.uid() IN ( SELECT profiles.id FROM profiles WHERE (profiles.role = 'SUPER_ADMIN'::text)));