"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard, Users, BookUser, GraduationCap,
  ClipboardList, DollarSign, Building2, BookOpen,
  MessageSquareText, CalendarCheck, FileText, User,
  PanelLeft, PanelRight, X,
} from 'lucide-react';
import { useSession } from '@/components/auth/useSession';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

// ─── Nav config ───────────────────────────────────────────────────────────────

const navigationItems = {
  ADMIN: [
    { name: 'Dashboard',             href: '/dashboard/admin',               icon: LayoutDashboard },
    { name: 'My Profile',            href: '/profile/admin',                 icon: User },
    { name: 'Add Teacher',           href: '/erp/add-teacher',               icon: BookUser },
    { name: 'Add Student',           href: '/erp/add-student',               icon: GraduationCap },
    { name: 'Mark Attendance',       href: '/erp/attendance/mark',           icon: ClipboardList },
    { name: 'View All Attendance',   href: '/erp/attendance/all',            icon: CalendarCheck },
    { name: 'View All Marks',        href: '/erp/marks/all',                 icon: FileText },
    { name: 'Update Fee Status',     href: '/erp/fees/admin',                icon: DollarSign },
    { name: 'Class Chat',            href: '/erp/chat/admin',               icon: MessageSquareText },
    { name: 'Approve OD Requests',   href: '/erp/od/approve',                icon: CalendarCheck },
  ],
  TEACHER: [
    { name: 'Dashboard',             href: '/dashboard/teacher',             icon: LayoutDashboard },
    { name: 'My Profile',            href: '/profile/teacher',               icon: User },
    { name: 'Mark Attendance',       href: '/erp/attendance/mark',           icon: ClipboardList },
    { name: 'Upload Marks',          href: '/erp/marks/upload',              icon: FileText },
    { name: 'View My Classes',       href: '/erp/teacher/classes',           icon: BookOpen },
    { name: 'View Student Profiles', href: '/erp/teacher/student-profiles',  icon: Users },
    { name: 'Approve OD Requests',   href: '/erp/od/approve',                icon: CalendarCheck },
    { name: 'Class Chat',            href: '/erp/chat/teacher',              icon: MessageSquareText },
  ],
  STUDENT: [
    { name: 'Dashboard',             href: '/dashboard/student',             icon: LayoutDashboard },
    { name: 'My Profile',            href: '/profile/student',               icon: User },
    { name: 'View Attendance',       href: '/erp/attendance/student',        icon: CalendarCheck },
    { name: 'View Marks',            href: '/erp/marks/student',             icon: FileText },
    { name: 'View Fee Status',       href: '/erp/fees/student',              icon: DollarSign },
    { name: 'Request OD',            href: '/erp/od/request',                icon: ClipboardList },
    { name: 'Class Chat',            href: '/erp/chat/student',              icon: MessageSquareText },
  ],
} as const;

// ─── Nav items list ───────────────────────────────────────────────────────────

function NavItems({
  items,
  isCollapsed,
  onNavigate,
}: {
  items: readonly { name: string; href: string; icon: React.ElementType }[];
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <nav className="space-y-0.5 px-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        const linkEl = (
          <Link
            to={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium',
              'transition-all duration-150 select-none w-full',
              isCollapsed ? 'justify-center px-0' : 'gap-3',
              isActive
                ? 'bg-[#1e293b] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            <Icon
              size={18}
              className={cn('shrink-0', isActive ? 'text-white' : 'text-slate-500')}
            />
            {!isCollapsed && (
              <span className="truncate leading-none">{item.name}</span>
            )}
          </Link>
        );

        if (isCollapsed) {
          return (
            <TooltipProvider key={item.href} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-medium">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return <div key={item.href}>{linkEl}</div>;
      })}
    </nav>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleCollapse,
  isMobileMenuOpen,
  toggleMobileMenu,
}) => {
  const { userRole, loading } = useSession();

  if (loading || !userRole || !(userRole in navigationItems)) return null;

  const items = navigationItems[userRole as keyof typeof navigationItems];
  const roleLabel = userRole.replace(/_/g, ' ');
  const ToggleIcon = isCollapsed ? PanelRight : PanelLeft;

  // ── Reusable inner layout ────────────────────────────────────────────────
  const Inner = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Header */}
      <div
        className={cn(
          'flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-3',
          !isMobile && isCollapsed ? 'justify-center' : 'justify-between',
        )}
      >
        {/* Logo + title — hidden when desktop-collapsed */}
        {(isMobile || !isCollapsed) && (
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e293b]">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold uppercase tracking-wide text-slate-800 leading-tight">
                MCAS ERP
              </p>
              <p className="truncate text-[10px] capitalize text-slate-400 leading-tight">
                {roleLabel} Panel
              </p>
            </div>
          </div>
        )}

        {/* Toggle / close button */}
        {isMobile ? (
          <button
            onClick={toggleMobileMenu}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        ) : (
          <button
            onClick={toggleCollapse}
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              'text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors',
              isCollapsed && 'mx-auto',
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ToggleIcon size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 py-3">
        <NavItems
          items={items}
          isCollapsed={!isMobile && isCollapsed}
          onNavigate={isMobile ? toggleMobileMenu : undefined}
        />
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────────────────────────── */}
      {/*  FIX: use inline style width — avoids broken custom Tailwind class  */}
      <aside
        style={{ width: isCollapsed ? 60 : 240 }}
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 shrink-0',
          'bg-white border-r border-slate-100 shadow-sm overflow-hidden',
          'transition-[width] duration-300 ease-in-out',
        )}
      >
        <Inner />
      </aside>

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      <div
        onClick={toggleMobileMenu}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden',
          'transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      />

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col',
          'bg-white border-r border-slate-100 shadow-2xl md:hidden',
          'transition-transform duration-300 ease-in-out',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Inner isMobile />
      </aside>
    </>
  );
};

export default Sidebar;