import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/useSession';

export interface ChatMessage {
  id: string;
  sender_id: string;
  message_text: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    username: string;
  } | null;
}

export const useChatMessages = (departmentId: string | null) => {
  const { user } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!departmentId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .select(`id, sender_id, message_text, created_at, profiles!chats_sender_id_fkey (first_name, last_name, username)`)
      .eq('department_id', departmentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to load chat messages.');
      setMessages([]);
    } else {
      setMessages((data ?? []).map((msg: any) => ({
        ...msg,
        profiles: msg.profiles as { first_name: string; last_name: string; username: string } | null,
      })));
    }
    setLoading(false);
  }, [departmentId]);

  useEffect(() => {
    fetchMessages();
    if (departmentId) {
      const channel = supabase
        .channel(`dept_chat_${departmentId}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chats', filter: `department_id=eq.${departmentId}` },
          (payload) => {
            supabase.from('profiles').select('first_name, last_name, username')
              .eq('id', payload.new.sender_id).single()
              .then(({ data: profileData }) => {
                setMessages(prev => [...prev, { ...payload.new, profiles: profileData ?? null } as ChatMessage]);
              });
          }
        ).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [departmentId, fetchMessages]);

  const sendMessage = useCallback(async (text: string, deptId: string) => {
    if (!user || !deptId || !text.trim()) return;
    setSending(true);
    const { error } = await supabase.from('chats').insert({
      department_id: deptId,
      sender_id: user.id,
      message_text: text.trim(),
    });
    if (error) { toast.error('Failed to send message.'); console.error(error); }
    setSending(false);
  }, [user]);

  return { messages, loading, sending, sendMessage, refreshMessages: fetchMessages };
};