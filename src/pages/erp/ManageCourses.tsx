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
import { Loader2 } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  code: string;
  department_id: string;
  credits: number;
  departments?: { name: string };
}

const ManageCourses: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseDepartmentId, setNewCourseDepartmentId] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    setLoadingCourses(true);
    const { data, error } = await supabase
      .from('courses')
      .select(`*, departments(name)`)
      .order('name');

    if (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses: ' + error.message);
    } else {
      setCourses((data ?? []) as unknown as Course[]);
    }
    setLoadingCourses(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseCode.trim() || !newCourseDepartmentId || !newCourseCredits) {
      toast.error('Please fill all fields.');
      return;
    }
    setIsSubmitting(true);

    const { error } = await supabase.from('courses').insert([{
      name: newCourseName.trim(),
      code: newCourseCode.trim().toUpperCase(),
      department_id: newCourseDepartmentId,
      credits: parseInt(newCourseCredits),
    }]);

    if (error) {
      toast.error('Failed to add course: ' + error.message);
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
    if (!confirm(`Delete course '${name}'?`)) return;

    // Optimistic remove
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeletingId(id);

    const { error } = await supabase.from('courses').delete().eq('id', id);

    if (error) {
      toast.error('Failed to delete course: ' + error.message);
      fetchCourses(); // rollback
    } else {
      toast.success(`Course '${name}' deleted.`);
    }
    setDeletingId(null);
  };

  return (
    // FIX: removed userRole prop — MainLayout reads role from useSession internally
    <MainLayout>
      <div className="space-y-6">
        <PageHeader
          title="Manage Courses"
          description="Add, view, and remove courses offered by the college."
        />
        <Card className="max-w-5xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Academic Courses</CardTitle>
            <CardDescription>Add, view, and remove courses offered by the college.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add form */}
            <form onSubmit={handleAddCourse} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-md bg-muted/50">
              <div>
                <Label htmlFor="newCourseName">Course Name</Label>
                <Input
                  id="newCourseName" type="text" placeholder="e.g., Data Structures"
                  value={newCourseName} onChange={e => setNewCourseName(e.target.value)}
                  required disabled={isSubmitting} className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newCourseCode">Course Code</Label>
                <Input
                  id="newCourseCode" type="text" placeholder="e.g., CS201"
                  value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)}
                  required disabled={isSubmitting} className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newCourseDept">Department</Label>
                <Select onValueChange={setNewCourseDepartmentId} value={newCourseDepartmentId}>
                  <SelectTrigger id="newCourseDept" className="mt-1">
                    <SelectValue placeholder={loadingDepts ? 'Loading...' : 'Select Department'} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="newCourseCredits">Credits</Label>
                <Input
                  id="newCourseCredits" type="number" min="1" max="6" placeholder="e.g., 3"
                  value={newCourseCredits} onChange={e => setNewCourseCredits(e.target.value)}
                  required disabled={isSubmitting} className="mt-1"
                />
              </div>
              <div className="md:col-span-4">
                <Button type="submit" className="w-full font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Adding...</> : 'Add Course'}
                </Button>
              </div>
            </form>

            {/* Table */}
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
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : courses.length > 0 ? (
                    courses.map(course => (
                      <TableRow key={course.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{course.name}</TableCell>
                        <TableCell>{course.code}</TableCell>
                        <TableCell>{course.departments?.name ?? 'Unknown'}</TableCell>
                        <TableCell className="text-right">{course.credits}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive" size="sm"
                            disabled={deletingId === course.id}
                            onClick={() => handleDeleteCourse(course.id, course.name)}
                          >
                            {deletingId === course.id
                              ? <Loader2 className="h-3 w-3 animate-spin" />
                              : 'Delete'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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