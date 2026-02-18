"use client";

import React, { useState, useEffect } from 'react';
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
  };
  courses: {
    name: string;
    code: string;
  };
}

const ViewAllMarks: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [allMarks, setAllMarks] = useState<MarkRecord[]>([]);
  const [loadingMarks, setLoadingMarks] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    fetchMarks();
  }, [filterDepartment, filterYear, filterSubject]);

  const fetchMarks = async () => {
    setLoadingMarks(true);
    try {
      let query = supabase
        .from('marks')
        .select(`
          id,
          marks,
          grade,
          profiles!inner (
            first_name,
            last_name,
            roll_number,
            department_id,
            year
          ),
          courses!inner (
            name,
            code
          )
        `);

      if (filterDepartment !== 'all') {
        query = query.eq('profiles.department_id', filterDepartment);
      }
      if (filterYear !== 'all') {
        query = query.eq('profiles.year', filterYear);
      }
      if (filterSubject !== 'all') {
        query = query.eq('courses.name', filterSubject);
      }

      const { data, error } = await query.order('profiles.roll_number').order('courses.name');

      if (error) {
        throw error;
      }

      setAllMarks(data as unknown as MarkRecord[]);

      const uniqueSubjects = Array.from(new Set(data.map((item: any) => item.courses?.name).filter(Boolean) as string[]));
      setAvailableSubjects(['all', ...uniqueSubjects]);

    } catch (error: any) {
      console.error('Error fetching all marks:', error);
      toast.error('Failed to load all marks.');
    } finally {
      setLoadingMarks(false);
    }
  };

  const getGradeVariant = (grade: string | null) => {
    if (!grade) return 'outline';
    if (grade === 'A+' || grade === 'A') return 'default';
    if (grade === 'B+' || grade === 'B') return 'secondary';
    if (grade === 'C+' || grade === 'C') return 'outline';
    return 'destructive';
  };

  return (
    <MainLayout userRole="ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="View All Marks"
          description="Comprehensive academic performance overview for all students."
        />
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Comprehensive Academic Performance</CardTitle>
            <CardDescription className="text-muted-foreground">View marks for all students across different classes and subjects.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="filterDepartment">Department</Label>
                <Select onValueChange={setFilterDepartment} value={filterDepartment} disabled={loadingDepts}>
                  <SelectTrigger id="filterDepartment">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {loadingDepts ? (
                      <SelectItem value="loading" disabled>Loading Departments...</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterYear">Year</Label>
                <Select onValueChange={setFilterYear} value={filterYear}>
                  <SelectTrigger id="filterYear">
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
              <div className="md:col-span-1">
                <Label htmlFor="filterSubject">Subject</Label>
                <Select onValueChange={setFilterSubject} value={filterSubject}>
                  <SelectTrigger id="filterSubject">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>{subject === 'all' ? 'All Subjects' : subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead className="text-right">Marks</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingMarks ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Loading marks...
                      </TableCell>
                    </TableRow>
                  ) : allMarks.length > 0 ? (
                    allMarks.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.profiles.first_name} {record.profiles.last_name}</TableCell>
                        <TableCell>{record.profiles.roll_number}</TableCell>
                        <TableCell>{departments.find(d => d.id === record.profiles.department_id)?.name || 'N/A'} {record.profiles.year}</TableCell>
                        <TableCell>{record.courses.name}</TableCell>
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
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