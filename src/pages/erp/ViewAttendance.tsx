"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import PageHeader from '@/components/layout/PageHeader';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  course_id: string;
  reason: string | null;
  courses?: {
    name: string;
    code: string;
  };
}

const ViewAttendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [subjects, setSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('User not found.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          courses (
            name,
            code
          )
        `)
        .eq('student_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      setAttendance(data as unknown as AttendanceRecord[]);

      const uniqueSubjects = Array.from(new Set(data?.map(item => item.courses?.name).filter(Boolean) as string[]));
      setSubjects(uniqueSubjects);

    } catch (error: any) {
      console.error('Error fetching attendance:', error);
      toast.error('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = filterSubject === 'all'
    ? attendance
    : attendance.filter(record => record.courses?.name === filterSubject);

  const totalDays = filteredAttendance.length;
  const presentDays = filteredAttendance.filter(r => r.status === 'Present').length;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

  return (
    <MainLayout userRole="STUDENT">
      <div className="space-y-6">
        <PageHeader
          title="My Attendance"
          description="Overview of your attendance records."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentDays}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Percentage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${Number(attendancePercentage) < 75 ? 'text-red-500' : 'text-primary'}`}>
                {attendancePercentage}%
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>View your attendance history.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="filterSubject">Filter by Subject</Label>
              <Select onValueChange={setFilterSubject} value={filterSubject}>
                <SelectTrigger id="filterSubject" className="w-[250px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">Loading attendance...</TableCell>
                    </TableRow>
                  ) : filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                        <TableCell>
                          <div className="font-medium">{record.courses?.name}</div>
                          <div className="text-xs text-muted-foreground">{record.courses?.code}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={record.status === 'Present' ? 'default' : 'destructive'}>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.reason || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No attendance records found.
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

export default ViewAttendance;