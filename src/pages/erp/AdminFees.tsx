"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

interface FeeRecord {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
  original_amount: number;
  due_date: string;
  status: 'Paid' | 'Outstanding';
  paid_at: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    roll_number: string;
  };
}

const AdminFees: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingFeeId, setEditingFeeId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFees();
  }, [filterStatus]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('fees')
        .select(`
          id,
          student_id,
          fee_type,
          amount,
          due_date,
          status,
          paid_at,
          profiles (
            first_name,
            last_name,
            roll_number
          )
        `)
        .order('due_date', { ascending: true });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedData = data.map((fee: any) => ({
        ...fee,
        original_amount: fee.amount,
        profiles: fee.profiles as { first_name: string; last_name: string; roll_number: string; } | null,
      }));
      setFees(formattedData as FeeRecord[]);
    } catch (error: any) {
      console.error('Error fetching fees:', error);
      toast.error('Failed to load fee records.', { description: error.message });
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaidClick = (feeId: string, currentAmount: number) => {
    setEditingFeeId(feeId);
    setPaymentAmount(currentAmount);
  };

  const handleConfirmPayment = async (feeId: string, originalOutstandingAmount: number) => {
    if (paymentAmount === '' || paymentAmount <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }
    if (paymentAmount > originalOutstandingAmount) {
      toast.error('Payment amount cannot exceed the outstanding amount.');
      return;
    }

    setSubmitting(true);
    try {
      const newOutstandingAmount = originalOutstandingAmount - paymentAmount;
      const newStatus = newOutstandingAmount <= 0 ? 'Paid' : 'Outstanding';
      const paidAt = newStatus === 'Paid' ? new Date().toISOString() : null;

      const { error } = await supabase
        .from('fees')
        .update({
          amount: newOutstandingAmount,
          status: newStatus,
          paid_at: paidAt,
        })
        .eq('id', feeId);

      if (error) {
        throw error;
      }

      toast.success(`Payment of ₹${paymentAmount.toLocaleString()} recorded for fee.`);
      fetchFees();
      setEditingFeeId(null);
      setPaymentAmount('');
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment.', { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelPayment = () => {
    setEditingFeeId(null);
    setPaymentAmount('');
  };

  return (
    <MainLayout userRole="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Manage Student Fees"
          description="View and manage fee status for all students."
        />
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>All Student Fee Records</CardTitle>
            <CardDescription>View and manage fee status for all students.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center space-x-4">
              <Label htmlFor="filterStatus">Filter by Status</Label>
              <Select onValueChange={setFilterStatus} value={filterStatus} disabled={submitting}>
                <SelectTrigger id="filterStatus" className="w-[180px]">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Outstanding">Outstanding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        Loading fee records...
                      </TableCell>
                    </TableRow>
                  ) : fees.length > 0 ? (
                    fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">{fee.profiles?.first_name} {fee.profiles?.last_name}</TableCell>
                        <TableCell>{fee.profiles?.roll_number}</TableCell>
                        <TableCell>{fee.fee_type}</TableCell>
                        <TableCell className="text-right">₹{fee.amount.toLocaleString()}</TableCell>
                        <TableCell>{fee.due_date}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'}>
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {fee.status === 'Outstanding' && editingFeeId !== fee.id && (
                            <Button size="sm" onClick={() => handleMarkAsPaidClick(fee.id, fee.amount)} disabled={submitting}>
                              Mark as Paid
                            </Button>
                          )}
                          {editingFeeId === fee.id && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || '')}
                                placeholder="Amount"
                                className="w-24"
                                min="1"
                                max={fee.amount}
                                disabled={submitting}
                              />
                              <Button size="sm" onClick={() => handleConfirmPayment(fee.id, fee.amount)} disabled={submitting}>
                                Confirm
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelPayment} disabled={submitting}>
                                Cancel
                              </Button>
                            </div>
                          )}
                          {fee.status === 'Paid' && (
                            <Button size="sm" variant="outline" disabled>
                              Paid
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No fee records found for the selected filter.
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

export default AdminFees;