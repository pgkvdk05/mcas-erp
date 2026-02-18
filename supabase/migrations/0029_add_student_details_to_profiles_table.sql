ALTER TABLE profiles
ADD COLUMN address TEXT,
ADD COLUMN tenth_school_name TEXT,
ADD COLUMN tenth_mark_score INTEGER,
ADD COLUMN twelfth_school_name TEXT,
ADD COLUMN twelfth_mark_score INTEGER;

-- Optional: Add RLS policies for these new columns if needed,
-- but existing policies for 'profiles' should generally cover them.
-- For example, students can update their own profile, and admins can view/update.