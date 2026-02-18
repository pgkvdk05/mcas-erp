"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments } from '@/hooks/useDepartments';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';

interface AttendanceLog {
  id: string;
  date: string;
  status: string;
  student: {
    first_name: string;
    last_name: string;
    roll_number: string;
  };
  course: {
    name: string;
    code: string;
  };
}

const ViewAllAttendance: React.FC = () => {
  const { departments } = useDepartments();
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filterDate, filterDepartment]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('attendance')
        .select(`
          id,
          date,
          status,
          profiles!inner (
            first_name,
            last_name,
            roll_number,
            department_id
          ),
          courses (
            name,
            code
          )
        `)
        .eq('date', filterDate)
        .order('created_at', { ascending: false });

      if (filterDepartment !== 'all') {
        query = query.eq('profiles.department_id', filterDepartment);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      const formattedData = data.map((item: any) => ({
        id: item.id,
        date: item.date,
        status: item.status,
        student: {
          first_name: item.profiles.first_name,
          last_name: item.profiles.last_name,
          roll_number: item.profiles.roll_number,
        },
        course: {
          name: item.courses?.name || 'Unknown',
          code: item.courses?.code || '-',
        }
      }));

      setLogs(formattedData);
    } catch (error: any) {
      console.error('Error fetching attendance logs:', error);
      toast.error('Failed to load attendance logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout userRole="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Attendance Logs"
          description="View attendance records for all students."
        />

        <Card className="shadow-lg rounded-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl font-semibold">Filters</CardTitle>
            <CardDescription className="text-muted-foreground">Filter attendance records by date and department.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-4 items-end p-4 border-t bg-muted/50">
            <div className="w-full md:w-1/3">
              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
              <Input
                type="date"
                id="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="w-full md:w-1/3">
              <Label htmlFor="dept" className="text-sm font-medium">Department</Label>
              <Select onValueChange={setFilterDepartment} value={filterDepartment}>
                <SelectTrigger id="dept" className="mt-1">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3 pb-0.5">
              <Button onClick={fetchLogs} variant="outline" className="w-full py-2 text-base font-semibold">Refresh</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Records for {filterDate}</CardTitle>
            <CardDescription className="text-muted-foreground">Showing {logs.length} records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Student</TableHead>
                    <TableHead className="font-semibold">Roll No</TableHead>
                    <TableHead className="font-semibold">Course</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">Loading...</TableCell>
                    </TableRow>
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{log.student.first_name} {log.student.last_name}</TableCell>
                        <TableCell>{log.student.roll_number}</TableCell>
                        <TableCell>
                          <div>{log.course.name}</div>
                          <div className="text-xs text-muted-foreground">{log.course.code}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={log.status === 'Present' ? 'default' : 'destructive'}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No records found for this date.
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

export default ViewAllAttendance;