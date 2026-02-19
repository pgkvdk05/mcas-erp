"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';
import { Crown, ShieldCheck, BookUser, GraduationCap } from 'lucide-react';

const roleCards = [
  {
    role: 'SUPER_ADMIN',
    title: 'Super Admin',
    description: 'Full control over the entire system.',
    icon: Crown,
    path: '/auth/super-admin',
  },
  {
    role: 'ADMIN',
    title: 'Admin',
    description: 'Manage academic and administrative tasks.',
    icon: ShieldCheck,
    path: '/auth/admin',
  },
  {
    role: 'TEACHER',
    title: 'Teacher',
    description: 'Manage classes, attendance, and marks.',
    icon: BookUser,
    path: '/auth/teacher',
  },
  {
    role: 'STUDENT',
    title: 'Student',
    description: 'Access your attendance, marks, and fees.',
    icon: GraduationCap,
    path: '/auth/student',
  },
];

const Index: React.FC = () => {
  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center p-4
                      bg-gradient-to-br from-background via-secondary to-primary/10
                      bg-[length:200%_200%] animate-gradient-shift">
        <h1 className="text-5xl font-extrabold text-primary mb-8 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Welcome to Mangalam College of Arts and Science
        </h1>
        <p className="text-xl text-muted-foreground mb-12 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          Please select your role to proceed to the ERP system.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl w-full">
          {roleCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.role}
                className="flex flex-col items-center text-center p-6 shadow-xl rounded-lg
                           hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-in-out
                           border border-primary/10 animate-fade-in-up"
                style={{ animationDelay: `${0.6 + index * 0.1}s` }}
              >
                <CardHeader className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full text-primary">
                    <Icon className="h-10 w-10" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-primary">{card.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{card.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto w-full">
                  <Button asChild className="w-full py-3 text-base font-semibold">
                    <Link to={card.path}>Login as {card.title}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
