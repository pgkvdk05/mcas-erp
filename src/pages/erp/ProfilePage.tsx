"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/components/auth/useSession';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess } from '@/utils/toast';
import { Pencil, X, Check, Loader2 } from 'lucide-react';

interface ProfilePageProps {
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
  role: string | null;
  employee_id: string | null;
  roll_number: string | null;
  department_id: string | null;
  year: string | null;
  designation: string | null;
  avatar_url: string | null;
  area_name: string | null;
  house_no: string | null;
  street_name: string | null;
  city_name: string | null;
  district_name: string | null;
  state_name: string | null;
  country_name: string | null;
  tenth_school_name: string | null;
  tenth_mark_score: number | null;
  twelfth_school_name: string | null;
  twelfth_mark_score: number | null;
  highest_degree: string | null;
}

// ─── Editable field ───────────────────────────────────────────────────────────
function EditableField({
  label,
  value,
  field,
  type = 'text',
  onSave,
  readOnly = false,
}: {
  label: string;
  value: string | number | null;
  field: string;
  type?: string;
  onSave: (field: string, value: string) => Promise<void>;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(value ?? ''));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(field, val);
    setSaving(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setVal(String(value ?? ''));
    setEditing(false);
  };

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2 mt-1">
        {editing ? (
          <>
            <Input
              type={type}
              value={val}
              onChange={e => setVal(e.target.value)}
              className="flex-1"
              autoFocus
              disabled={saving}
            />
            <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 shrink-0" onClick={handleCancel} disabled={saving}>
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <Input
              value={String(value ?? '')}
              readOnly
              className="flex-1 bg-muted/50 border-none"
            />
            {!readOnly && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => { setVal(String(value ?? '')); setEditing(true); }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 mt-6 border-t pt-6">
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user, loading: sessionLoading } = useSession();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || sessionLoading) { setLoadingProfile(false); return; }
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*, departments(name)')
        .eq('id', user.id)
        .single();

      if (error) {
        showError('Failed to load profile data.');
        setProfileData(null);
      } else if (data) {
        setProfileData(data as UserProfile);
        setDepartmentName((data.departments as any)?.name ?? null);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [user, sessionLoading]);

  const handleSave = async (field: string, value: string) => {
    if (!user) return;
    const updateValue = field.includes('score') ? parseInt(value) || null : value || null;
    const { error } = await supabase
      .from('profiles')
      .update({ [field]: updateValue, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      showError('Failed to update: ' + error.message);
    } else {
      showSuccess('Updated successfully!');
      setProfileData(prev => prev ? { ...prev, [field]: updateValue } : prev);
    }
  };

  if (sessionLoading || loadingProfile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!user || !profileData) {
    return (
      <MainLayout>
        <div className="text-center text-destructive py-10">
          No profile data found. Please ensure you are logged in.
        </div>
      </MainLayout>
    );
  }

  const isStudent = profileData.role === 'STUDENT';
  const isTeacher = profileData.role === 'TEACHER';
  const isAdmin = profileData.role === 'ADMIN' || profileData.role === 'SUPER_ADMIN';

  return (
    <MainLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-primary">My Profile</h2>

        <Card className="shadow-lg rounded-lg">
          {/* Avatar header */}
          <CardHeader className="flex flex-col items-center text-center p-6">
            <Avatar className="h-24 w-24 mb-3 border-2 border-primary">
              <AvatarImage
                src={profileData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.first_name || 'U'}`}
                alt={profileData.first_name || 'User'}
              />
              <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                {(profileData.first_name || 'U').charAt(0)}{(profileData.last_name || '').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl font-extrabold text-primary">
              {profileData.first_name} {profileData.last_name}
            </CardTitle>
            <p className="text-muted-foreground capitalize">{profileData.role?.replace('_', ' ')}</p>
          </CardHeader>

          <CardContent className="p-6 space-y-2">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EditableField label="First Name" value={profileData.first_name} field="first_name" onSave={handleSave} />
              <EditableField label="Last Name" value={profileData.last_name} field="last_name" onSave={handleSave} />
              <EditableField label="Username" value={profileData.username} field="username" onSave={handleSave} />
              <EditableField label="Email" value={profileData.email || user.email || ''} field="email" onSave={handleSave} readOnly />
              {profileData.roll_number && (
                <EditableField label="Roll Number" value={profileData.roll_number} field="roll_number" onSave={handleSave} readOnly />
              )}
              {profileData.employee_id && (
                <EditableField label="Employee ID" value={profileData.employee_id} field="employee_id" onSave={handleSave} readOnly />
              )}
              {departmentName && (
                <EditableField label="Department" value={departmentName} field="department" onSave={handleSave} readOnly />
              )}
              {profileData.year && (
                <EditableField label="Year" value={profileData.year} field="year" onSave={handleSave} readOnly />
              )}
              {profileData.designation && (
                <EditableField label="Designation" value={profileData.designation} field="designation" onSave={handleSave} />
              )}
            </div>

            {/* Student sections */}
            {isStudent && (
              <>
                <Section title="Contact Information">
                  <EditableField label="City" value={profileData.city_name} field="city_name" onSave={handleSave} />
                  <EditableField label="District" value={profileData.district_name} field="district_name" onSave={handleSave} />
                  <EditableField label="State" value={profileData.state_name} field="state_name" onSave={handleSave} />
                  <EditableField label="Country" value={profileData.country_name} field="country_name" onSave={handleSave} />
                  <EditableField label="House No." value={profileData.house_no} field="house_no" onSave={handleSave} />
                  <EditableField label="Street" value={profileData.street_name} field="street_name" onSave={handleSave} />
                  <EditableField label="Area" value={profileData.area_name} field="area_name" onSave={handleSave} />
                </Section>

                <Section title="Academic Details">
                  <EditableField label="10th School Name" value={profileData.tenth_school_name} field="tenth_school_name" onSave={handleSave} />
                  <EditableField label="10th Mark Score" value={profileData.tenth_mark_score} field="tenth_mark_score" type="number" onSave={handleSave} />
                  <EditableField label="12th School Name" value={profileData.twelfth_school_name} field="twelfth_school_name" onSave={handleSave} />
                  <EditableField label="12th Mark Score" value={profileData.twelfth_mark_score} field="twelfth_mark_score" type="number" onSave={handleSave} />
                  <EditableField label="Highest Degree" value={profileData.highest_degree} field="highest_degree" onSave={handleSave} />
                </Section>
              </>
            )}

            {/* Teacher sections */}
            {isTeacher && (
              <Section title="Professional Details">
                <EditableField label="Highest Degree" value={profileData.highest_degree} field="highest_degree" onSave={handleSave} />
                <EditableField label="City" value={profileData.city_name} field="city_name" onSave={handleSave} />
                <EditableField label="State" value={profileData.state_name} field="state_name" onSave={handleSave} />
              </Section>
            )}

            {/* Admin sections */}
            {isAdmin && (
              <Section title="Contact Details">
                <EditableField label="City" value={profileData.city_name} field="city_name" onSave={handleSave} />
                <EditableField label="State" value={profileData.state_name} field="state_name" onSave={handleSave} />
              </Section>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;