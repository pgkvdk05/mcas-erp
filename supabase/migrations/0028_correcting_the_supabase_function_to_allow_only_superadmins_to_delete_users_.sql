CREATE OR REPLACE FUNCTION public.delete_user_and_profile(user_id_to_delete UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Get the role of the user currently calling this function
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Check if the caller is a SUPER_ADMIN
  IF caller_role = 'SUPER_ADMIN' THEN
    -- Delete from auth.users, which should cascade to public.profiles
    DELETE FROM auth.users WHERE id = user_id_to_delete;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only SUPER_ADMINs can delete users.';
  END IF;
END;
$$;

-- Grant execution privileges to authenticated users.
-- The function itself now contains the logic to restrict execution to SUPER_ADMINs.
GRANT EXECUTE ON FUNCTION public.delete_user_and_profile(UUID) TO authenticated;