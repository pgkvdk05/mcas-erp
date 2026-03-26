"use client";

import React, { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments } from '@/hooks/useDepartments';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';
import { Loader2 } from 'lucide-react';

interface MarkRecord {
  id: string;
  marks: number;
  grade: string | null;
  profiles: {
    first_name: string;
    last_name: string;
    roll_number: string;
    department_id: string;
    year: string;
  } | null;
  courses: {
    name: string;
    code: string;
  } | null;
}

const ViewAllMarks: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [allMarks, setAllMarks] = useState<MarkRecord[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => { fetchMarks(); }, []);

  const fetchMarks = async () => {
    setLoadingMarks(true);
    const { data, error } = await supabase
      .from('marks')
      .select(`
        id, marks, grade,
        profiles (first_name, last_name, roll_number, department_id, year),
        courses (name, code)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marks:', error);
      toast.error('Failed to load marks: ' + error.message);
      setAllMarks([]);
    } else {
      setAllMarks((data ?? []) as unknown as MarkRecord[]);
    }
    setLoadingMarks(false);
  };

  // Client-side filtering
  const filtered = useMemo(() => {
    return allMarks.filter(r => {
      const deptMatch = filterDepartment === 'all' || r.profiles?.department_id === filterDepartment;
      const yearMatch = filterYear === 'all' || r.profiles?.year === filterYear;
      const subjectMatch = filterSubject === 'all' || r.courses?.name === filterSubject;
      return deptMatch && yearMatch && subjectMatch;
    });
  }, [allMarks, filterDepartment, filterYear, filterSubject]);

  // Available subjects from loaded data
  const availableSubjects = useMemo(() => {
    return Array.from(new Set(allMarks.map(r => r.courses?.name).filter(Boolean))) as string[];
  }, [allMarks]);

  const getGradeVariant = (grade: string | null) => {
    if (!grade) return 'outline' as const;
    if (grade === 'A+' || grade === 'A') return 'default' as const;
    if (grade === 'B+' || grade === 'B') return 'secondary' as const;
    if (grade === 'F') return 'destructive' as const;
    return 'outline' as const;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="View All Marks"
          description="Comprehensive academic performance overview for all students."
        />
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Comprehensive Academic Performance</CardTitle>
            <CardDescription>View marks for all students across different classes and subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label>Department</Label>
                <Select onValueChange={setFilterDepartment} value={filterDepartment} disabled={loadingDepts}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select onValueChange={setFilterYear} value={filterYear}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select onValueChange={setFilterSubject} value={filterSubject}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {availableSubjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
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
                    <TableHead className="font-semibold">Student Name</TableHead>
                    <TableHead className="font-semibold">Roll Number</TableHead>
                    <TableHead className="font-semibold">Class</TableHead>
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="text-right font-semibold">Marks</TableHead>
                    <TableHead className="text-center font-semibold">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingMarks ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : filtered.length > 0 ? (
                    filtered.map(record => (
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {record.profiles?.first_name} {record.profiles?.last_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {record.profiles?.roll_number ?? '—'}
                        </TableCell>
                        <TableCell>
                          {departments.find(d => d.id === record.profiles?.department_id)?.name ?? '—'}{' '}
                          {record.profiles?.year ? `(Year ${record.profiles.year})` : ''}
                        </TableCell>
                        <TableCell>{record.courses?.name ?? '—'}</TableCell>
                        <TableCell className="text-right">{record.marks}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getGradeVariant(record.grade)}>
                            {record.grade ?? 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No marks records found for the selected filters.
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

export default ViewAllMarks;