'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  LayoutDashboard,
  Users,
  Key,
  Lock,
  BarChart2,
  Settings,
  LogOut,
  Zap,
  Bell,
  Search,
  Activity,
  Shield,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  title?: string;
  subtitle?: string;
}

export default function SuperAdminLayout({
  children,
  activeNav,
  title = 'Super Admin Control Hub',
  subtitle = 'Platform-wide Security, RBAC & Enterprise System Controls',
}: SuperAdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, role, logout, username } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-6 border border-amber-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Login Required</h1>
          <p className="text-xs text-slate-400 mb-6">
            Please log in to your account to access the Super Admin Panel.
          </p>
          <Link
            href="/admin/login"
            className="inline-block w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl transition"
          >
            Go to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { label: 'System Overview', href: '/superadmin', icon: LayoutDashboard },
    { label: 'Role Management', href: '/superadmin/roles', icon: Key },
    { label: 'Security & Access', href: '/superadmin/security', icon: Shield },
    { label: 'Audit & Reports', href: '/superadmin/reports', icon: BarChart2 },
    { label: 'System Settings', href: '/superadmin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Warning Banner */}
      <div className="bg-amber-500 text-slate-950 text-[11px] font-black tracking-wider py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5" />
        <span>SUPER ADMIN ENVIRONMENT — ALL CHANGES ARE LOGGED & AUDITED IN REAL-TIME</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 shrink-0`}
        >
          <div>
            {/* Logo/Brand */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <Link href="/superadmin" className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-glow">
                  Z
                </div>
                {sidebarOpen && (
                  <div>
                    <span className="font-black text-sm tracking-tight text-white block">Zibonbaba</span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block -mt-1">
                      Super Admin
                    </span>
                  </div>
                )}
              </Link>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="p-3 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || activeNav === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User info & Exit */}
          <div className="p-3 border-t border-slate-800 space-y-2">
            {sidebarOpen && (
              <div className="px-3 py-2 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Logged In Operator</div>
                <div className="text-xs font-bold text-slate-200 truncate">{username || 'Super Administrator'}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">● Level 5 Clearance</div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>Exit Super Admin</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Header */}
          <header className="bg-slate-900/60 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-20">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">{title}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Audit lookup, user ID, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64 transition"
                />
              </div>
              <Link
                href="/admin"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2 rounded-xl border border-slate-700 transition flex items-center gap-1.5"
              >
                <span>Admin Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </header>

          {/* Page Body */}
          <div className="p-8 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
