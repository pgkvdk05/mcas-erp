-- Create fees table
CREATE TABLE IF NOT EXISTS public.fees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  fee_type TEXT NOT NULL, -- e.g., 'Tuition Fee', 'Exam Fee', 'Library Fee'
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL, -- 'Paid', 'Outstanding'
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Policies for fees table
DROP POLICY IF EXISTS "Students can view their own fees" ON public.fees;
CREATE POLICY "Students can view their own fees" ON public.fees
FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Admins can insert fees" ON public.fees;
CREATE POLICY "Admins can insert fees" ON public.fees
FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update fees" ON public.fees;
CREATE POLICY "Admins can update fees" ON public.fees
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can delete fees" ON public.fees;
CREATE POLICY "Admins can delete fees" ON public.fees
FOR DELETE TO authenticated USING (true);