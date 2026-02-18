import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Course {
    id: string;
    name: string;
    code: string;
    department_id: string;
    credits: number;
}

export const useCourses = (departmentId?: string) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('courses')
                .select('*')
                .order('name', { ascending: true });

            if (departmentId) {
                query = query.eq('department_id', departmentId);
            }

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            setCourses(data || []);
        } catch (error: any) {
            console.error('Error fetching courses:', error);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return { courses, loading, refreshCourses: fetchCourses };
};