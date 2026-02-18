-- Create chats table
CREATE TABLE public.chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Policies
-- Authenticated users can read all chat messages (for simplicity, can be refined later to only show messages for courses they are part of)
CREATE POLICY "Authenticated users can read chats" ON public.chats
FOR SELECT TO authenticated
USING (true);

-- Authenticated users can insert chat messages, ensuring they are the sender
CREATE POLICY "Authenticated users can insert chats" ON public.chats
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = sender_id);