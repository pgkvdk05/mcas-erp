"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments } from '@/hooks/useDepartments';
import PageHeader from '@/components/layout/PageHeader';

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  department_id: string;
  year: string;
  email: string;
  departments?: {
    name: string;
  };
}

const ViewStudentProfiles: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  useEffect(() => {
    fetchStudentProfiles();
  }, [filterDepartment, filterYear]);

  const fetchStudentProfiles = async () => {
    setLoadingProfiles(true);
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          roll_number,
          department_id,
          year,
          email,
          departments (
            name
          )
        `)
        .eq('role', 'STUDENT')
        .order('roll_number', { ascending: true });

      if (filterDepartment !== 'all') {
        query = query.eq('department_id', filterDepartment);
      }
      if (filterYear !== 'all') {
        query = query.eq('year', filterYear);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setStudentProfiles(data as unknown as StudentProfile[]);
    } catch (error: any) {
      console.error('Error fetching student profiles:', error);
      toast.error('Failed to load student profiles.');
      setStudentProfiles([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleViewDetails = (studentName: string, studentId: string) => {
    toast.info(`Simulating viewing details for ${studentName} (ID: ${studentId}).`);
  };

  return (
    <MainLayout userRole="TEACHER">
      <div className="space-y-6">
        <PageHeader
          title="View Student Profiles"
          description="Browse student profiles by class."
        />
        <Card className="max-w-6xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Student Directory</CardTitle>
            <CardDescription className="text-muted-foreground">Browse student profiles by class.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md bg-muted/50">
              <div>
                <Label htmlFor="filterDepartment" className="text-sm font-medium">Department</Label>
                <Select onValueChange={setFilterDepartment} value={filterDepartment} disabled={loadingDepts}>
                  <SelectTrigger id="filterDepartment" className="mt-1">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {loadingDepts ? (
                      <SelectItem value="loading" disabled>Loading Departments...</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="filterYear" className="text-sm font-medium">Year</Label>
                <Select onValueChange={setFilterYear} value={filterYear}>
                  <SelectTrigger id="filterYear" className="mt-1">
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
            </div>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Roll Number</TableHead>
                    <TableHead className="font-semibold">Class</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingProfiles ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        Loading student profiles...
                      </TableCell>
                    </TableRow>
                  ) : studentProfiles.length > 0 ? (
                    studentProfiles.map((student) => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                        <TableCell>{student.roll_number}</TableCell>
                        <TableCell>{student.departments?.name || 'N/A'} {student.year}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(`${student.first_name} ${student.last_name}`, student.id)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        No students found for the selected filters.
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

export default ViewStudentProfiles;