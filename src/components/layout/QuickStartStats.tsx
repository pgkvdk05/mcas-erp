"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Users, Building2, BookOpen, CalendarCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const QuickStartStats: React.FC = () => {
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [departmentsCount, setDepartmentsCount] = useState<number | null>(null);
  const [coursesCount, setCoursesCount] = useState<number | null>(null);
  const [pendingOD, setPendingOD] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      setLoading(true);

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: depsCount } = await supabase
        .from('departments')
        .select('*', { count: 'exact', head: true });

      const { count: crsCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      const { count: odCount } = await supabase
        .from('od_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');

      setTotalUsers(usersCount ?? 0);
      setDepartmentsCount(depsCount ?? 0);
      setCoursesCount(crsCount ?? 0);
      setPendingOD(odCount ?? 0);
    } catch (err) {
      console.error('Failed to fetch quick start counts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();

    const channel = supabase.channel('realtime-dashboard');

    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'profiles' },
      () => fetchCounts()
    );

    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'departments' }, () => fetchCounts());
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'courses' }, () => fetchCounts());
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'od_requests' }, () => fetchCounts());

    channel.subscribe();

    return () => {
      // unsubscribe channel
      try {
        // safe remove
        channel.unsubscribe();
      } catch (e) {
        // ignore
      }
    };
  }, [fetchCounts]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Link to="/erp/manage-users" className="block">
        <Card className="hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : totalUsers}</div>
            <p className="text-xs text-muted-foreground">{loading ? '' : '+ realtime'}</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/erp/manage-departments" className="block">
        <Card className="hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : departmentsCount}</div>
            <p className="text-xs text-muted-foreground">{loading ? '' : 'All active'}</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/erp/manage-courses" className="block">
        <Card className="hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : coursesCount}</div>
            <p className="text-xs text-muted-foreground">{loading ? '' : '+ realtime'}</p>
          </CardContent>
        </Card>
      </Link>

      <Link to="/erp/od/approve" className="block">
        <Card className="hover:border-primary hover:shadow-xl transition-all duration-200 cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending OD Requests</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : pendingOD}</div>
            <p className="text-xs text-muted-foreground">{loading ? '' : (pendingOD && pendingOD > 0 ? 'Requires immediate action' : 'All clear')}</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default QuickStartStats;
