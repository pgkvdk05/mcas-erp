"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { toast } from 'sonner';
import PageHeader from '@/components/layout/PageHeader';

interface TeacherClass {
  id: string;
  name: string;
  code: string;
  credits: number;
  departments?: {
    name: string;
    code: string;
  };
}

const ViewMyClasses: React.FC = () => {
  const { user, userRole, loading: sessionLoading } = useSession();
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [teacherDepartmentId, setTeacherDepartmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (sessionLoading || !user || userRole !== 'TEACHER') {
        setLoadingClasses(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('department_id')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching teacher profile:', profileError);
        toast.error('Failed to load teacher department information.');
        setLoadingClasses(false);
        return;
      }

      if (profile?.department_id) {
        setTeacherDepartmentId(profile.department_id);
      } else {
        toast.info('No department assigned to your profile.');
        setLoadingClasses(false);
      }
    };

    fetchTeacherProfile();
  }, [user, userRole, sessionLoading]);

  useEffect(() => {
    const fetchClasses = async () => {
      if (!teacherDepartmentId) {
        setLoadingClasses(false);
        return;
      }

      setLoadingClasses(true);
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          name,
          code,
          credits,
          departments (
            name,
            code
          )
        `)
        .eq('department_id', teacherDepartmentId)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching teacher classes:', error);
        toast.error('Failed to load your classes.');
        setTeacherClasses([]);
      } else {
        setTeacherClasses(data as unknown as TeacherClass[]);
      }
      setLoadingClasses(false);
    };

    if (teacherDepartmentId) {
      fetchClasses();
    }
  }, [teacherDepartmentId]);

  if (sessionLoading || loadingClasses) {
    return (
      <MainLayout userRole="TEACHER">
        <div className="text-center text-muted-foreground">Loading classes...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="TEACHER">
      <div className="space-y-6">
        <PageHeader
          title="My Classes"
          description="Overview of the classes and subjects you are currently teaching."
        />
        <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Assigned Classes</CardTitle>
            <CardDescription className="text-muted-foreground">Overview of the classes and subjects you are currently teaching.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Course Name</TableHead>
                    <TableHead className="font-semibold">Course Code</TableHead>
                    <TableHead className="text-right font-semibold">Credits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teacherClasses.length > 0 ? (
                    teacherClasses.map((cls) => (
                      <TableRow key={cls.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{cls.departments?.name || 'N/A'}</TableCell>
                        <TableCell>{cls.name}</TableCell>
                        <TableCell><Badge variant="secondary">{cls.code}</Badge></TableCell>
                        <TableCell className="text-right">{cls.credits}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No classes assigned yet or no department linked to your profile.
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

export default ViewMyClasses;