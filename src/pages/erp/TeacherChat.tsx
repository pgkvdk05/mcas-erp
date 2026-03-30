"use client";
import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useSession } from '@/components/auth/useSession';
import { useDepartments } from '@/hooks/useDepartments';
import PageHeader from '@/components/layout/PageHeader';

const TeacherChat: React.FC = () => {
  const { user } = useSession();
  const { departments, loading: loadingDepts } = useDepartments();
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const { messages, loading: loadingMessages, sending, sendMessage } = useChatMessages(selectedDeptId);
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessageText.trim() && selectedDeptId) {
      await sendMessage(newMessageText, selectedDeptId);
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
        <PageHeader title="Department Chat" description="Communicate with your students in real-time." />
        <Card className="max-w-3xl mx-auto shadow-lg rounded-lg" style={{height: "calc(100vh - 200px)", display: "flex", flexDirection: "column"}}>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">Department Discussion</CardTitle>
            <CardDescription>Select a department to chat with students.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col p-4 pt-0" style={{flex: 1, minHeight: 0}}>
            <div className="mb-4 p-3 border rounded-md bg-muted/50">
              <Label htmlFor="dept-select">Select Department</Label>
              <Select onValueChange={setSelectedDeptId} value={selectedDeptId || ''} disabled={loadingDepts}>
                <SelectTrigger id="dept-select" className="mt-1">
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div ref={scrollContainerRef} style={{flex: 1, overflowY: "auto", minHeight: 0}} className="pr-4 mb-4 border rounded-md p-4 bg-background shadow-inner">
              <div className="space-y-4">
                {!selectedDeptId ? (
                  <div className="text-center text-muted-foreground py-4">Select a department to view messages.</div>
                ) : loadingMessages ? (
                  <div className="text-center text-muted-foreground py-4">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No messages yet. Start the conversation!</div>
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
            </div>
            <form onSubmit={handleSend} className="flex gap-2">
              <Input placeholder={selectedDeptId ? 'Type your message...' : 'Select a department first'}
                value={newMessageText} onChange={e => setNewMessageText(e.target.value)}
                className="flex-grow h-10" disabled={!selectedDeptId || sending} />
              <Button type="submit" size="icon" disabled={!selectedDeptId || sending || !newMessageText.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default TeacherChat;