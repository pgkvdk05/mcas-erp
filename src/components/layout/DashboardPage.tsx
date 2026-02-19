"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, BookUser, GraduationCap, Building2, BookOpen, DollarSign, CalendarCheck,
  ClipboardList, FileText, MessageSquareText, LayoutDashboard, User
} from 'lucide-react';
import QuickStartStats from './QuickStartStats';
import { useSession } from '@/components/auth/SessionContextProvider';

interface DashboardPageProps {
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
}

const dashboardConfig = {
  SUPER_ADMIN: {
    title: 'Super Admin Dashboard',
    sections: [
      {
        title: 'Quick Start',
        description: '',
        type: 'quickstart',
      },
      {
        title: 'User Management',
        description: 'Manage all user accounts and roles within the ERP system.',
        type: 'links',
        items: [
          { name: 'My Profile', href: '/profile/super-admin', icon: User },
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
          { name: 'Manage Courses', href: '/erp/manage-courses', icon: BookOpen },
          { name: 'Manage All Fees', href: '/erp/fees-records', icon: DollarSign, variant: 'outline' }, // Updated link
          { name: 'Approve OD Requests', href: '/erp/od/approve', icon: CalendarCheck, variant: 'outline' },
        ],
      },
    ],
  },
  ADMIN: {
    title: 'Admin Dashboard',
    sections: [
      {
        title: 'Personal',
        description: 'View and manage your personal profile.',
        type: 'links',
        items: [
          { name: 'My Profile', href: '/profile/admin', icon: User },
        ],
      },
      {
        title: 'Administrative Tasks',
        description: '',
        type: 'links',
        items: [
          { name: 'Add Teacher', href: '/erp/add-teacher' },
          { name: 'Add Student', href: '/erp/add-student' },
          { name: 'Mark Attendance (Admin override)', href: '/erp/attendance/mark', variant: 'outline' },
          { name: 'Update Fee Status', href: '/erp/fees/admin', variant: 'outline' },
        ],
      },
      {
        title: 'Overview & Approvals',
        description: '',
        type: 'links',
        items: [
          { name: 'View All Attendance', href: '/erp/attendance/all' },
          { name: 'View All Marks', href: '/erp/marks/all' },
          { name: 'Approve OD Requests', href: '/erp/od/approve', variant: 'outline' },
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
        items: [
          { name: 'My Profile', href: '/profile/teacher', icon: User },
        ],
      },
      {
        title: 'Academic Management',
        description: '',
        type: 'links',
        items: [
          { name: 'Mark Attendance', href: '/erp/attendance/mark' },
          { name: 'Upload Marks', href: '/erp/marks/upload' },
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
        items: [
          { name: 'My Profile', href: '/profile/student', icon: User },
        ],
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

const DashboardPage: React.FC<DashboardPageProps> = ({ userRole: propUserRole }) => {
  const { userRole: contextUserRole, loading } = useSession();
  const currentRole = contextUserRole || propUserRole;

  if (loading) {
    return (
      <MainLayout userRole={currentRole}>
        <div className="text-center text-muted-foreground">Loading dashboard...</div>
      </MainLayout>
    );
  }

  const config = dashboardConfig[currentRole];

  if (!config) {
    return (
      <MainLayout userRole={currentRole}>
        <div className="text-center text-destructive">
          Dashboard configuration not found for role: {currentRole}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={currentRole}>
      <div className="space-y-8">
        <h2 className="text-4xl font-bold text-primary mb-6">{config.title}</h2>

        {config.sections.map((section, index) => (
          <Card key={index} className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">{section.title}</CardTitle>
              {section.description && <CardDescription className="text-muted-foreground">{section.description}</CardDescription>}
            </CardHeader>
            <CardContent>
              {section.type === 'quickstart' && (
                <QuickStartStats />
              )}
              {section.type === 'stats' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <Link to={item.href || '#'} key={itemIndex} className="block">
                        <Card className="hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{item.value}</div>
                            <p className="text-xs text-muted-foreground">{item.trend}</p>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
              {section.type === 'links' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    return (
                      <Button key={itemIndex} asChild variant={item.variant || 'default'} className="h-12 text-base font-semibold">
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