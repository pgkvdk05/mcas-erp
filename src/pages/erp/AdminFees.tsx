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
import { Loader2 } from 'lucide-react';

interface FeeRecord {
  id: string;
  student_id: string;
  fee_type: string;
  amount: number;
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

  useEffect(() => { fetchFees(); }, [filterStatus]);

  const fetchFees = async () => {
    setLoading(true);
    let query = supabase
      .from('fees')
      .select(`id, student_id, fee_type, amount, due_date, status, paid_at,
        profiles (first_name, last_name, roll_number)`)
      .order('due_date', { ascending: true });

    if (filterStatus !== 'all') query = query.eq('status', filterStatus);

    const { data, error } = await query;
    if (error) {
      toast.error('Failed to load fee records: ' + error.message);
      setFees([]);
    } else {
      setFees((data ?? []) as unknown as FeeRecord[]);
    }
    setLoading(false);
  };

  const handleMarkAsPaidClick = (feeId: string, currentAmount: number) => {
    setEditingFeeId(feeId);
    setPaymentAmount(currentAmount);
  };

  const handleConfirmPayment = async (feeId: string, outstanding: number) => {
    if (paymentAmount === '' || paymentAmount <= 0) { toast.error('Enter a valid amount.'); return; }
    if (paymentAmount > outstanding) { toast.error('Amount exceeds outstanding balance.'); return; }

    setSubmitting(true);
    const newAmount = outstanding - paymentAmount;
    const newStatus = newAmount <= 0 ? 'Paid' : 'Outstanding';

    const { error } = await supabase.from('fees').update({
      amount: newAmount,
      status: newStatus,
      paid_at: newStatus === 'Paid' ? new Date().toISOString() : null,
    }).eq('id', feeId);

    if (error) {
      toast.error('Failed: ' + error.message);
    } else {
      toast.success(`₹${(paymentAmount as number).toLocaleString()} payment recorded.`);
      fetchFees();
      setEditingFeeId(null);
      setPaymentAmount('');
    }
    setSubmitting(false);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title="Manage Student Fees" description="View and update fee status for all students." />
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>Student Fee Records</CardTitle>
            <CardDescription>Mark payments and track outstanding fees.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-3">
              <Label>Filter</Label>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Outstanding">Outstanding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                    </TableCell></TableRow>
                  ) : fees.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      No fee records found.
                    </TableCell></TableRow>
                  ) : fees.map(fee => (
                    <TableRow key={fee.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{fee.profiles?.first_name} {fee.profiles?.last_name}</TableCell>
                      <TableCell className="font-mono text-sm">{fee.profiles?.roll_number ?? '—'}</TableCell>
                      <TableCell>{fee.fee_type}</TableCell>
                      <TableCell className="text-right">₹{fee.amount.toLocaleString()}</TableCell>
                      <TableCell>{fee.due_date}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'}>{fee.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {fee.status === 'Outstanding' && editingFeeId !== fee.id && (
                          <Button size="sm" onClick={() => handleMarkAsPaidClick(fee.id, fee.amount)} disabled={submitting}>
                            Mark Paid
                          </Button>
                        )}
                        {editingFeeId === fee.id && (
                          <div className="flex items-center gap-1">
                            <Input type="number" value={paymentAmount}
                              onChange={e => setPaymentAmount(parseFloat(e.target.value) || '')}
                              className="w-24 h-7" min="1" max={fee.amount} disabled={submitting} />
                            <Button size="sm" className="h-7" onClick={() => handleConfirmPayment(fee.id, fee.amount)} disabled={submitting}>
                              {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                            </Button>
                            <Button size="sm" variant="outline" className="h-7" onClick={() => { setEditingFeeId(null); setPaymentAmount(''); }}>
                              Cancel
                            </Button>
                          </div>
                        )}
                        {fee.status === 'Paid' && (
                          <span className="text-xs text-muted-foreground">
                            {fee.paid_at ? new Date(fee.paid_at).toLocaleDateString() : 'Paid'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
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