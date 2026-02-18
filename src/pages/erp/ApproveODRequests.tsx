"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

interface ODRequest {
  id: string;
  student_id: string;
  reason: string;
  request_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  supporting_document_url: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    roll_number: string;
  };
}

const ApproveODRequests: React.FC = () => {
  const [requests, setRequests] = useState<ODRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchODRequests();
  }, []);

  const fetchODRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('od_requests')
      .select(`
        id,
        student_id,
        reason,
        request_date,
        status,
        supporting_document_url,
        profiles (
          first_name,
          last_name,
          roll_number
        )
      `)
      .order('request_date', { ascending: true });

    if (error) {
      console.error('Error fetching OD requests:', error);
      toast.error('Failed to load OD requests.', { description: error.message });
      setRequests([]);
    } else {
      setRequests(data as unknown as ODRequest[]);
    }
    setLoading(false);
  };

  const handleAction = async (id: string, action: 'Approved' | 'Rejected') => {
    setSubmitting(true);
    const { error } = await supabase
      .from('od_requests')
      .update({ status: action })
      .eq('id', id);

    if (error) {
      console.error(`Error updating OD request ${id}:`, error);
      toast.error(`Failed to ${action.toLowerCase()} OD request.`, { description: error.message });
    } else {
      toast.success(`OD Request ${id} ${action}!`);
      fetchODRequests();
    }
    setSubmitting(false);
  };

  return (
    <MainLayout userRole="TEACHER">
      <div className="space-y-6">
        <PageHeader
          title="Approve OD Requests"
          description="Review and take action on student On Duty requests."
        />
        <Card className="max-w-5xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Outstanding Duty Requests</CardTitle>
            <CardDescription className="text-muted-foreground">Review and take action on student On Duty requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Student Name</TableHead>
                    <TableHead className="font-semibold">Roll Number</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Document</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                        Loading OD requests...
                      </TableCell>
                    </TableRow>
                  ) : requests.length > 0 ? (
                    requests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{req.profiles?.first_name} {req.profiles?.last_name}</TableCell>
                        <TableCell>{req.profiles?.roll_number}</TableCell>
                        <TableCell>{req.reason}</TableCell>
                        <TableCell>{req.request_date}</TableCell>
                        <TableCell>
                          {req.supporting_document_url ? (
                            <a href={req.supporting_document_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">View Doc</a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              req.status === 'Approved'
                                ? 'default'
                                : req.status === 'Rejected'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {req.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {req.status === 'Pending' && (
                            <>
                              <Button size="sm" onClick={() => handleAction(req.id, 'Approved')} disabled={submitting}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, 'Rejected')} disabled={submitting}>
                                Reject
                              </Button>
                            </>
                          )}
                          {req.status !== 'Pending' && (
                            <Button size="sm" variant="outline" disabled>
                              {req.status}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-4">
                        No OD requests found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ApproveODRequests;