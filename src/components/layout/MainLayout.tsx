"use client";

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useSession } from '@/components/auth/SessionContextProvider';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LogOut, Menu, X } from 'lucide-react';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole, loading } = useSession();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Loading user session...
      </div>
    );
  }

  const showSidebar = userRole !== null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-primary text-primary-foreground p-4 flex justify-between items-center shadow-md border-b border-primary/20">
        <div className="flex items-center space-x-3">
          {showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="text-primary-foreground hover:bg-primary-foreground/20 hidden md:flex"
            >
              {isSidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </Button>
          )}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <img src="/collogo.png" alt="Mangalam College of Arts and Science Logo" className="h-9" />
            <div className="font-extrabold text-xl md:text-2xl tracking-tight">Mangalam College of Arts and Science</div>
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {userRole && (
            <span className="text-sm md:text-base font-medium opacity-90">Role: {userRole.replace('_', ' ')}</span>
          )}
          {user && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              aria-label="Logout"
              className="text-sm md:text-base hover:underline text-primary-foreground flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          )}
          {showSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
              className="text-primary-foreground hover:bg-primary-foreground/20 md:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </nav>
      </header>

      <div className="flex flex-grow">
        {showSidebar && (
          <Sidebar
            userRole={userRole}
            isCollapsed={isSidebarCollapsed}
            toggleCollapse={toggleSidebar}
            isMobileMenuOpen={isMobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
        )}
        <main
          className={cn(
            "flex-grow p-6 transition-all duration-300",
            showSidebar && isSidebarCollapsed ? "md:ml-sidebar-collapsed" : "md:ml-sidebar-expanded"
          )}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      <footer className="text-center text-sm text-muted-foreground p-4 border-t border-border">
        &copy; {new Date().getFullYear()} Mangalam College of Arts and Science
      </footer>
    </div>
  );
};

export default MainLayout;