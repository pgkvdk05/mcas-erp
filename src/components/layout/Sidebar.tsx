"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, Users, BookUser, GraduationCap,
  ClipboardList, DollarSign, Building2, BookOpen,
  MessageSquareText, CalendarCheck, FileText, User, PanelLeft, PanelRight, Menu, X
} from 'lucide-react';
import { useSession } from '@/components/auth/SessionContextProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  userRole?: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const navigationItems = {
  SUPER_ADMIN: [
    { name: 'Dashboard', href: '/dashboard/super-admin', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile/super-admin', icon: User },
    { name: 'Manage Users', href: '/erp/manage-users', icon: Users },
    { name: 'Add Teacher', href: '/erp/add-teacher', icon: BookUser },
    { name: 'Add Student', href: '/erp/add-student', icon: GraduationCap },
    { name: 'Manage Departments', href: '/erp/manage-departments', icon: Building2 },
    { name: 'Manage Courses', href: '/erp/manage-courses', icon: BookOpen },
    { name: 'Fees Records', href: '/erp/fees-records', icon: DollarSign }, // New item
    { name: 'Approve OD Requests', href: '/erp/od/approve', icon: CalendarCheck },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile/admin', icon: User },
    { name: 'Add Teacher', href: '/erp/add-teacher', icon: BookUser },
    { name: 'Add Student', href: '/erp/add-student', icon: GraduationCap },
    { name: 'Mark Attendance', href: '/erp/attendance/mark', icon: ClipboardList },
    { name: 'View All Attendance', href: '/erp/attendance/all', icon: CalendarCheck },
    { name: 'View All Marks', href: '/erp/marks/all', icon: FileText },
    { name: 'Update Fee Status', href: '/erp/fees/admin', icon: DollarSign },
    { name: 'Approve OD Requests', href: '/erp/od/approve', icon: CalendarCheck },
  ],
  TEACHER: [
    { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile/teacher', icon: User },
    { name: 'Mark Attendance', href: '/erp/attendance/mark', icon: ClipboardList },
    { name: 'Upload Marks', href: '/erp/marks/upload', icon: FileText },
    { name: 'View My Classes', href: '/erp/teacher/classes', icon: BookOpen },
    { name: 'View Student Profiles', href: '/erp/teacher/student-profiles', icon: Users },
    { name: 'Approve OD Requests', href: '/erp/od/approve', icon: CalendarCheck },
    { name: 'Class Chat', href: '/erp/chat/teacher', icon: MessageSquareText },
  ],
  STUDENT: [
    { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
    { name: 'My Profile', href: '/profile/student', icon: User },
    { name: 'View Attendance', href: '/erp/attendance/student', icon: CalendarCheck },
    { name: 'View Marks', href: '/erp/marks/student', icon: FileText },
    { name: 'View Fee Status', href: '/erp/fees/student', icon: DollarSign },
    { name: 'Request OD', href: '/erp/od/request', icon: ClipboardList },
    { name: 'Class Chat', href: '/erp/chat/student', icon: MessageSquareText },
  ],
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleCollapse, isMobileMenuOpen, toggleMobileMenu }) => {
  const location = useLocation();
  const { userRole, loading } = useSession();

  if (loading || !userRole || !navigationItems[userRole]) {
    return null;
  }

  const items = navigationItems[userRole];
  const ToggleIcon = isCollapsed ? PanelRight : PanelLeft;

  return (
    <>
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 flex-col shadow-lg transition-all duration-300 hidden md:flex",
          isCollapsed ? "w-sidebar-collapsed items-center" : "w-sidebar-expanded"
        )}
      >
        <div className={cn("flex items-center mb-6", isCollapsed ? "justify-center" : "justify-between")}>
          {!isCollapsed && (
            <div className="text-lg font-semibold text-sidebar-primary whitespace-nowrap">
              {userRole.replace('_', ' ')} Panel
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "mx-auto" : ""
            )}
          >
            <ToggleIcon className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-grow w-full">
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <TooltipProvider key={item.href}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        asChild
                        variant={isActive ? 'sidebar-primary' : 'sidebar-ghost'}
                        className={cn(
                          "w-full",
                          isCollapsed ? "justify-center" : "justify-start",
                          isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Link to={item.href} className={cn("flex items-center", isCollapsed ? "space-x-0" : "space-x-3")}>
                          <Icon className="h-5 w-5" />
                          {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    {isCollapsed && <TooltipContent side="right">{item.name}</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden",
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={toggleMobileMenu}
      ></div>
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 flex flex-col shadow-lg transition-transform duration-300 ease-in-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "w-sidebar-expanded"
        )}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold text-sidebar-primary whitespace-nowrap">
            {userRole.replace('_', ' ')} Panel
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="flex-grow w-full">
          <nav className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.href}
                  asChild
                  variant={isActive ? 'sidebar-primary' : 'sidebar-ghost'}
                  className={cn(
                    "w-full justify-start",
                    isActive ? "text-sidebar-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={toggleMobileMenu}
                >
                  <Link to={item.href} className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span className="whitespace-nowrap">{item.name}</span>
                  </Link>
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
};

export default Sidebar;
