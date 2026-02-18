"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { useCourses } from '@/hooks/useCourses';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

interface Student {
  id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
}

const MarkAttendance: React.FC = () => {
  const { departments } = useDepartments();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  const { courses, refreshCourses } = useCourses(selectedDepartmentId);

  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<{ [key: string]: boolean }>({});
  const [absenceReasons, setAbsenceReasons] = useState<{ [key: string]: string }>({});
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
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedDepartmentId, selectedYear]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, roll_number, first_name, last_name')
      .eq('role', 'STUDENT')
      .eq('department_id', selectedDepartmentId)
      .eq('year', selectedYear)
      .order('roll_number');

    if (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students.');
    } else {
      setStudents(data as Student[]);
      const initialAttendance: { [key: string]: boolean } = {};
      data.forEach(student => {
        initialAttendance[student.id] = true;
      });
      setAttendance(initialAttendance);
    }
    setLoadingStudents(false);
  };

  const handleAttendanceChange = (studentId: string, isChecked: boolean) => {
    setAttendance((prev) => ({ ...prev, [studentId]: isChecked }));
    if (isChecked) {
      setAbsenceReasons((prev) => {
        const newState = { ...prev };
        delete newState[studentId];
        return newState;
      });
    }
  };

  const handleReasonChange = (studentId: string, reason: string) => {
    setAbsenceReasons((prev) => ({ ...prev, [studentId]: reason }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedDepartmentId || !selectedYear || !selectedCourseId) {
      toast.error('Please select date, department, year, and course.');
      return;
    }

    if (students.length === 0) {
      toast.error('No students found to mark attendance for.');
      return;
    }

    setSubmitting(true);
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const attendanceRecords = students.map(student => ({
      student_id: student.id,
      course_id: selectedCourseId,
      date: formattedDate,
      status: attendance[student.id] ? 'Present' : 'Absent',
      reason: attendance[student.id] ? null : absenceReasons[student.id] || null,
    }));

    const { error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, { onConflict: 'student_id, course_id, date' });

    if (error) {
      console.error('Error submitting attendance:', error);
      toast.error('Failed to submit attendance.', { description: error.message });
    } else {
      toast.success('Attendance marked successfully!', {
        description: `Date: ${format(selectedDate, 'PPP')}, Students: ${students.length}`,
      });
    }
    setSubmitting(false);
  };

  return (
    <MainLayout userRole="TEACHER">
      <div className="space-y-6">
        <PageHeader
          title="Mark Attendance"
          description="Select the class and mark attendance for students."
        />
        <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Mark Daily Attendance</CardTitle>
            <CardDescription className="text-muted-foreground">Select the class and mark attendance for students.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-muted/50">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                  <Select onValueChange={setSelectedDepartmentId} value={selectedDepartmentId} required>
                    <SelectTrigger id="department" className="mt-1">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
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
                <div>
                  <Label htmlFor="course" className="text-sm font-medium">Course</Label>
                  <Select onValueChange={setSelectedCourseId} value={selectedCourseId} required disabled={!selectedDepartmentId}>
                    <SelectTrigger id="course" className="mt-1">
                      <SelectValue placeholder={!selectedDepartmentId ? "Select Dept First" : "Select Course"} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>{course.name} ({course.code})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDepartmentId && selectedYear && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-primary">Students List</h3>
                  {loadingStudents ? (
                    <div className="text-muted-foreground text-center py-4">Loading students...</div>
                  ) : students.length > 0 ? (
                    <div className="overflow-x-auto border rounded-md shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/20">
                            <TableHead className="font-semibold">Roll Number</TableHead>
                            <TableHead className="font-semibold">Name</TableHead>
                            <TableHead className="text-center font-semibold">Present</TableHead>
                            <TableHead className="font-semibold">Reason (if absent)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {students.map((student) => (
                            <TableRow key={student.id} className="hover:bg-muted/50">
                              <TableCell>{student.roll_number}</TableCell>
                              <TableCell>{student.first_name} {student.last_name}</TableCell>
                              <TableCell className="text-center">
                                <Checkbox
                                  checked={attendance[student.id] || false}
                                  onCheckedChange={(checked) => handleAttendanceChange(student.id, !!checked)}
                                />
                              </TableCell>
                              <TableCell>
                                {!attendance[student.id] && (
                                  <Input
                                    type="text"
                                    placeholder="Reason for absence"
                                    value={absenceReasons[student.id] || ''}
                                    onChange={(e) => handleReasonChange(student.id, e.target.value)}
                                    className="w-full"
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center py-4">No students found matching filters.</div>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={submitting || students.length === 0}>
                {submitting ? 'Submitting...' : 'Submit Attendance'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default MarkAttendance;