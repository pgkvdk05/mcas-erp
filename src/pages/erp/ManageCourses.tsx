"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments } from '@/hooks/useDepartments';
import PageHeader from '@/components/layout/PageHeader';

interface Course {
  id: string;
  name: string;
  code: string;
  department_id: string;
  credits: number;
  departments?: {
    name: string;
  };
}

const ManageCourses: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDepartmentId, setNewCourseDepartmentId] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        departments (
          name
        )
      `)
      .order('name');

    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } else {
      setCourses(data as unknown as Course[]);
    }
    setLoadingCourses(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseCode.trim() || !newCourseDepartmentId || !newCourseCredits) {
      toast.error('Please fill all fields for the new course.');
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from('courses')
      .insert([{
        name: newCourseName.trim(),
        code: newCourseCode.trim().toUpperCase(),
        department_id: newCourseDepartmentId,
        credits: parseInt(newCourseCredits)
      }]);

    if (error) {
      console.error('Error adding course:', error);
      toast.error('Failed to add course.', { description: error.message });
    } else {
      toast.success(`Course '${newCourseName}' added successfully.`);
      setNewCourseName('');
      setNewCourseCode('');
      setNewCourseDepartmentId('');
      setNewCourseCredits('');
      fetchCourses();
    }
    setIsSubmitting(false);
  };

  const handleDeleteCourse = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete course '${name}'?`)) return;

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course.');
    } else {
      toast.info(`Course '${name}' deleted.`);
      fetchCourses();
    }
  };

  return (
    <MainLayout userRole="SUPER_ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Manage Courses"
          description="Add, view, and remove courses offered by the college."
        />
        <Card className="max-w-5xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Academic Courses</CardTitle>
            <CardDescription className="text-muted-foreground">Add, view, and remove courses offered by the college.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-muted/50">
              <div className="md:col-span-1">
                <Label htmlFor="newCourseName" className="text-sm font-medium">Course Name</Label>
                <Input
                  id="newCourseName"
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="newCourseCode" className="text-sm font-medium">Course Code</Label>
                <Input
                  id="newCourseCode"
                  type="text"
                  placeholder="e.g., CS201"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="newCourseDepartment" className="text-sm font-medium">Department</Label>
                <Select onValueChange={setNewCourseDepartmentId} value={newCourseDepartmentId} required>
                  <SelectTrigger id="newCourseDepartment" className="mt-1" disabled={loadingDepts}>
                    <SelectValue placeholder={loadingDepts ? 'Loading departments...' : 'Select Department (CODE — Name)'} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.length === 0 && !loadingDepts ? (
                      <SelectItem value="" disabled>No departments available</SelectItem>
                    ) : (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{`${dept.code} — ${dept.name}`}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="newCourseCredits" className="text-sm font-medium">Credits</Label>
                <Input
                  id="newCourseCredits"
                  type="number"
                  min="1"
                  max="6"
                  placeholder="e.g., 3"
                  value={newCourseCredits}
                  onChange={(e) => setNewCourseCredits(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-4">
                <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Course'}
                </Button>
              </div>
            </form>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Course Name</TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="text-right font-semibold">Credits</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingCourses ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">Loading courses...</TableCell>
                    </TableRow>
                  ) : courses.length > 0 ? (
                    courses.map((course) => (
                      <TableRow key={course.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.departments?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-right">{course.credits}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                        No courses added yet.
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

export default ManageCourses;