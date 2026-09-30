'use client';

import React, { useState } from 'react';
import AdminSidebar, { AdminModuleType } from './AdminSidebar';
import AdminHeader from './AdminHeader';
import NotificationDrawer from '../ui/NotificationDrawer';
import HelpModal from '../ui/HelpModal';
import AdminGlobalSearchModal from '../AdminGlobalSearchModal';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Settings2,
  X,
  Store,
  Users,
  Boxes,
  Activity,
  LogOut
} from 'lucide-react';

interface AdminAppShellProps {
  activeModule: AdminModuleType;
  onSelectModule: (module: AdminModuleType) => void;
  adminTheme: 'light' | 'dark';
  onToggleTheme: () => void;
  username: string;
  role: string;
  userEmail?: string;
  onLogout: () => void;
  badgeCounts?: {
    orders?: number;
    pendingSellers?: number;
    reviews?: number;
    unassignedOrders?: number;
    withdrawals?: number;
  };
  onSelectSearchResult: (module: string, itemId: string, itemData?: any) => void;
  breadcrumbs: { label: string; href?: string }[];
  children: React.ReactNode;
}

export default function AdminAppShell({
  activeModule,
  onSelectModule,
  adminTheme,
  onToggleTheme,
  username,
  role,
  userEmail,
  onLogout,
  badgeCounts,
  onSelectSearchResult,
  breadcrumbs,
  children
}: AdminAppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isLight = adminTheme === 'light';

  return (
    <div
      data-admin-theme={adminTheme}
      className={`min-h-screen font-sans flex relative overflow-hidden transition-colors duration-200 ${
        isLight ? 'admin-light bg-[#F7F8FA] text-[#172033]' : 'admin-dark bg-[#0B0F19] text-slate-100'
      }`}
    >
      {/* Subtle Ambient Glow Elements */}
      <div className={`absolute top-[-10%] left-[-10%] w-[45%] h-[45%] ${isLight ? 'bg-amber-400/5' : 'bg-[#FFC107]/5'} blur-[140px] rounded-full pointer-events-none z-0`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] ${isLight ? 'bg-blue-500/5' : 'bg-blue-600/5'} blur-[140px] rounded-full pointer-events-none z-0`} />

      {/* 1. Collapsible Desktop Sidebar */}
      <AdminSidebar
        activeModule={activeModule}
        onSelectModule={(mod) => {
          onSelectModule(mod);
          setIsMobileDrawerOpen(false);
        }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isLight={isLight}
        username={username}
        role={role}
        onLogout={onLogout}
        badgeCounts={badgeCounts}
      />

      {/* 2. Main Application Body */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 overflow-x-hidden relative z-10">
        {/* Header */}
        <AdminHeader
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          unreadNotificationsCount={3}
          adminTheme={adminTheme}
          onToggleTheme={onToggleTheme}
          username={username}
          role={role}
          userEmail={userEmail}
          onLogout={onLogout}
          breadcrumbs={breadcrumbs}
          onNavigateModule={(mod) => onSelectModule(mod as AdminModuleType)}
          isLight={isLight}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* 3. Mobile Slide-Over Drawer (< md) */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden animate-fade-in flex"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsMobileDrawerOpen(false);
          }}
        >
          <div
            className={`w-72 max-w-[85vw] h-full shadow-2xl flex flex-col animate-slide-up border-r ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-950 border-slate-800 text-white'
            }`}
          >
            <div className="h-16 px-4 border-b flex items-center justify-between shrink-0 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFC107] flex items-center justify-center font-black text-slate-950 shadow-sm">
                  Z
                </div>
                <span className="font-extrabold text-sm tracking-wider uppercase">
                  Zibon<span className="text-[#FFC107]">baba</span>
                </span>
              </div>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
                { id: 'marketplace', label: 'Products & Categories', icon: ShoppingBag },
                { id: 'orders', label: 'Orders & Shipments', icon: CreditCard },
                { id: 'customers', label: 'Customer Hub', icon: Users },
                { id: 'sellers', label: 'Sellers KYC Queue', icon: Store },
                { id: 'inventory', label: 'Inventory & Stock Alerts', icon: Boxes },
                { id: 'finance', label: 'Financial Records', icon: Activity },
                { id: 'settings', label: 'System Settings', icon: Settings2 }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectModule(item.id as AdminModuleType);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? 'bg-[#FFC107] text-slate-950 font-black'
                        : isLight
                        ? 'text-slate-700 hover:bg-slate-100'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Responsive Mobile Bottom Navigation Bar (< md) */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 h-16 border-t z-40 flex items-center justify-around px-2 backdrop-blur-lg ${
          isLight
            ? 'bg-white/95 border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]'
            : 'bg-slate-950/95 border-slate-800/90'
        }`}
      >
        {[
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'marketplace', label: 'Products', icon: ShoppingBag },
          { id: 'orders', label: 'Orders', icon: CreditCard, badge: badgeCounts?.orders },
          { id: 'sellers', label: 'Sellers', icon: Store, badge: badgeCounts?.pendingSellers },
          { id: 'settings', label: 'Settings', icon: Settings2 }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id as AdminModuleType)}
              className={`flex flex-col items-center gap-1 text-[10px] font-bold transition-all relative py-1 px-2 ${
                isActive
                  ? 'text-amber-600 dark:text-[#FFC107] font-black scale-105'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-4 h-4" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-slate-950 text-[8px] font-black rounded-full px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* 5. Modals & Flyouts */}
      <AdminGlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={onSelectSearchResult}
        isLight={isLight}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onNavigateModule={(mod) => onSelectModule(mod as AdminModuleType)}
        isLight={isLight}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        isLight={isLight}
      />
    </div>
  );
}
