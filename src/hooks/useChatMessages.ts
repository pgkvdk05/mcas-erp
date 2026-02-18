import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSession } from '@/components/auth/SessionContextProvider';

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

export const useChatMessages = (courseId: string | null) => {
  const { user, loading: sessionLoading } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!courseId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        sender_id,
        message_text,
        created_at,
        profiles (
          first_name,
          last_name,
          username
        )
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to load chat messages.');
      setMessages([]);
    } else {
      const formattedMessages: ChatMessage[] = data.map((msg: any) => ({
        ...msg,
        profiles: msg.profiles as { first_name: string; last_name: string; username: string; } | null,
      }));
      setMessages(formattedMessages);
    }
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    fetchMessages();

    if (courseId) {
      const channel = supabase
        .channel(`chat_room_${courseId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chats',
            filter: `course_id=eq.${courseId}`,
          },
          (payload) => {
            supabase
              .from('profiles')
              .select('first_name, last_name, username')
              .eq('id', payload.new.sender_id)
              .single()
              .then(({ data: profileData, error: profileError }) => {
                if (profileError) {
                  console.error('Error fetching profile for new chat message:', profileError);
                  setMessages((prev) => [
                    ...prev,
                    { ...payload.new, profiles: null } as ChatMessage,
                  ]);
                } else {
                  setMessages((prev) => [
                    ...prev,
                    { ...payload.new, profiles: profileData } as ChatMessage,
                  ]);
                }
              });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [courseId, fetchMessages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!user || !courseId || !text.trim()) {
      toast.error('Cannot send empty message or no user/course selected.');
      return;
    }

    setSending(true);
    const { error } = await supabase.from('chats').insert({
      course_id: courseId,
      sender_id: user.id,
      message_text: text.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message.');
    }
    setSending(false);
  }, [user, courseId]);

  return { messages, loading, sending, sendMessage, refreshMessages: fetchMessages };
};