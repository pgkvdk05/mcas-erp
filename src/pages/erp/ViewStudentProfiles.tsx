"use client";

import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments } from '@/hooks/useDepartments';
import PageHeader from '@/components/layout/PageHeader';
import { Loader2, User, BookOpen, MapPin, GraduationCap } from 'lucide-react';

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  roll_number: string;
  department_id: string;
  year: string;
  email: string;
  username: string;
  employee_id: string;
  designation: string;
  avatar_url: string;
  address: string;
  house_no: string;
  street_name: string;
  area_name: string;
  city_name: string;
  district_name: string;
  state_name: string;
  country_name: string;
  tenth_school_name: string;
  tenth_mark_score: number;
  twelfth_school_name: string;
  twelfth_mark_score: number;
  highest_degree: string;
  departments?: { name: string };
}

// ─── Detail row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 py-1.5 border-b border-muted last:border-0">
      <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

// ─── Student detail modal ─────────────────────────────────────────────────────
function StudentDetailModal({
  student,
  deptName,
  onClose,
}: {
  student: StudentProfile | null;
  deptName: string;
  onClose: () => void;
}) {
  if (!student) return null;

  const fullAddress = [student.house_no, student.street_name, student.area_name, student.city_name, student.district_name, student.state_name, student.country_name]
    .filter(Boolean).join(', ');

  const yearLabel = student.year === '1' ? '1st Year' : student.year === '2' ? '2nd Year' : student.year === '3' ? '3rd Year' : student.year;

  return (
    <Dialog open={!!student} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
              {student.first_name?.charAt(0)}{student.last_name?.charAt(0)}
            </div>
            <div>
              <p className="text-base font-semibold">{student.first_name} {student.last_name}</p>
              <p className="text-xs text-muted-foreground font-normal">{student.roll_number}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Class info */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary">{deptName}</Badge>
            <Badge variant="outline">{yearLabel}</Badge>
          </div>

          {/* Basic info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <User className="h-3 w-3" /> Basic Information
            </p>
            <DetailRow label="Full Name" value={`${student.first_name} ${student.last_name}`} />
            <DetailRow label="Roll Number" value={student.roll_number} />
            <DetailRow label="Username" value={student.username} />
            <DetailRow label="Email" value={student.email} />
          </div>

          {/* Academic info */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <GraduationCap className="h-3 w-3" /> Academic Details
            </p>
            <DetailRow label="Department" value={deptName} />
            <DetailRow label="Year" value={yearLabel} />
            <DetailRow label="Highest Degree" value={student.highest_degree} />
          </div>

          {/* Education history */}
          {(student.tenth_school_name || student.twelfth_school_name) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Education History
              </p>
              <DetailRow label="10th School" value={student.tenth_school_name} />
              <DetailRow label="10th Score" value={student.tenth_mark_score ? `${student.tenth_mark_score}%` : null} />
              <DetailRow label="12th School" value={student.twelfth_school_name} />
              <DetailRow label="12th Score" value={student.twelfth_mark_score ? `${student.twelfth_mark_score}%` : null} />
            </div>
          )}

          {/* Address */}
          {fullAddress && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Address
              </p>
              <p className="text-sm text-foreground">{fullAddress}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const ViewStudentProfiles: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

  useEffect(() => { fetchStudentProfiles(); }, [filterDepartment, filterYear]);

  const fetchStudentProfiles = async () => {
    setLoadingProfiles(true);
    let query = supabase
      .from('profiles')
      .select(`
        id, first_name, last_name, roll_number, department_id, year, email,
        username, employee_id, designation, avatar_url, address,
        house_no, street_name, area_name, city_name, district_name,
        state_name, country_name, tenth_school_name, tenth_mark_score,
        twelfth_school_name, twelfth_mark_score, highest_degree,
        departments (name)
      `)
      .eq('role', 'STUDENT')
      .order('roll_number', { ascending: true });

    if (filterDepartment !== 'all') query = query.eq('department_id', filterDepartment);
    if (filterYear !== 'all') query = query.eq('year', filterYear);

    const { data, error } = await query;
    if (error) {
      toast.error('Failed to load student profiles: ' + error.message);
      setStudentProfiles([]);
    } else {
      setStudentProfiles((data ?? []) as unknown as StudentProfile[]);
    }
    setLoadingProfiles(false);
  };

  const getDeptName = (student: StudentProfile) =>
    departments.find(d => d.id === student.department_id)?.name ??
    (student.departments?.name ?? 'N/A');

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageHeader title="View Student Profiles" description="Browse student profiles by class." />

        <Card className="max-w-6xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Student Directory</CardTitle>
            <CardDescription>Browse and view full student profiles.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 border rounded-md bg-muted/50">
              <div>
                <Label>Department</Label>
                <Select onValueChange={setFilterDepartment} value={filterDepartment} disabled={loadingDepts}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Year</Label>
                <Select onValueChange={setFilterYear} value={filterYear}>
                  <SelectTrigger className="mt-1">
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

            {/* Table */}
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
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : studentProfiles.length > 0 ? (
                    studentProfiles.map(student => (
                      <TableRow key={student.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                        <TableCell className="font-mono text-sm">{student.roll_number}</TableCell>
                        <TableCell>{getDeptName(student)} {student.year ? `(Year ${student.year})` : ''}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setSelectedStudent(student)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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

      {/* Detail modal */}
      <StudentDetailModal
        student={selectedStudent}
        deptName={selectedStudent ? getDeptName(selectedStudent) : ''}
        onClose={() => setSelectedStudent(null)}
      />
    </MainLayout>
  );
};

export default ViewStudentProfiles;