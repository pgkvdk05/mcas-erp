"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import PageHeader from '@/components/layout/PageHeader';

interface FeeRecord {
  id: string;
  fee_type: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Outstanding';
  paid_at: string | null;
}

const StudentFees: React.FC = () => {
  const { user, loading: sessionLoading } = useSession();
  const [studentFees, setStudentFees] = useState<FeeRecord[]>([]);
  const [loadingFees, setLoadingFees] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      if (sessionLoading || !user) {
        setLoadingFees(false);
        return;
      }

      setLoadingFees(true);
      try {
        const { data, error } = await supabase
          .from('fees')
          .select('*')
          .eq('student_id', user.id)
          .order('due_date', { ascending: true });

        if (error) {
          throw error;
        }

        setStudentFees(data as FeeRecord[]);
      } catch (error: any) {
        console.error('Error fetching student fees:', error);
        toast.error('Failed to load your fee records.', { description: error.message });
      } finally {
        setLoadingFees(false);
      }
    };

    fetchFees();
  }, [user, sessionLoading]);

  const handlePayNow = (feeId: string, amount: number, type: string) => {
    console.log(`Simulating payment for fee ${feeId} (${type}) - Amount: ${amount}`);
    toast.info(`Simulating payment for ${type} of ₹${amount}. This would redirect to a payment gateway.`);
  };

  const totalOutstanding = studentFees
    .filter(fee => fee.status === 'Outstanding')
    .reduce((sum, fee) => sum + fee.amount, 0);

  if (sessionLoading || loadingFees) {
    return (
      <MainLayout userRole="STUDENT">
        <div className="text-center text-muted-foreground">Loading fees...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="STUDENT">
      <div className="space-y-6">
        <PageHeader
          title="My Fees"
          description="Overview of your academic fees and payment status."
        />
        <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Fee Status</CardTitle>
            <CardDescription className="text-muted-foreground">Overview of your academic fees and payment status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 border rounded-md bg-muted/50 flex flex-col sm:flex-row justify-between items-center shadow-sm">
              <p className="text-lg font-semibold text-primary mb-2 sm:mb-0">Total Outstanding Amount:</p>
              <p className="text-3xl font-bold text-destructive">₹{totalOutstanding.toLocaleString()}</p>
            </div>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Fee Type</TableHead>
                    <TableHead className="text-right font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Due Date</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFees.length > 0 ? (
                    studentFees.map((fee) => (
                      <TableRow key={fee.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{fee.fee_type}</TableCell>
                        <TableCell className="text-right">₹{fee.amount.toLocaleString()}</TableCell>
                        <TableCell>{fee.due_date}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'}>
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {fee.status === 'Outstanding' && (
                            <Button size="sm" onClick={() => handlePayNow(fee.id, fee.amount, fee.fee_type)}>
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        No fee records found.
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

export default StudentFees;