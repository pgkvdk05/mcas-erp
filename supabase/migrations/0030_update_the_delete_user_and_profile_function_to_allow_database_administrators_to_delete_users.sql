CREATE OR REPLACE FUNCTION public.delete_user_and_profile(user_id_to_delete uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  caller_app_role TEXT;
  current_db_user TEXT;
BEGIN
  -- Get the current database user
  SELECT current_user INTO current_db_user;

  -- Attempt to get the application role from profiles table if a JWT session is active
  -- This might be NULL if no JWT session is active or user_id_to_delete is not in profiles
  SELECT role INTO caller_app_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Check if the current database user is 'postgres' (or another admin user)
  -- OR if the application role of the *caller* is 'SUPER_ADMIN'
  IF current_db_user = 'postgres' OR caller_app_role = 'SUPER_ADMIN' THEN
    -- Delete from auth.users, which should cascade to public.profiles
    DELETE FROM auth.users WHERE id = user_id_to_delete;
  ELSE
    RAISE EXCEPTION 'Permission denied: Only SUPER_ADMINs or database administrators can delete users.';
  END IF;
END;
$function$;