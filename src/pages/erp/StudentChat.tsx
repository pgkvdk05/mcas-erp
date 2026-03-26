"use client";
import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useSession } from '@/components/auth/useSession';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

const StudentChat: React.FC = () => {
  const { user } = useSession();
  const [deptId, setDeptId] = useState<string | null>(null);
  const [deptName, setDeptName] = useState<string>('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { messages, loading: loadingMessages, sending, sendMessage } = useChatMessages(deptId);
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-load student's department from profile
  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('profiles')
      .select('department_id, departments(name)')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.department_id) {
          setDeptId(data.department_id);
          setDeptName((data as any).departments?.name ?? '');
        }
        setLoadingProfile(false);
      });
  }, [user?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessageText.trim() && deptId) {
      await sendMessage(newMessageText, deptId);
      setNewMessageText('');
    }
  };

  const getSenderName = (msg: any) => {
    if (msg.sender_id === user?.id) return 'You';
    return msg.profiles?.first_name ? `${msg.profiles.first_name} ${msg.profiles.last_name || ''}`.trim() : msg.profiles?.username || 'Unknown';
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title="Department Chat" description="Chat with your classmates and teachers." />
        <Card className="max-w-3xl mx-auto h-[600px] flex flex-col shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">
              {deptName ? `${deptName} Chat` : 'Department Chat'}
            </CardTitle>
            <CardDescription>
              {deptName
                ? `You are chatting in the ${deptName} department channel.`
                : 'Your department chat will load automatically.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 pt-0">
            <ScrollArea className="flex-grow pr-4 mb-4 border rounded-md p-4 bg-background shadow-inner">
              <div className="space-y-4">
                {loadingProfile || loadingMessages ? (
                  <div className="text-center text-muted-foreground py-4">Loading messages...</div>
                ) : !deptId ? (
                  <div className="text-center text-muted-foreground py-4">
                    Your profile doesn't have a department assigned. Please contact your admin.
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No messages yet. Be the first to say something!</div>
                ) : messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-3 ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                    {msg.sender_id !== user?.id && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getSenderName(msg)}`} />
                        <AvatarFallback>{getSenderName(msg).substring(0, 2)}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`flex flex-col max-w-[70%] p-3 rounded-lg shadow-sm ${msg.sender_id === user?.id ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                      <div className="font-semibold text-sm">{getSenderName(msg)}</div>
                      <p className="text-sm break-words">{msg.message_text}</p>
                      <span className="text-xs opacity-70 self-end mt-1">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {msg.sender_id === user?.id && (
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=You`} />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                placeholder={deptId ? 'Type your message...' : 'No department assigned'}
                value={newMessageText}
                onChange={e => setNewMessageText(e.target.value)}
                className="flex-grow h-10"
                disabled={!deptId || sending}
              />
              <Button type="submit" size="icon" disabled={!deptId || sending || !newMessageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StudentChat;