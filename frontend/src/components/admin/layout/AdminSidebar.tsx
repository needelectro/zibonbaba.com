'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  Star,
  Monitor,
  Users,
  Store,
  Handshake,
  MapPin,
  Boxes,
  Warehouse,
  Zap,
  Contact,
  UserCheck,
  Wallet,
  Activity,
  FileText,
  UserPlus,
  KeyRound,
  ShieldAlert,
  Settings2,
  BellRing,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search,
  X
} from 'lucide-react';

export type AdminModuleType =
  | 'dashboard'
  | 'marketplace'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'sellers'
  | 'reviews'
  | 'pos'
  | 'resellers'
  | 'delivery'
  | 'commerce'
  | 'wallet'
  | 'finance'
  | 'inventory'
  | 'warehouse'
  | 'erp'
  | 'marketing'
  | 'reports'
  | 'accounts'
  | 'rbac'
  | 'security'
  | 'audit'
  | 'crm'
  | 'hrm'
  | 'settings'
  | 'notifications';

interface NavItem {
  id: AdminModuleType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface AdminSidebarProps {
  activeModule: AdminModuleType;
  onSelectModule: (module: AdminModuleType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isLight: boolean;
  username: string;
  role: string;
  onLogout: () => void;
  badgeCounts?: {
    orders?: number;
    pendingSellers?: number;
    reviews?: number;
    unassignedOrders?: number;
    withdrawals?: number;
  };
}

export default function AdminSidebar({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  isLight,
  username,
  role,
  onLogout,
  badgeCounts = {}
}: AdminSidebarProps) {
  const [navSearch, setNavSearch] = useState('');

  // Structured enterprise 8-section taxonomy matching Prompt Section 5
  const navSections: NavSection[] = [
    {
      title: 'Dashboard',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { id: 'sellers', label: 'Vendors & Stores', icon: Store, badge: badgeCounts.pendingSellers },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'marketplace', label: 'Products', icon: ShoppingBag },
        { id: 'categories', label: 'Categories & Brands', icon: Boxes },
        { id: 'orders', label: 'Orders', icon: CreditCard, badge: badgeCounts.orders },
        { id: 'reviews', label: 'Reviews', icon: Star, badge: badgeCounts.reviews },
        { id: 'pos', label: 'POS Terminal', icon: Monitor },
        { id: 'resellers', label: 'Resellers', icon: Handshake },
        { id: 'delivery', label: 'Courier & Fleet', icon: MapPin, badge: badgeCounts.unassignedOrders }
      ]
    },
    {
      title: 'Commerce',
      items: [
        { id: 'commerce', label: 'Commerce & Refunds', icon: Activity, badge: badgeCounts.withdrawals },
        { id: 'wallet', label: 'Payouts & Wallets', icon: Wallet },
        { id: 'finance', label: 'Financial Ledger', icon: FileText }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { id: 'inventory', label: 'Inventory & Stock', icon: Boxes },
        { id: 'warehouse', label: 'Warehouses Log', icon: Warehouse },
        { id: 'erp', label: 'ERP Accounting', icon: Zap }
      ]
    },
    {
      title: 'Marketing',
      items: [
        { id: 'marketing', label: 'Campaigns & Coupons', icon: Zap }
      ]
    },
    {
      title: 'Reports',
      items: [
        { id: 'reports', label: 'Sales Reports & BI', icon: FileText }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'accounts', label: 'Admin Users & Staff', icon: UserPlus, roles: ['admin', 'superadmin'] },
        { id: 'rbac', label: 'Roles & Permissions', icon: KeyRound, roles: ['admin', 'superadmin'] },
        { id: 'security', label: 'Security & Audit Logs', icon: ShieldAlert, roles: ['admin', 'superadmin'] },
        { id: 'crm', label: 'CRM Pipeline', icon: Contact },
        { id: 'hrm', label: 'HRM Attendance', icon: UserCheck }
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'settings', label: 'System Settings', icon: Settings2, roles: ['admin', 'superadmin'] },
        { id: 'notifications', label: 'Notification Hub', icon: BellRing }
      ]
    }
  ];

  const normalizedRole = (role || 'admin').toLowerCase();

  // Filter sections by search query and role permissions
  const filteredSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Role check
        if (item.roles && !item.roles.includes(normalizedRole) && normalizedRole !== 'superadmin') {
          return false;
        }
        // Search filter
        if (navSearch.trim()) {
          return item.label.toLowerCase().includes(navSearch.toLowerCase());
        }
        return true;
      })
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside
      className={`shrink-0 transition-all duration-300 hidden md:flex flex-col z-30 relative select-none border-r ${
        isCollapsed ? 'w-[72px]' : 'w-[252px]'
      } ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-[2px_0_8px_rgba(0,0,0,0.02)]'
          : 'bg-slate-950/95 backdrop-blur-xl border-slate-800/80 shadow-2xl'
      }`}
    >
      {/* Brand & Toggle Header */}
      <div
        className={`h-16 flex items-center justify-between px-4 border-b shrink-0 ${
          isLight ? 'border-slate-200/80 bg-slate-50/50' : 'border-slate-800/80 bg-slate-950/60'
        }`}
      >
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-sm shrink-0">
              Z
            </div>
            <div className="min-w-0">
              <span className={`font-black text-xs tracking-wider uppercase truncate block ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Zibon<span className="text-[#FFC107]">baba</span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 block -mt-0.5 tracking-tight">Marketplace OS</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-sm mx-auto">
            Z
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
            isLight
              ? 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation Filter Search (Only visible when expanded) */}
      {!isCollapsed && (
        <div className={`p-3 border-b shrink-0 ${isLight ? 'border-slate-200/60' : 'border-slate-800/60'}`}>
          <div
            className={`flex items-center rounded-xl px-2.5 h-8 border text-xs transition-colors ${
              isLight
                ? 'bg-slate-50 border-slate-200 text-slate-900 focus-within:border-amber-500 focus-within:bg-white'
                : 'bg-slate-900/80 border-slate-800 text-white focus-within:border-amber-400'
            }`}
          >
            <Search className="w-3 h-3 text-slate-400 mr-1.5 shrink-0" />
            <input
              type="text"
              placeholder="Filter modules..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="bg-transparent text-[11px] w-full outline-none font-medium placeholder:text-slate-400"
            />
            {navSearch && (
              <button onClick={() => setNavSearch('')} className="text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Groups List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-thin">
        {filteredSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            {!isCollapsed && (
              <h4
                className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 mb-1.5 flex items-center gap-1.5 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                {section.title}
              </h4>
            )}

            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onSelectModule(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                      isActive
                        ? isLight
                          ? 'bg-amber-400/90 text-slate-950 font-black shadow-xs'
                          : 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30'
                        : isLight
                        ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive
                          ? isLight
                            ? 'text-slate-950 scale-105'
                            : 'text-[#FFC107] scale-105'
                          : isLight
                          ? 'text-slate-500 group-hover:text-slate-900'
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />

                    {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                    {/* Badge counter */}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[9.5px] font-black px-1.5 py-0.2 rounded-full shrink-0 flex items-center justify-center ${
                          isActive
                            ? isLight
                              ? 'bg-slate-950 text-white'
                              : 'bg-[#FFC107] text-slate-950'
                            : 'bg-blue-600 text-white'
                        } ${isCollapsed ? 'absolute -top-1 -right-1 text-[8px] px-1' : ''}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>

                  {/* Tooltip on hover when sidebar is collapsed */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      {item.label}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="ml-1.5 text-amber-400">({item.badge})</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile & Logout */}
      <div
        className={`p-3 border-t shrink-0 space-y-2 ${
          isLight ? 'border-slate-200/80 bg-slate-50/70' : 'border-slate-800/80 bg-slate-950/60'
        }`}
      >
        {!isCollapsed ? (
          <div
            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
              {(username || role || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {username || 'Administrator'}
              </p>
              <p className="text-[9.5px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider">
                {role || 'ADMIN'}
              </p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 font-black text-xs flex items-center justify-center mx-auto border border-amber-500/30">
            {(username || role || 'A').charAt(0).toUpperCase()}
          </div>
        )}

        <button
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2 rounded-xl border transition-colors cursor-pointer ${
            isLight
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
          }`}
          title="Sign Out of Admin Console"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
