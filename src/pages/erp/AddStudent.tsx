"use client";

import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { createTemporaryClient } from '@/utils/auth-helpers';
import { useDepartments } from '@/hooks/useDepartments';
import PageHeader from '@/components/layout/PageHeader';

const AddStudent: React.FC = () => {
  const { departments, loading: loadingDepts } = useDepartments();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    rollNumber: '',
    departmentId: '',
    year: '',
    phoneNumber: '',
    parentPhoneNumber: '',
    houseNo: '',
    streetName: '',
    cityName: '',
    districtName: 'Chennai',
    stateName: 'Tamil Nadu',
    country: 'India',
    tenthSchoolName: '',
    tenthMarkScore: '',
    twelfthSchoolName: '',
    twelfthMarkScore: '',
  });

  const statesOfIndia = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const countries = ['India', 'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string, id: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.email || !formData.password || !formData.departmentId || !formData.rollNumber || !formData.firstName || !formData.lastName || !formData.cityName || !formData.stateName || !formData.country) {
        toast.error('Please fill in all required fields (First Name, Last Name, Email, Password, Roll Number, Department, City, State, Country).');
        setLoading(false);
        return;
      }

      const tempClient = createTemporaryClient();
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'STUDENT',
            first_name: formData.firstName,
            last_name: formData.lastName,
            username: formData.rollNumber,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: updateError } = await tempClient
          .from('profiles')
          .update({
            roll_number: formData.rollNumber,
            department_id: formData.departmentId,
            year: formData.year,
            phone_number: formData.phoneNumber || null,
            parent_phone_number: formData.parentPhoneNumber || null,
            house_no: formData.houseNo || null,
            street_name: formData.streetName || null,
            city_name: formData.cityName,
            district_name: formData.districtName || null,
            state_name: formData.stateName,
            country_name: formData.country,
            tenth_school_name: formData.tenthSchoolName || null,
            tenth_mark_score: formData.tenthMarkScore ? parseInt(formData.tenthMarkScore) : null,
            twelfth_school_name: formData.twelfthSchoolName || null,
            twelfth_mark_score: formData.twelfthMarkScore ? parseInt(formData.twelfthMarkScore) : null,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Error updating profile details:', updateError);
          toast.warning('Student user created, but failed to save some profile details. Please update manually.', { description: updateError.message });
        } else {
          toast.success('Student added successfully!');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            rollNumber: '',
            departmentId: '',
            year: '',
            phoneNumber: '',
            parentPhoneNumber: '',
            houseNo: '',
            streetName: '',
            cityName: '',
            districtName: 'Chennai',
            stateName: 'Tamil Nadu',
            country: 'India',
            tenthSchoolName: '',
            tenthMarkScore: '',
            twelfthSchoolName: '',
            twelfthMarkScore: '',
          });
        }
      }
    } catch (error: any) {
      console.error('Error adding student:', error);
      toast.error(error.message || 'Failed to add student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout userRole="SUPER_ADMIN">
      <div className="space-y-6">
        <PageHeader
          title="Add New Student"
          description="Create a new student account with comprehensive details."
        />
        <Card className="max-w-2xl mx-auto shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Student Details</CardTitle>
            <CardDescription className="text-muted-foreground">Enter the details for the new student.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="rollNumber" className="text-sm font-medium">Roll Number</Label>
                  <Input id="rollNumber" value={formData.rollNumber} onChange={handleChange} required className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleChange} required className="mt-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="departmentId" className="text-sm font-medium">Department</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'departmentId')} value={formData.departmentId} required>
                    <SelectTrigger id="departmentId" className="mt-1">
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingDepts ? (
                        <SelectItem value="loading" disabled>Loading Departments...</SelectItem>
                      ) : (
                        departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name} ({dept.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                  <Select onValueChange={(value) => handleSelectChange(value, 'year')} value={formData.year} required>
                    <SelectTrigger id="year" className="mt-1">
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-primary">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">Student Phone Number</Label>
                    <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="parentPhoneNumber" className="text-sm font-medium">Parent Phone Number</Label>
                    <Input id="parentPhoneNumber" type="tel" value={formData.parentPhoneNumber} onChange={handleChange} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-primary">Address Details</h3>
                <div>
                  <Label htmlFor="houseNo" className="text-sm font-medium">House No./Building Name</Label>
                  <Input id="houseNo" value={formData.houseNo} onChange={handleChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="streetName" className="text-sm font-medium">Street Name</Label>
                  <Input id="streetName" value={formData.streetName} onChange={handleChange} className="mt-1" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cityName" className="text-sm font-medium">City Name</Label>
                    <Input id="cityName" value={formData.cityName} onChange={handleChange} required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="districtName" className="text-sm font-medium">District Name</Label>
                    <Input id="districtName" value={formData.districtName} onChange={handleChange} className="mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stateName" className="text-sm font-medium">State Name</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'stateName')} value={formData.stateName} required>
                      <SelectTrigger id="stateName" className="mt-1">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesOfIndia.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium">Country</Label>
                    <Select onValueChange={(value) => handleSelectChange(value, 'country')} value={formData.country} required>
                      <SelectTrigger id="country" className="mt-1">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-lg font-semibold text-primary">Academic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tenthSchoolName" className="text-sm font-medium">10th School Name</Label>
                    <Input id="tenthSchoolName" value={formData.tenthSchoolName} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="tenthMarkScore" className="text-sm font-medium">10th Mark Score (out of 100)</Label>
                    <Input id="tenthMarkScore" type="number" min="0" max="100" value={formData.tenthMarkScore} onChange={handleChange} className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twelfthSchoolName" className="text-sm font-medium">12th School Name</Label>
                    <Input id="twelfthSchoolName" value={formData.twelfthSchoolName} onChange={handleChange} className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="twelfthMarkScore" className="text-sm font-medium">12th Mark Score (out of 100)</Label>
                    <Input id="twelfthMarkScore" type="number" min="0" max="100" value={formData.twelfthMarkScore} onChange={handleChange} className="mt-1" />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={loading}>
                {loading ? 'Adding Student...' : 'Add Student'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AddStudent;