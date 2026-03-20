"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UsersRound, 
  FolderKanban, 
  ListTodo,
  Star,
  LogOut,
  ChevronLeft,
  Shield,
  CreditCard,
  Trophy
} from 'lucide-react';
import { useState } from 'react';
import type { User } from '@/types/auth';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  user: User;
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const canManageUsers = user.role?.level ? user.role.level <= 2 : false; // CEO or Manager
  
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: 'Users',
      href: '/dashboard/users',
      icon: Users,
      show: canManageUsers,
    },
    {
      name: 'Teams',
      href: '/dashboard/teams',
      icon: UsersRound,
      show: true,
    },
    {
      name: 'Projects',
      href: '/dashboard/projects',
      icon: FolderKanban,
      show: true,
    },
    {
      name: 'Tasks',
      href: '/dashboard/tasks',
      icon: ListTodo,
      show: true,
    },
    {
      name: 'Testimonials',
      href: '/dashboard/testimonials',
      icon: Star,
      show: canManageUsers, // Only CEO and Manager
    },
    {
      name: 'Payment',
      href: '/dashboard/payment',
      icon: CreditCard,
      show: canManageUsers, // CEO and Manager
    },
    {
      name: 'Certificates',
      href: '/dashboard/certificates',
      icon: Trophy,
      show: canManageUsers, // CEO and Manager can manage certificates
    },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-40" />
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-gradient-to-b from-gray-900 to-black",
          "border-r border-white/10 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-white text-lg">KOT Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white"
          >
            <ChevronLeft className={cn("w-5 h-5 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">
                {user.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user.username}</p>
                <p className="text-white/60 text-sm truncate">{user.role?.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigation.filter(item => item.show).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                  "text-white/70 hover:text-white hover:bg-white/5",
                  isActive && "bg-gradient-primary text-white shadow-glow-sm",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
              "text-red-400 hover:text-red-300 hover:bg-red-500/10",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
