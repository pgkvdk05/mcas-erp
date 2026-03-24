"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Loader2, Search } from 'lucide-react';

interface StudentProfile {
  id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
}

interface MarkEntry {
  student_id: string;
  roll_number: string;
  name: string;
  marks: string;
}

// Year options — covers both formats stored in DB
const YEAR_OPTIONS = [
  { label: '1st Year', values: ['1', '1st Year', '1st year', 'First Year'] },
  { label: '2nd Year', values: ['2', '2nd Year', '2nd year', 'Second Year'] },
  { label: '3rd Year', values: ['3', '3rd Year', '3rd year', 'Third Year'] },
];

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
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (selectedDepartmentId) {
      refreshCourses();
      setSelectedCourseId('');
    }
  }, [selectedDepartmentId, refreshCourses]);

  useEffect(() => {
    if (selectedDepartmentId && selectedYear) {
      fetchStudents();
    } else {
      setStudents([]);
      setMarksData([]);
    }
  }, [selectedDepartmentId, selectedYear]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    setSearch('');

    // Get all possible year value formats for the selected year
    const yearOption = YEAR_OPTIONS.find(y => y.values[0] === selectedYear);
    const yearValues = yearOption?.values ?? [selectedYear];

    // Try each possible year value format
    const { data, error } = await supabase
      .from('profiles')
      .select('id, roll_number, first_name, last_name')
      .eq('role', 'STUDENT')
      .eq('department_id', selectedDepartmentId)
      .in('year', yearValues)
      .order('roll_number');

    if (error) {
      toast.error('Failed to load students: ' + error.message);
      setStudents([]);
      setMarksData([]);
    } else {
      setStudents(data as StudentProfile[]);
      setMarksData((data as StudentProfile[]).map(s => ({
        student_id: s.id,
        roll_number: s.roll_number ?? '',
        name: `${s.first_name ?? ''} ${s.last_name ?? ''}`.trim(),
        marks: '',
      })));

      if (data.length === 0) {
        toast.info('No students found for this class. Check department and year selection.');
      }
    }
    setLoadingStudents(false);
  };

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksData(prev =>
      prev.map(s => s.student_id === studentId ? { ...s, marks: value } : s)
    );
  };

  // Filtered list based on search
  const filteredMarksData = useMemo(() => {
    if (!search.trim()) return marksData;
    const q = search.toLowerCase();
    return marksData.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.roll_number.toLowerCase().includes(q)
    );
  }, [marksData, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartmentId || !selectedYear || !selectedCourseId) {
      toast.error('Please select department, year, and course.');
      return;
    }
    if (marksData.length === 0) {
      toast.error('No students found to upload marks for.');
      return;
    }

    setSubmitting(true);
    const marksToInsert = marksData
      .filter(e => e.marks !== '' && e.marks !== null)
      .map(e => {
        const score = parseFloat(e.marks);
        let grade = 'F';
        if (!isNaN(score)) {
          if (score >= 90) grade = 'A+';
          else if (score >= 80) grade = 'A';
          else if (score >= 70) grade = 'B+';
          else if (score >= 60) grade = 'B';
          else if (score >= 50) grade = 'C+';
          else if (score >= 40) grade = 'C';
        }
        return { student_id: e.student_id, course_id: selectedCourseId, marks: score, grade };
      });

    if (marksToInsert.length === 0) {
      toast.info('No marks entered to upload.');
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('marks')
      .upsert(marksToInsert, { onConflict: 'student_id,course_id' });

    if (error) {
      toast.error('Failed to upload marks: ' + error.message);
    } else {
      const courseName = courses.find(c => c.id === selectedCourseId)?.name ?? '';
      toast.success(`Marks uploaded for ${marksToInsert.length} students — ${courseName}`);
      setMarksData(prev => prev.map(s => ({ ...s, marks: '' })));
    }
    setSubmitting(false);
  };

  const filledCount = marksData.filter(s => s.marks !== '').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Upload Marks"
          description="Select the class and subject, then enter marks for each student."
        />
        <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Enter Student Marks</CardTitle>
            <CardDescription>Select department, year, and course — then enter marks.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/50">
                {/* Department */}
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select onValueChange={v => { setSelectedDepartmentId(v); setSelectedYear(''); }} value={selectedDepartmentId} disabled={loadingDepts}>
                    <SelectTrigger id="department" className="mt-1">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Year */}
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select onValueChange={setSelectedYear} value={selectedYear} disabled={!selectedDepartmentId}>
                    <SelectTrigger id="year" className="mt-1">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {YEAR_OPTIONS.map(y => (
                        <SelectItem key={y.values[0]} value={y.values[0]}>{y.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Course */}
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select onValueChange={setSelectedCourseId} value={selectedCourseId} disabled={!selectedDepartmentId || loadingCourses}>
                    <SelectTrigger id="course" className="mt-1">
                      <SelectValue placeholder={!selectedDepartmentId ? 'Select Dept First' : loadingCourses ? 'Loading...' : 'Select Subject'} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name} ({course.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Student list */}
              {selectedDepartmentId && selectedYear && (
                <div className="space-y-3">
                  {/* Search bar */}
                  {students.length > 0 && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or roll number..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  )}

                  {/* Status bar */}
                  {students.length > 0 && selectedCourseId && (
                    <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                      <span>{students.length} students · {filteredMarksData.length} shown</span>
                      <span className="font-medium text-foreground">{filledCount} marks entered</span>
                    </div>
                  )}

                  {loadingStudents ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : students.length > 0 ? (
                    selectedCourseId ? (
                      <div className="overflow-x-auto border rounded-md shadow-sm">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/20">
                              <TableHead className="font-semibold">Roll No.</TableHead>
                              <TableHead className="font-semibold">Name</TableHead>
                              <TableHead className="text-center font-semibold">Marks (0–100)</TableHead>
                              <TableHead className="text-center font-semibold">Grade</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredMarksData.length > 0 ? filteredMarksData.map(student => {
                              const score = parseFloat(student.marks);
                              const grade = isNaN(score) ? '—'
                                : score >= 90 ? 'A+'
                                : score >= 80 ? 'A'
                                : score >= 70 ? 'B+'
                                : score >= 60 ? 'B'
                                : score >= 50 ? 'C+'
                                : score >= 40 ? 'C' : 'F';
                              return (
                                <TableRow key={student.student_id} className="hover:bg-muted/50">
                                  <TableCell className="font-mono text-sm">{student.roll_number || '—'}</TableCell>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell className="text-center">
                                    <Input
                                      type="number" min="0" max="100"
                                      value={student.marks}
                                      onChange={e => handleMarkChange(student.student_id, e.target.value)}
                                      className="w-24 text-center mx-auto"
                                      disabled={submitting}
                                      placeholder="—"
                                    />
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className={[
                                      'text-xs font-bold px-2 py-0.5 rounded-full',
                                      grade === 'F' ? 'bg-red-100 text-red-700' :
                                      grade === 'A+' ? 'bg-emerald-100 text-emerald-700' :
                                      'bg-blue-100 text-blue-700'
                                    ].join(' ')}>
                                      {grade}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              );
                            }) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                  No students match "{search}"
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-6 border rounded-md">
                        {students.length} students loaded — select a course to enter marks
                      </div>
                    )
                  ) : (
                    <div className="text-center text-muted-foreground py-6 border rounded-md">
                      No students found for this department and year
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold"
                disabled={submitting || filledCount === 0 || !selectedCourseId}
              >
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</>
                  : `Upload Marks (${filledCount} students)`
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default UploadMarks;