"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';

interface MarkRecord {
  id: string;
  course_id: string;
  marks: number;
  grade: string | null;
  courses?: {
    name: string;
    code: string;
  };
}

const ViewMarks: React.FC = () => {
  const { user, loading: sessionLoading } = useSession();
  const [studentMarks, setStudentMarks] = useState<MarkRecord[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(true);
  const [filterSubject, setFilterSubject] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchMarks = async () => {
      if (sessionLoading || !user) {
        setLoadingMarks(false);
        return;
      }

      setLoadingMarks(true);
      try {
        const { data, error } = await supabase
          .from('marks')
          .select(`
            id,
            course_id,
            marks,
            grade,
            courses (
              name,
              code
            )
          `)
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setStudentMarks(data as unknown as MarkRecord[]);
        const subjects = Array.from(new Set(data.map(m => m.courses?.name).filter(Boolean) as string[]));
        setAvailableSubjects(subjects);

      } catch (error: any) {
        console.error('Error fetching student marks:', error);
        toast.error('Failed to load your marks.', { description: error.message });
      } finally {
        setLoadingMarks(false);
      }
    };

    fetchMarks();
  }, [user, sessionLoading]);

  const filteredMarks = filterSubject === 'all'
    ? studentMarks
    : studentMarks.filter(record => record.courses?.name === filterSubject);

  const getGradeVariant = (grade: string | null) => {
    if (!grade) return 'outline';
    if (grade === 'A+' || grade === 'A') return 'default';
    if (grade === 'B+' || grade === 'B') return 'secondary';
    if (grade === 'C+' || grade === 'C') return 'outline';
    return 'destructive';
  };

  if (sessionLoading || loadingMarks) {
    return (
      <MainLayout userRole="STUDENT">
        <div className="text-center text-muted-foreground">Loading marks...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="STUDENT">
      <div className="space-y-6">
        <PageHeader
          title="My Marks"
          description="Overview of your academic performance."
        />
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Academic Performance</CardTitle>
            <CardDescription>View your marks for various subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Label htmlFor="filterSubject">Filter by Subject</Label>
              <Select onValueChange={setFilterSubject} value={filterSubject}>
                <SelectTrigger id="filterSubject" className="w-[180px]">
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

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
    <TableBody>
                  {filteredMarks.length > 0 ? (
                    filteredMarks.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.courses?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right">{record.marks}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getGradeVariant(record.grade)}>
                            {record.grade || 'N/A'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No marks records found.
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

export default ViewMarks;