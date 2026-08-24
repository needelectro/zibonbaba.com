'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Users, Key, BarChart3, Settings, LogOut, ArrowLeft } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout, username } = useStore();

  const navItems = [
    { label: 'Overview', href: '/superadmin', icon: ShieldCheck },
    { label: 'Accounts & Governance', href: '/superadmin/accounts', icon: Users },
    { label: 'Roles & RBAC', href: '/superadmin/roles', icon: Key },
    { label: 'System Analytics', href: '/superadmin/reports', icon: BarChart3 },
    { label: 'Platform Security', href: '/superadmin/security', icon: Settings },
    { label: 'Global Settings', href: '/superadmin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </Link>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
              Z
            </div>
            <span className="font-extrabold text-sm text-white tracking-wide">
              Superadmin <span className="text-red-500">Command Center</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Logged in as <strong className="text-white">{username || 'Root Admin'}</strong></span>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="p-2 hover:bg-slate-800 rounded-lg text-red-400 hover:text-red-300 transition-colors text-xs font-bold flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </aside>

        {/* Content area */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
