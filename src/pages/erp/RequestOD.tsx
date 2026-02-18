"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import PageHeader from '@/components/layout/PageHeader';

const RequestOD: React.FC = () => {
  const { user, loading: sessionLoading } = useSession();
  const [reason, setReason] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSupportingDocument(e.target.files[0]);
    } else {
      setSupportingDocument(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionLoading || !user) {
      toast.error('You must be logged in to submit an OD request.');
      return;
    }
    if (!reason.trim() || !selectedDate) {
      toast.error('Please provide a reason and select a date for your OD request.');
      return;
    }

    setSubmitting(true);
    let documentUrl: string | null = null;

    try {
      if (supportingDocument) {
        const fileExtension = supportingDocument.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExtension}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('od_documents')
          .upload(filePath, supportingDocument);

        if (uploadError) {
          throw uploadError;
        }
        documentUrl = `${supabase.storage.from('od_documents').getPublicUrl(uploadData.path).data.publicUrl}`;
      }

      const { error: insertError } = await supabase
        .from('od_requests')
        .insert({
          student_id: user.id,
          reason: reason.trim(),
          request_date: format(selectedDate, 'yyyy-MM-dd'),
          status: 'Pending',
          supporting_document_url: documentUrl,
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('OD Request Submitted!', {
        description: `Your request for ${format(selectedDate, 'PPP')} has been sent for approval.`,
      });
      setReason('');
      setSelectedDate(new Date());
      setSupportingDocument(null);
    } catch (error: any) {
      console.error('Error submitting OD request:', error);
      toast.error('Failed to submit OD request.', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <MainLayout userRole="STUDENT">
        <div className="text-center text-muted-foreground">Loading session...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="STUDENT">
      <div className="space-y-6">
        <PageHeader
          title="Request On Duty (OD)"
          description="Fill out the form to request On Duty status for an event."
        />
        <Card className="max-w-lg mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Submit OD Request</CardTitle>
            <CardDescription className="text-muted-foreground">Fill out the form to request On Duty status for an event.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="reason" className="text-sm font-medium">Reason for OD</Label>
                <Textarea
                  id="reason"
                  placeholder="e.g., Participating in inter-college sports event, attending a workshop, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  disabled={submitting}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="date" className="text-sm font-medium">Date of OD</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !selectedDate && "text-muted-foreground"
                      )}
                      disabled={submitting}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="supportingDocument" className="text-sm font-medium">Supporting Document (Optional)</Label>
                <Input
                  id="supportingDocument"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  disabled={submitting}
                  className="mt-1"
                />
                {supportingDocument && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected file: {supportingDocument.name}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit OD Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RequestOD;