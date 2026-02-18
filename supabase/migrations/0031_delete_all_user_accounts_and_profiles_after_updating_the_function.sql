DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM auth.users
    LOOP
        -- Call the delete_user_and_profile function for each user
        PERFORM public.delete_user_and_profile(user_record.id);
    END LOOP;
END;
$$;