"use client";

import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useCourses } from '@/hooks/useCourses';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useSession } from '@/components/auth/SessionContextProvider';
import PageHeader from '@/components/layout/PageHeader';

const StudentChat: React.FC = () => {
  const { user, userRole } = useSession();
  const { courses, loading: loadingCourses } = useCourses();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const { messages, loading: loadingMessages, sending, sendMessage } = useChatMessages(selectedCourseId);
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessageText.trim() && selectedCourseId) {
      await sendMessage(newMessageText);
      setNewMessageText('');
    }
  };

  const getSenderName = (message: any) => {
    if (message.sender_id === user?.id) {
      return 'You';
    }
    return message.profiles?.first_name || message.profiles?.username || 'Classmate';
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        <PageHeader
          title="Class Chat"
          description="Communicate with your teachers and classmates."
        />
        <Card className="max-w-3xl mx-auto h-[600px] flex flex-col shadow-lg rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold">General Class Discussion</CardTitle>
            <CardDescription className="text-muted-foreground">Communicate with your teachers and classmates.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-4 pt-0">
            <div className="mb-4 p-3 border rounded-md bg-muted/50">
              <Label htmlFor="course-select" className="text-sm font-medium">Select Course</Label>
              <Select onValueChange={setSelectedCourseId} value={selectedCourseId || ''} disabled={loadingCourses}>
                <SelectTrigger id="course-select" className="mt-1">
                  <SelectValue placeholder="Select a Course to chat in" />
                </SelectTrigger>
                <SelectContent>
                  {loadingCourses ? (
                    <SelectItem value="loading" disabled>Loading Courses...</SelectItem>
                  ) : (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="flex-grow pr-4 mb-4 border rounded-md p-4 bg-background shadow-inner">
              <div className="space-y-4">
                {loadingMessages ? (
                  <div className="text-center text-muted-foreground py-4">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${
                        msg.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.sender_id !== user?.id && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getSenderName(msg)}`} />
                          <AvatarFallback>{getSenderName(msg).substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`flex flex-col max-w-[70%] p-3 rounded-lg shadow-sm ${
                          msg.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none'
                        }`}
                      >
                        <div className="font-semibold text-sm">{getSenderName(msg)}</div>
                        <p className="text-sm break-words">{msg.message_text}</p>
                        <span className="text-xs text-muted-foreground self-end mt-1">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.sender_id === user?.id && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${getSenderName(msg)}`} />
                          <AvatarFallback>{getSenderName(msg).substring(0, 2)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-grow h-10"
                disabled={!selectedCourseId || sending}
              />
              <Button type="submit" size="icon" disabled={!selectedCourseId || sending}>
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