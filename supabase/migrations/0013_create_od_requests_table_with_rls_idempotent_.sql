-- Create OD requests table
CREATE TABLE IF NOT EXISTS public.od_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  request_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
  supporting_document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.od_requests ENABLE ROW LEVEL SECURITY;

-- Policies for OD requests table
DROP POLICY IF EXISTS "Students can view their own OD requests" ON public.od_requests;
CREATE POLICY "Students can view their own OD requests" ON public.od_requests
FOR SELECT TO authenticated USING (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can insert their own OD requests" ON public.od_requests;
CREATE POLICY "Students can insert their own OD requests" ON public.od_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers/Admins can update OD requests" ON public.od_requests;
CREATE POLICY "Teachers/Admins can update OD requests" ON public.od_requests
FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Students can delete their own pending OD requests" ON public.od_requests;
CREATE POLICY "Students can delete their own pending OD requests" ON public.od_requests
FOR DELETE TO authenticated USING (auth.uid() = student_id AND status = 'Pending');