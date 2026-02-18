"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import PageHeader from '@/components/layout/PageHeader';

interface Department {
  id: string;
  name: string;
  code: string;
}

const ManageDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentCode, setNewDepartmentCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('departments')
      .select('id, name, code')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments.', { description: error.message });
      setDepartments([]);
    } else {
      setDepartments(data as Department[]);
    }
    setLoading(false);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDepartmentName.trim() || !newDepartmentCode.trim()) {
      toast.error('Please enter both department name and code.');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase
      .from('departments')
      .insert([{ name: newDepartmentName.trim(), code: newDepartmentCode.trim().toUpperCase() }])
      .select();

    if (error) {
      console.error('Error adding department:', error);
      toast.error('Failed to add department.', { description: error.message });
    } else if (data && data.length > 0) {
      toast.success(`Department '${newDepartmentName}' added successfully.`);
      setNewDepartmentName('');
      setNewDepartmentCode('');
      fetchDepartments();
    }
    setIsSubmitting(false);
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department '${name}'? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      toast.error('Failed to delete department.', { description: error.message });
    } else {
      toast.info(`Department '${name}' deleted.`);
      fetchDepartments();
    }
  };

  return (
    <MainLayout userRole="SUPER_ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Manage Departments"
          description="Add, view, and remove academic departments."
        />
        <Card className="max-w-4xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">College Departments</CardTitle>
            <CardDescription className="text-muted-foreground">Add, view, and remove academic departments.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddDepartment} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-muted/50">
              <div className="md:col-span-1">
                <Label htmlFor="newDepartmentName" className="text-sm font-medium">Department Name</Label>
                <Input
                  id="newDepartmentName"
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={newDepartmentName}
                  onChange={(e) => setNewDepartmentName(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-1">
                <Label htmlFor="newDepartmentCode" className="text-sm font-medium">Department Code</Label>
                <Input
                  id="newDepartmentCode"
                  type="text"
                  placeholder="e.g., CS"
                  value={newDepartmentCode}
                  onChange={(e) => setNewDepartmentCode(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-1 flex items-end">
                <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Department'}
                </Button>
              </div>
            </form>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Department Name</TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        Loading departments...
                      </TableCell>
                    </TableRow>
                  ) : departments.length > 0 ? (
                    departments.map((dept) => (
                      <TableRow key={dept.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{dept.name}</TableCell>
                        <TableCell>{dept.code}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        No departments added yet.
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

export default ManageDepartments;