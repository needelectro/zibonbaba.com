'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  HelpCircle,
  Sun,
  Moon,
  Activity,
  LogOut,
  ChevronDown,
  User,
  Shield,
  Settings2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onOpenMobileDrawer: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenHelp: () => void;
  unreadNotificationsCount?: number;
  adminTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  username: string;
  role: string;
  userEmail?: string;
  onLogout: () => void;
  breadcrumbs: BreadcrumbItem[];
  onNavigateModule: (module: string) => void;
  isLight: boolean;
}

export default function AdminHeader({
  onToggleSidebar,
  onOpenMobileDrawer,
  onOpenSearch,
  onOpenNotifications,
  onOpenHelp,
  unreadNotificationsCount = 0,
  adminTheme,
  onToggleTheme,
  username,
  role,
  userEmail,
  onLogout,
  breadcrumbs,
  onNavigateModule,
  isLight
}: AdminHeaderProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 transition-colors ${
        isLight
          ? 'bg-white/95 backdrop-blur-md border-slate-200/90 shadow-xs'
          : 'bg-slate-950/80 backdrop-blur-md border-slate-800/80'
      }`}
    >
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger (< md) */}
        <button
          onClick={onOpenMobileDrawer}
          className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-800'
          }`}
          title="Open Menu"
        >
          <Menu className="w-4 h-4 text-amber-500" />
        </button>

        {/* Live System Indicator */}
        <span className="hidden sm:inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs truncate">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">/</span>}
              {idx === breadcrumbs.length - 1 ? (
                <span className={`font-black truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {crumb.label}
                </span>
              ) : (
                <span
                  className={`font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate ${
                    crumb.href ? 'cursor-pointer hover:underline' : ''
                  }`}
                  onClick={() => crumb.href && onNavigateModule(crumb.href)}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center/Right: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Global Search Shortcut */}
        <button
          onClick={onOpenSearch}
          className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isLight
              ? 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-700 border-slate-200 shadow-xs'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="Search anything (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Search...</span>
          <kbd
            className={`hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              isLight
                ? 'bg-white text-slate-500 border-slate-300'
                : 'bg-slate-950 text-slate-400 border-slate-700'
            }`}
          >
            Ctrl+K
          </kbd>
        </button>

        {/* System Diagnostics Link */}
        <Link
          href="/admin/system-health"
          className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-bold hidden lg:flex items-center gap-1.5 transition-colors ${
            isLight
              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
          }`}
          title="Platform Diagnostics & Health Auditor"
        >
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>Health</span>
        </Link>

        {/* Notifications Icon Button with Badge */}
        <button
          onClick={onOpenNotifications}
          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer relative ${
            isLight
              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center shadow-xs">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
          }`}
          title="Admin Help & Shortcuts"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Theme Switcher Toggle */}
        <button
          onClick={onToggleTheme}
          className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
            isLight
              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
              : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border-slate-800'
          }`}
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {isLight ? (
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline text-xs font-bold capitalize">{adminTheme}</span>
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className={`h-9 px-2 sm:px-2.5 rounded-xl border flex items-center gap-2 transition-colors cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 shadow-xs'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800'
            }`}
          >
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30">
              {(username || role || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline text-xs font-extrabold max-w-[100px] truncate text-slate-900 dark:text-white">
              {username || 'Admin'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border p-2 space-y-1 animate-slide-up z-50 ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-100'
              }`}
            >
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                <p className="font-extrabold text-xs truncate text-slate-900 dark:text-white">
                  {username || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail || 'admin@zibonbaba.com'}</p>
                <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {role || 'SUPER_ADMIN'}
                </span>
              </div>

              <button
                onClick={() => {
                  onNavigateModule('settings');
                  setProfileDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                <span>System Settings</span>
              </button>

              <button
                onClick={() => {
                  onNavigateModule('security');
                  setProfileDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Security Center</span>
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
