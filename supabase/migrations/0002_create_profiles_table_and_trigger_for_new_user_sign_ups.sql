-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  username TEXT UNIQUE,
  email TEXT UNIQUE,
  role TEXT, -- e.g., 'SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT'
  employee_id TEXT UNIQUE, -- For ADMIN/TEACHER
  roll_number TEXT UNIQUE, -- For STUDENT
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL, -- Link to departments table
  year TEXT, -- For STUDENT (e.g., '1st Year', '2nd Year')
  designation TEXT, -- For TEACHER
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON public.profiles
FOR DELETE TO authenticated USING (auth.uid() = id);

-- Function to insert profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, role, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'username',
    new.raw_user_meta_data ->> 'role',
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name'
  );
  RETURN new;
END;
$$;

-- Trigger the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();