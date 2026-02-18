"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '@/components/layout/PageHeader';

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
  employee_id: string | null;
  roll_number: string | null;
  department_id: string | null;
  year: string | null;
  designation: string | null;
  avatar_url: string | null;
  departments?: {
    name: string;
  };
}

const ManageUsers: React.FC = () => {
  const { userRole: contextUserRole, loading: sessionLoading } = useSession();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionLoading) {
      fetchUsers();
    }
  }, [sessionLoading]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        username,
        email,
        role,
        employee_id,
        roll_number,
        department_id,
        year,
        designation,
        avatar_url,
        departments (
          name
        )
      `)
      .order('role', { ascending: true })
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users.', { description: error.message });
      setUsers([]);
    } else {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user '${userName}'? This action cannot be undone.`)) {
      return;
    }

    const loadingToastId = toast.loading(`Deleting user ${userName}...`);
    try {
      const { error } = await supabase.rpc('delete_user_and_profile', { user_id_to_delete: userId });

      if (error) {
        throw error;
      }

      toast.success(`User '${userName}' deleted successfully.`, { id: loadingToastId });
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.', { id: loadingToastId, description: error.message });
    }
  };

  const handleEdit = (userId: string) => {
    navigate(`/erp/edit-user/${userId}`);
  };

  if (sessionLoading) {
    return (
      <MainLayout userRole={contextUserRole}>
        <div className="text-center text-muted-foreground">Loading user session...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={contextUserRole}>
      <div className="space-y-6">
        <PageHeader
          title="Manage Users"
          description="View and manage all user accounts in the ERP system."
        />
        <Card className="shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">All System Users</CardTitle>
            <CardDescription className="text-muted-foreground">Add, edit, or delete user accounts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <Button asChild className="py-2 text-base font-semibold">
                <Link to="/erp/add-teacher">Add New Teacher</Link>
              </Button>
              <Button asChild className="py-2 text-base font-semibold">
                <Link to="/erp/add-student">Add New Student</Link>
              </Button>
            </div>

            <div className="overflow-x-auto border rounded-md shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Identifier</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                        <TableCell>{user.role?.replace('_', ' ')}</TableCell>
                        <TableCell>{user.email || 'N/A'}</TableCell>
                        <TableCell>{user.roll_number || user.employee_id || user.username || 'N/A'}</TableCell>
                        <TableCell>{user.departments?.name || 'N/A'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(user.id)}>Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id, user.first_name || user.username || user.email || 'Unknown User')}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                        No users found.
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

export default ManageUsers;