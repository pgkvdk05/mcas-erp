"use client";

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, BookUser, GraduationCap, Building2, BookOpen, DollarSign, CalendarCheck,
  User
} from 'lucide-react';
import { useSession } from '@/components/auth/useSession';
import { supabase } from '@/integrations/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  name: string;
  href: string;
  icon?: React.ElementType;
  variant?: string;
};

interface DashboardPageProps {
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface LiveStats {
  totalUsers: number;
  totalDepartments: number;
  totalCourses: number;
  newCoursesSemester: number;
  pendingOD: number;
}

// ─── Semester helper ──────────────────────────────────────────────────────────

function getSemesterStart(): string {
  const now = new Date();
  const m = now.getMonth();
  const semStart =
    m >= 5 && m <= 10
      ? new Date(now.getFullYear(), 5, 1)
      : m === 11
      ? new Date(now.getFullYear(), 11, 1)
      : new Date(now.getFullYear() - 1, 11, 1);
  return semStart.toISOString();
}

// ─── Live stats hook ──────────────────────────────────────────────────────────

function useLiveStats() {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const [
      { count: totalUsers },
      { count: totalDepartments },
      { count: totalCourses },
      { count: newCoursesSemester },
      { count: pendingOD },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('departments').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }),
      supabase.from('courses').select('*', { count: 'exact', head: true }).gte('created_at', getSemesterStart()),
      supabase.from('od_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    ]);
    setStats({
      totalUsers: totalUsers ?? 0,
      totalDepartments: totalDepartments ?? 0,
      totalCourses: totalCourses ?? 0,
      newCoursesSemester: newCoursesSemester ?? 0,
      pendingOD: pendingOD ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    fetch();

    const ch = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'od_requests' }, fetch)
      .subscribe();

    return () => { supabase.removeChannel(ch); };
  }, []);

  return { stats, loading };
}

// ─── Stats card ───────────────────────────────────────────────────────────────

function LiveStatCard({
  title,
  value,
  trend,
  icon: Icon,
  href,
  loading,
  urgent,
}: {
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  href: string;
  loading: boolean;
  urgent?: boolean;
}) {
  const isAlert = urgent && value !== '0';
  return (
    <Link to={href} className="block">
      <Card
        className={[
          'hover:shadow-xl transition-all duration-200 cursor-pointer h-full',
          isAlert ? 'border-red-300 bg-red-50' : 'hover:border-primary',
        ].join(' ')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {isAlert ? (
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
              <Icon className="relative h-4 w-4 text-red-500" />
            </span>
          ) : (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <>
              <div className="h-7 w-16 animate-pulse rounded bg-muted mb-1" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </>
          ) : (
            <>
              <div className={['text-2xl font-bold', isAlert ? 'text-red-600' : ''].join(' ')}>
                {value}
              </div>
              <p className={['text-xs', isAlert ? 'text-red-500' : 'text-muted-foreground'].join(' ')}>
                {trend}
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Dashboard config (static sections only) ──────────────────────────────────

const dashboardConfig = {
  ADMIN: {
    title: 'Admin Dashboard',
    sections: [
      {
        title: 'User Management',
        description: 'Manage all user accounts and roles within the ERP system.',
        type: 'links',
        items: [
          { name: 'My Profile', href: '/profile/admin', icon: User },
          { name: 'Add New Teacher', href: '/erp/add-teacher', icon: BookUser },
          { name: 'Add New Student', href: '/erp/add-student', icon: GraduationCap },
          { name: 'View & Manage All Users', href: '/erp/manage-users', icon: Users, variant: 'outline' },
        ],
      },
      {
        title: 'Academic & Financial Configuration',
        description: 'Configure departments, courses, and manage financial records.',
        type: 'links',
        items: [
          { name: 'Manage Departments', href: '/erp/manage-departments', icon: Building2 },
          { name: 'Manage Subjects', href: '/erp/manage-courses', icon: BookOpen },
          { name: 'Manage All Fees', href: '/erp/fees-records', icon: DollarSign, variant: 'outline' },
          { name: 'Approve OD Requests', href: '/erp/od/approve', icon: CalendarCheck, variant: 'outline' },
        ],
      },
    ],
  },
  TEACHER: {
    title: 'Teacher Dashboard',
    sections: [
      {
        title: 'Personal',
        description: 'View and manage your personal profile.',
        type: 'links',
        items: [{ name: 'My Profile', href: '/profile/teacher', icon: User }],
      },
      {
        title: 'Academic Management',
        description: '',
        type: 'links',
        items: [
          { name: 'Mark Attendance', href: '/erp/attendance/mark' },
          { name: 'Upload Marks', href: '/erp/marks/upload' },
          { name: 'View Attendance', href: '/erp/attendance/all' },
          { name: 'View All Marks', href: '/erp/marks/all' },
          { name: 'Class Chat', href: '/erp/chat/teacher', variant: 'outline' },
          { name: 'Approve OD Requests', href: '/erp/od/approve', variant: 'outline' },
        ],
      },
      {
        title: 'Class & Student Information',
        description: '',
        type: 'links',
        items: [
          { name: 'View My Classes', href: '/erp/teacher/classes' },
          { name: 'View Student Profiles', href: '/erp/teacher/student-profiles', variant: 'outline' },
        ],
      },
    ],
  },
  STUDENT: {
    title: 'Student Dashboard',
    sections: [
      {
        title: 'Personal',
        description: 'View and manage your personal profile.',
        type: 'links',
        items: [{ name: 'My Profile', href: '/profile/student', icon: User }],
      },
      {
        title: 'Student Services',
        description: '',
        type: 'links',
        items: [
          { name: 'View Attendance', href: '/erp/attendance/student' },
          { name: 'View Marks', href: '/erp/marks/student' },
          { name: 'View Fee Status', href: '/erp/fees/student', variant: 'outline' },
          { name: 'Class Chat', href: '/erp/chat/student', variant: 'outline' },
          { name: 'Request OD', href: '/erp/od/request', variant: 'outline' },
        ],
      },
    ],
  },
};

// ─── Main page ────────────────────────────────────────────────────────────────

const DashboardPage: React.FC<DashboardPageProps> = ({ userRole: propUserRole }) => {
  const { userRole: contextUserRole, loading: sessionLoading } = useSession();
  const currentRole = contextUserRole || propUserRole;
  const { stats, loading: statsLoading } = useLiveStats();

  if (sessionLoading) {
    return (
      <MainLayout>
        <div className="text-center text-muted-foreground">Loading dashboard...</div>
      </MainLayout>
    );
  }

  const config = dashboardConfig[currentRole];

  if (!config) {
    return (
      <MainLayout>
        <div className="text-center text-destructive">
          Dashboard configuration not found for role: {currentRole}
        </div>
      </MainLayout>
    );
  }

  // Build live stat items for SUPER_ADMIN
  const liveStatItems = [
    {
      title: 'Total Users',
      value: stats?.totalUsers.toLocaleString() ?? '—',
      trend: 'Registered users',
      icon: Users,
      href: '/erp/manage-users',
      urgent: false,
    },
    {
      title: 'Active Departments',
      value: stats?.totalDepartments.toLocaleString() ?? '—',
      trend: 'All active',
      icon: Building2,
      href: '/erp/manage-departments',
      urgent: false,
    },
    {
      title: 'Total Subjects',
      value: stats?.totalCourses.toLocaleString() ?? '—',
      trend: stats ? `+${stats.newCoursesSemester} new this semester` : '',
      icon: BookOpen,
      href: '/erp/manage-courses',
      urgent: false,
    },
    {
      title: 'Pending OD Requests',
      value: stats?.pendingOD.toLocaleString() ?? '—',
      trend: stats?.pendingOD ? 'Requires immediate action' : 'No pending requests',
      icon: CalendarCheck,
      href: '/erp/od/approve',
      urgent: true,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-primary mb-6">{config.title}</h2>

        {/* ── Live Quick Stats (SUPER_ADMIN only) ───────────────────────── */}
        {(currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN') && (
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-semibold">Quick Stats</CardTitle>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {liveStatItems.map((item) => (
                  <LiveStatCard key={item.title} {...item} loading={statsLoading} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Static sections ───────────────────────────────────────────── */}
        {config.sections.map((section, index) => (
          <Card key={index} className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">{section.title}</CardTitle>
              {section.description && (
                <CardDescription className="text-muted-foreground">
                  {section.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {section.type === 'links' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item, itemIndex) => {
                    const Icon = (item as NavItem).icon;
                    return (
                      <Button
                        key={itemIndex}
                        asChild
                        variant={((item as NavItem).variant as 'default' | 'outline') || 'default'}
                        className="h-12 text-base font-semibold"
                      >
                        <Link to={item.href} className="flex items-center justify-center space-x-2">
                          {Icon && <Icon className="h-5 w-5" />}
                          <span>{item.name}</span>
                        </Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;