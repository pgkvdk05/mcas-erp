"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from '@/components/auth/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { showError } from '@/utils/toast';

interface ProfilePageProps {
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
}

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
  phone_number: string | null;
  parent_phone_number: string | null;
  highest_degree: string | null;
  years_of_experience: number | null;
  specialization: string | null;
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
  const { user, userRole, loading: sessionLoading } = useSession();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || sessionLoading) {
        setLoadingProfile(false);
        return;
      }

      setLoadingProfile(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          departments (
            name
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        showError('Failed to load profile data.');
        setProfileData(null);
        setDepartmentName(null);
      } else if (data) {
        setProfileData(data as UserProfile);
        if (data.departments) {
          setDepartmentName((data.departments as { name: string }).name);
        } else {
          setDepartmentName(null);
        }
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user, sessionLoading]);

  if (sessionLoading || loadingProfile) {
    return (
      <MainLayout userRole={userRole}>
        <div className="text-center text-muted-foreground">Loading profile...</div>
      </MainLayout>
    );
  }

  if (!user || !profileData) {
    return (
      <MainLayout userRole={userRole}>
        <div className="text-center text-destructive">
          No profile data found. Please ensure you are logged in and your profile exists.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole={userRole}>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-primary">My Profile</h2>
        <Card className="max-w-3xl mx-auto shadow-lg rounded-lg">
          <CardHeader className="flex flex-col items-center text-center p-6">
            <Avatar className="h-28 w-28 mb-4 border-2 border-primary">
              <AvatarImage src={profileData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profileData.first_name || profileData.username || 'User'}`} alt={profileData.username || 'User'} />
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">{(profileData.first_name || profileData.username || 'U').substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-extrabold text-primary">{profileData.first_name} {profileData.last_name}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">{profileData.role?.replace('_', ' ')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username" className="text-sm font-medium text-muted-foreground">Username</Label>
                <Input id="username" value={profileData.username || ''} readOnly className="bg-muted/50 border-none mt-1" />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</Label>
                <Input id="email" value={profileData.email || user.email || ''} readOnly className="bg-muted/50 border-none mt-1" />
              </div>
              {profileData.employee_id && (
                <div>
                  <Label htmlFor="employeeId" className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                  <Input id="employeeId" value={profileData.employee_id} readOnly className="bg-muted/50 border-none mt-1" />
                </div>
              )}
              {profileData.roll_number && (
                <div>
                  <Label htmlFor="rollNumber" className="text-sm font-medium text-muted-foreground">Roll Number</Label>
                  <Input id="rollNumber" value={profileData.roll_number} readOnly className="bg-muted/50 border-none mt-1" />
                </div>
              )}
              {departmentName && (
                <div>
                  <Label htmlFor="department" className="text-sm font-medium text-muted-foreground">Department</Label>
                  <Input id="department" value={departmentName} readOnly className="bg-muted/50 border-none mt-1" />
                </div>
              )}
              {profileData.year && (
                <div>
                  <Label htmlFor="year" className="text-sm font-medium text-muted-foreground">Year</Label>
                  <Input id="year" value={profileData.year} readOnly className="bg-muted/50 border-none mt-1" />
                </div>
              )}
              {profileData.designation && (
                <div>
                  <Label htmlFor="designation" className="text-sm font-medium text-muted-foreground">Designation</Label>
                  <Input id="designation" value={profileData.designation} readOnly className="bg-muted/50 border-none mt-1" />
                </div>
              )}
            </div>

            {profileData.role === 'TEACHER' && (
              <div className="space-y-4 mt-6 border-t pt-6">
                <h3 className="text-xl font-semibold text-primary">Professional Details</h3>
                {profileData.phone_number && (
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <Input id="phoneNumber" value={profileData.phone_number} readOnly className="bg-muted/50 border-none mt-1" />
                  </div>
                )}
                {profileData.highest_degree && (
                  <div>
                    <Label htmlFor="highestDegree" className="text-sm font-medium text-muted-foreground">Highest Degree</Label>
                    <Input id="highestDegree" value={profileData.highest_degree} readOnly className="bg-muted/50 border-none mt-1" />
                  </div>
                )}
                {profileData.years_of_experience !== null && (
                  <div>
                    <Label htmlFor="yearsOfExperience" className="text-sm font-medium text-muted-foreground">Years of Experience</Label>
                    <Input id="yearsOfExperience" value={profileData.years_of_experience} readOnly className="bg-muted/50 border-none mt-1" />
                  </div>
                )}
                {profileData.specialization && (
                  <div>
                    <Label htmlFor="specialization" className="text-sm font-medium text-muted-foreground">Specialization</Label>
                    <Input id="specialization" value={profileData.specialization} readOnly className="bg-muted/50 border-none mt-1" />
                  </div>
                )}
              </div>
            )}

            {profileData.role === 'STUDENT' && (
              <>
                <div className="space-y-4 mt-6 border-t pt-6">
                  <h3 className="text-xl font-semibold text-primary">Contact Information</h3>
                  {profileData.phone_number && (
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm font-medium text-muted-foreground">Student Phone Number</Label>
                      <Input id="phoneNumber" value={profileData.phone_number} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.parent_phone_number && (
                    <div>
                      <Label htmlFor="parentPhoneNumber" className="text-sm font-medium text-muted-foreground">Parent Phone Number</Label>
                      <Input id="parentPhoneNumber" value={profileData.parent_phone_number} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 mt-6 border-t pt-6">
                  <h3 className="text-xl font-semibold text-primary">Academic Details</h3>
                  {profileData.tenth_school_name && (
                    <div>
                      <Label htmlFor="tenthSchoolName" className="text-sm font-medium text-muted-foreground">10th School Name</Label>
                      <Input id="tenthSchoolName" value={profileData.tenth_school_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.tenth_mark_score !== null && (
                    <div>
                      <Label htmlFor="tenthMarkScore" className="text-sm font-medium text-muted-foreground">10th Mark Score</Label>
                      <Input id="tenthMarkScore" value={profileData.tenth_mark_score} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.twelfth_school_name && (
                    <div>
                      <Label htmlFor="twelfthSchoolName" className="text-sm font-medium text-muted-foreground">12th School Name</Label>
                      <Input id="twelfthSchoolName" value={profileData.twelfth_school_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.twelfth_mark_score !== null && (
                    <div>
                      <Label htmlFor="twelfthMarkScore" className="text-sm font-medium text-muted-foreground">12th Mark Score</Label>
                      <Input id="twelfthMarkScore" value={profileData.twelfth_mark_score} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                </div>

                <div className="space-y-4 mt-6 border-t pt-6">
                  <h3 className="text-xl font-semibold text-primary">Contact Address</h3>
                  {profileData.house_no && (
                    <div>
                      <Label htmlFor="houseNo" className="text-sm font-medium text-muted-foreground">House No./Building Name</Label>
                      <Input id="houseNo" value={profileData.house_no} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.street_name && (
                    <div>
                      <Label htmlFor="streetName" className="text-sm font-medium text-muted-foreground">Street Name</Label>
                      <Input id="streetName" value={profileData.street_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.city_name && (
                    <div>
                      <Label htmlFor="cityName" className="text-sm font-medium text-muted-foreground">City</Label>
                      <Input id="cityName" value={profileData.city_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.district_name && (
                    <div>
                      <Label htmlFor="districtName" className="text-sm font-medium text-muted-foreground">District</Label>
                      <Input id="districtName" value={profileData.district_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.state_name && (
                    <div>
                      <Label htmlFor="stateName" className="text-sm font-medium text-muted-foreground">State</Label>
                      <Input id="stateName" value={profileData.state_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                  {profileData.country_name && (
                    <div>
                      <Label htmlFor="countryName" className="text-sm font-medium text-muted-foreground">Country</Label>
                      <Input id="countryName" value={profileData.country_name} readOnly className="bg-muted/50 border-none mt-1" />
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;