"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments } from '@/hooks/useDepartments';
import { useCourses } from '@/hooks/useCourses';
import PageHeader from '@/components/layout/PageHeader';

interface StudentProfile {
  id: string;
  roll_number: string;
  first_name: string;
  last_name:
  string;
}

interface MarkEntry {
  student_id: string;
  roll_number: string;
  name: string;
  marks: string | number | null;
}

const UploadMarks: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const { courses, loading: loadingCourses, refreshCourses } = useCourses(selectedDepartmentId);

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [marksData, setMarksData] = useState<MarkEntry[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (selectedDepartmentId) {
      refreshCourses();
      setSelectedCourseId('');
    }
  }, [selectedDepartmentId, refreshCourses]);

  useEffect(() => {
    if (selectedDepartmentId && selectedYear) {
      fetchStudentsForMarks();
    } else {
      setStudents([]);
      setMarksData([]);
    }
  }, [selectedDepartmentId, selectedYear]);

  const fetchStudentsForMarks = async () => {
    setLoadingStudents(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, roll_number, first_name, last_name')
      .eq('role', 'STUDENT')
      .eq('department_id', selectedDepartmentId)
      .eq('year', selectedYear)
      .order('roll_number');

    if (error) {
      console.error('Error fetching students for marks:', error);
      toast.error('Failed to load students for this class.');
      setStudents([]);
      setMarksData([]);
    } else {
      setStudents(data as StudentProfile[]);
      setMarksData(data.map(s => ({
        student_id: s.id,
        roll_number: s.roll_number,
        name: `${s.first_name} ${s.last_name}`,
        marks: '',
      })));
    }
    setLoadingStudents(false);
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksData((prev) =>
      prev.map((student) =>
        student.student_id === studentId ? { ...student, marks: value } : student
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartmentId || !selectedYear || !selectedCourseId) {
      toast.error('Please select department, year, and subject.');
      return;
    }

    if (marksData.length === 0) {
      toast.error('No students found to upload marks for.');
      return;
    }

    setSubmitting(true);
    const marksToInsert = marksData
      .filter(entry => entry.marks !== '' && entry.marks !== null)
      .map(entry => {
        const score = parseFloat(entry.marks as string);
        let grade: string | null = null;
        if (!isNaN(score)) {
          if (score >= 90) grade = 'A+';
          else if (score >= 80) grade = 'A';
          else if (score >= 70) grade = 'B+';
          else if (score >= 60) grade = 'B';
          else if (score >= 50) grade = 'C+';
          else if (score >= 40) grade = 'C';
          else grade = 'F';
        }

        return {
          student_id: entry.student_id,
          course_id: selectedCourseId,
          marks: score,
          grade: grade,
        };
      });

    if (marksToInsert.length === 0) {
      toast.info('No marks entered to upload.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('marks')
      .upsert(marksToInsert, { onConflict: 'student_id, course_id' });

    if (error) {
      console.error('Error uploading marks:', error);
      toast.error('Failed to upload marks.', { description: error.message });
    } else {
      toast.success('Marks uploaded successfully!', {
        description: `Class: ${selectedDepartmentId}-${selectedYear}, Course: ${courses.find(c => c.id === selectedCourseId)?.name}`,
      });
      setMarksData(prev => prev.map(s => ({ ...s, marks: '' })));
    }
    setSubmitting(false);
  };

  return (
    <MainLayout userRole="TEACHER">
      <div className="space-y-6">
        <PageHeader
          title="Upload Marks"
          description="Select the class and subject, then enter marks for each student."
        />
        <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Enter Student Marks</CardTitle>
            <CardDescription className="text-muted-foreground">Select the class and subject, then enter marks for each student.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md bg-muted/50">
                <div>
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Select onValueChange={setSelectedDepartmentId} value={selectedDepartmentId} required disabled={loadingDepts}>
                    <SelectTrigger id="department" className="mt-1">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
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
                  <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                  <Select onValueChange={setSelectedYear} value={selectedYear} required>
                    <SelectTrigger id="year" className="mt-1">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="course" className="text-sm font-medium">Course</Label>
                  <Select onValueChange={setSelectedCourseId} value={selectedCourseId} required disabled={!selectedDepartmentId || loadingCourses}>
                    <SelectTrigger id="course" className="mt-1">
                      <SelectValue placeholder={!selectedDepartmentId ? "Select Dept First" : "Select Course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCourses ? (
                        <SelectItem value="loading" disabled>Loading Courses...</SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDepartmentId && selectedYear && selectedCourseId && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Enter Marks for {courses.find(c => c.id === selectedCourseId)?.name}</h3>
                  {loadingStudents ? (
                    <div className="text-center text-muted-foreground py-4">Loading students...</div>
                  ) : students.length > 0 ? (
                    <div className="overflow-x-auto border rounded-md shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="font-semibold">Roll Number</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="text-center font-semibold">Marks (out of 100)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {marksData.map((student) => (
                            <TableRow key={student.student_id} className="hover:bg-muted/50">
                              <TableCell>{student.roll_number}</TableCell>
                              <TableCell>{student.name}</TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={student.marks || ''}
                                  onChange={(e) => handleMarkChange(student.student_id, e.target.value)}
                                  className="w-24 text-center"
                                  disabled={submitting}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No students found for the selected class.</TableCell>
                    </TableRow>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={submitting || marksData.length === 0}>
                {submitting ? 'Uploading Marks...' : 'Upload Marks'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UploadMarks;