"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AuthPageProps {
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT';
}

const AuthPage: React.FC<AuthPageProps> = ({ role }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error('Login Failed', { description: error.message });
    } else {
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) {
      toast.error('Google Login Failed', { description: error.message });
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[calc(100vh-160px)] flex items-center justify-center p-4
                      bg-gradient-to-br from-background via-secondary to-primary/10
                      bg-[length:200%_200%] animate-gradient-shift">
        <Card className="w-full max-w-sm shadow-xl rounded-lg animate-fade-in-up border border-primary/10">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-primary">{role.replace('_', ' ')} Login</CardTitle>
            <CardDescription className="text-muted-foreground">Enter your {role.replace('_', ' ')} credentials</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <Button type="submit" className="w-full py-2 text-base font-semibold" disabled={loading}>
                {loading ? 'Logging in...' : `Login as ${role.replace('_', ' ')}`}
              </Button>
            </form>

            {role === 'STUDENT' && (
              <>
                <div className="relative flex items-center">
                  <span className="w-full border-t border-border" />
                  <span className="relative flex justify-center text-xs uppercase px-2 text-muted-foreground bg-background">Or continue with</span>
                  <span className="w-full border-t border-border" />
                </div>

                <Button variant="outline" type="button" className="w-full py-2 text-base font-semibold" onClick={handleGoogleLogin} disabled={loading}>
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Google
                </Button>
              </>
            )}
            <Button variant="outline" className="w-full py-2 text-base font-semibold mt-4" onClick={() => navigate('/')} disabled={loading}>
              Go Back to Role Selection
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AuthPage;