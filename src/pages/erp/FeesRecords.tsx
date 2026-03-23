"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Loader2, RefreshCw, Pencil, Check, X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

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
    department_id: string;
  };
}

interface EditState {
  feeId: string;
  field: 'payment' | 'amount' | 'due_date';
  value: string;
}

// ─── Default fee amount ───────────────────────────────────────────────────────
const DEFAULT_FEE = 18000;
const DEFAULT_DUE_DATE = '2025-06-30';
const FEE_TYPE = 'Annual Tuition Fee';

// ─── Main component ───────────────────────────────────────────────────────────

const FeesRecords: React.FC = () => {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDept, setFilterDept] = useState('all');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [edit, setEdit] = useState<EditState | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFees();
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const { data } = await supabase.from('departments').select('id, name').order('name');
    setDepartments(data ?? []);
  };

  const fetchFees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('fees')
      .select(`
        id, student_id, fee_type, amount, due_date, status, paid_at,
        profiles (first_name, last_name, roll_number, department_id)
      `)
      .order('due_date', { ascending: true });

    if (error) {
      toast.error('Failed to load fee records: ' + error.message);
      setFees([]);
    } else {
      setFees((data ?? []) as unknown as FeeRecord[]);
    }
    setLoading(false);
  };

  // ── Auto-generate fees for students who don't have one ───────────────────
  const handleGenerateFees = async () => {
    setGenerating(true);
    try {
      // Get all students
      const { data: students, error: sErr } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'STUDENT');

      if (sErr) throw sErr;

      // Get students who already have this fee type
      const { data: existing, error: eErr } = await supabase
        .from('fees')
        .select('student_id')
        .eq('fee_type', FEE_TYPE);

      if (eErr) throw eErr;

      const existingIds = new Set((existing ?? []).map((f: any) => f.student_id));
      const newStudents = (students ?? []).filter((s: any) => !existingIds.has(s.id));

      if (newStudents.length === 0) {
        toast.info('All students already have fee records.');
        setGenerating(false);
        return;
      }

      const records = newStudents.map((s: any) => ({
        student_id: s.id,
        fee_type: FEE_TYPE,
        amount: DEFAULT_FEE,
        due_date: DEFAULT_DUE_DATE,
        status: 'Outstanding',
      }));

      const { error: iErr } = await supabase.from('fees').insert(records);
      if (iErr) throw iErr;

      toast.success(`Fee records generated for ${newStudents.length} students.`);
      fetchFees();
    } catch (err: any) {
      toast.error('Failed to generate fees: ' + err.message);
    }
    setGenerating(false);
  };

  // ── Mark as paid ─────────────────────────────────────────────────────────
  const handleConfirmPayment = async (fee: FeeRecord) => {
    if (!edit) return;
    const payment = parseFloat(edit.value);
    if (isNaN(payment) || payment <= 0) {
      toast.error('Enter a valid payment amount.');
      return;
    }
    if (payment > fee.amount) {
      toast.error('Payment cannot exceed outstanding amount.');
      return;
    }

    setSubmitting(true);
    const newAmount = fee.amount - payment;
    const newStatus = newAmount <= 0 ? 'Paid' : 'Outstanding';

    const { error } = await supabase
      .from('fees')
      .update({
        amount: newAmount,
        status: newStatus,
        paid_at: newStatus === 'Paid' ? new Date().toISOString() : null,
      })
      .eq('id', fee.id);

    if (error) {
      toast.error('Failed to record payment: ' + error.message);
    } else {
      toast.success(`₹${payment.toLocaleString()} payment recorded.`);
      fetchFees();
      setEdit(null);
    }
    setSubmitting(false);
  };

  // ── Update amount ─────────────────────────────────────────────────────────
  const handleUpdateAmount = async (feeId: string) => {
    if (!edit) return;
    const amount = parseFloat(edit.value);
    if (isNaN(amount) || amount < 0) {
      toast.error('Enter a valid amount.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase
      .from('fees')
      .update({ amount, status: amount <= 0 ? 'Paid' : 'Outstanding' })
      .eq('id', feeId);

    if (error) {
      toast.error('Failed to update amount: ' + error.message);
    } else {
      toast.success('Amount updated.');
      fetchFees();
      setEdit(null);
    }
    setSubmitting(false);
  };

  // ── Update due date ───────────────────────────────────────────────────────
  const handleUpdateDueDate = async (feeId: string) => {
    if (!edit) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('fees')
      .update({ due_date: edit.value })
      .eq('id', feeId);

    if (error) {
      toast.error('Failed to update due date: ' + error.message);
    } else {
      toast.success('Due date updated.');
      fetchFees();
      setEdit(null);
    }
    setSubmitting(false);
  };

  // ── Filtered data ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return fees.filter(f => {
      const statusMatch = filterStatus === 'all' || f.status === filterStatus;
      const deptMatch = filterDept === 'all' || f.profiles?.department_id === filterDept;
      return statusMatch && deptMatch;
    });
  }, [fees, filterStatus, filterDept]);

  const totalOutstanding = filtered
    .filter(f => f.status === 'Outstanding')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPaid = filtered
    .filter((_f: FeeRecord) => _f.status === 'Paid')
    .reduce((sum, _f) => sum + DEFAULT_FEE, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Fees Records"
          description="View, generate and manage all student fee records."
        />

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Total Records</p>
              <p className="text-3xl font-bold">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-3xl font-bold text-destructive">₹{totalOutstanding.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">Collected</p>
              <p className="text-3xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle>All Fee Records</CardTitle>
                <CardDescription>₹18,000 annual tuition fee for all departments.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchFees} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
                <Button size="sm" onClick={handleGenerateFees} disabled={generating}>
                  {generating
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-1" />Generating...</>
                    : 'Generate Missing Fees'
                  }
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Select onValueChange={setFilterStatus} value={filterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Outstanding">Outstanding</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Department</Label>
                <Select onValueChange={setFilterDept} value={filterDept}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Fee Type</TableHead>
                    <TableHead className="text-right">Amount (₹)</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No records found. Click "Generate Missing Fees" to create fee records.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(fee => (
                      <TableRow key={fee.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {fee.profiles?.first_name} {fee.profiles?.last_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {fee.profiles?.roll_number ?? '—'}
                        </TableCell>
                        <TableCell>{fee.fee_type}</TableCell>

                        {/* Amount — editable */}
                        <TableCell className="text-right">
                          {edit?.feeId === fee.id && edit.field === 'amount' ? (
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number" min="0"
                                value={edit.value}
                                onChange={e => setEdit({ ...edit, value: e.target.value })}
                                className="w-24 text-right h-7 text-sm"
                                disabled={submitting}
                              />
                              <Button size="icon" className="h-7 w-7" onClick={() => handleUpdateAmount(fee.id)} disabled={submitting}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setEdit(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <span>₹{fee.amount.toLocaleString()}</span>
                              {fee.status === 'Outstanding' && (
                                <button onClick={() => setEdit({ feeId: fee.id, field: 'amount', value: String(fee.amount) })}
                                  className="text-muted-foreground hover:text-foreground ml-1">
                                  <Pencil className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>

                        {/* Due Date — editable */}
                        <TableCell>
                          {edit?.feeId === fee.id && edit.field === 'due_date' ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="date"
                                value={edit.value}
                                onChange={e => setEdit({ ...edit, value: e.target.value })}
                                className="w-32 h-7 text-sm"
                                disabled={submitting}
                              />
                              <Button size="icon" className="h-7 w-7" onClick={() => handleUpdateDueDate(fee.id)} disabled={submitting}>
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setEdit(null)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span>{fee.due_date}</span>
                              <button onClick={() => setEdit({ feeId: fee.id, field: 'due_date', value: fee.due_date })}
                                className="text-muted-foreground hover:text-foreground">
                                <Pencil className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'}>
                            {fee.status}
                          </Badge>
                        </TableCell>

                        {/* Payment action */}
                        <TableCell className="text-right">
                          {fee.status === 'Outstanding' && edit?.feeId === fee.id && edit.field === 'payment' ? (
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number" min="1" max={fee.amount}
                                value={edit.value}
                                onChange={e => setEdit({ ...edit, value: e.target.value })}
                                placeholder="₹"
                                className="w-24 h-7 text-sm"
                                disabled={submitting}
                              />
                              <Button size="sm" className="h-7" onClick={() => handleConfirmPayment(fee)} disabled={submitting}>
                                {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm'}
                              </Button>
                              <Button size="sm" variant="outline" className="h-7" onClick={() => setEdit(null)}>Cancel</Button>
                            </div>
                          ) : fee.status === 'Outstanding' ? (
                            <Button size="sm" onClick={() => setEdit({ feeId: fee.id, field: 'payment', value: String(fee.amount) })}>
                              Mark Paid
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              {fee.paid_at ? new Date(fee.paid_at).toLocaleDateString() : 'Paid'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
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

export default FeesRecords;