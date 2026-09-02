'use client';

import React, { useState } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Key,
  Shield,
  Users,
  CheckCircle,
  Plus,
  Save,
  ShoppingBag,
  Package,
  FileText,
  DollarSign,
  Lock,
  X,
  UserCheck,
} from 'lucide-react';

interface PermissionItem {
  id: string;
  label: string;
  enabled: boolean;
}

interface PermissionCategory {
  moduleName: string;
  icon: React.ElementType;
  items: PermissionItem[];
}

interface RoleConfig {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  color: string;
  matrix: PermissionCategory[];
}

const DEFAULT_CATEGORIES: PermissionCategory[] = [
  {
    moduleName: 'User & Identity Management',
    icon: Users,
    items: [
      { id: 'users.view', label: 'View User Profiles', enabled: true },
      { id: 'users.create', label: 'Create New Accounts', enabled: true },
      { id: 'users.edit', label: 'Modify User Role/Details', enabled: true },
      { id: 'users.delete', label: 'Delete & Suspend Accounts', enabled: true },
    ],
  },
  {
    moduleName: 'Marketplace & Products',
    icon: ShoppingBag,
    items: [
      { id: 'catalog.view', label: 'View Product Catalog', enabled: true },
      { id: 'catalog.create', label: 'List New Products', enabled: true },
      { id: 'catalog.approve', label: 'Approve Vendor Listings', enabled: true },
      { id: 'catalog.delete', label: 'Remove Product Items', enabled: true },
    ],
  },
  {
    moduleName: 'Orders & Deliveries',
    icon: Package,
    items: [
      { id: 'orders.view', label: 'Access Order Book', enabled: true },
      { id: 'orders.status', label: 'Change Dispatch Status', enabled: true },
      { id: 'orders.assign', label: 'Assign Couriers to Orders', enabled: true },
      { id: 'orders.cancel', label: 'Cancel & Refund Orders', enabled: true },
    ],
  },
  {
    moduleName: 'Financial Ledger & Payouts',
    icon: DollarSign,
    items: [
      { id: 'finance.view', label: 'View Revenue & Balance Sheets', enabled: true },
      { id: 'finance.payout', label: 'Approve Merchant Withdrawals', enabled: true },
      { id: 'finance.commission', label: 'Configure Commission Rates', enabled: true },
    ],
  },
  {
    moduleName: 'Security & System Settings',
    icon: Shield,
    items: [
      { id: 'system.audit', label: 'View Audit Logs & IP History', enabled: true },
      { id: 'system.roles', label: 'Manage Roles & Permissions', enabled: true },
      { id: 'system.backup', label: 'Export Database & Backup Snapshots', enabled: true },
    ],
  },
];

const INITIAL_ROLES: RoleConfig[] = [
  {
    id: 'superadmin',
    name: 'Super Administrator',
    description: 'Root access with unrestricted platform capabilities across all modules.',
    isSystem: true,
    color: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    matrix: DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.map((i) => ({ ...i, enabled: true })),
    })),
  },
  {
    id: 'admin',
    name: 'Platform Administrator',
    description: 'General system administration, customer support, and catalog management.',
    isSystem: true,
    color: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    matrix: DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.map((i) => ({ ...i, enabled: !i.id.startsWith('system.roles') })),
    })),
  },
  {
    id: 'manager',
    name: 'Operations Manager',
    description: 'Oversees day-to-day warehouse operations, order logistics, and staff actions.',
    isSystem: false,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    matrix: DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.map((i) => ({
        ...i,
        enabled: i.id.startsWith('orders.') || i.id.startsWith('catalog.'),
      })),
    })),
  },
  {
    id: 'accountant',
    name: 'Financial Accountant',
    description: 'Manages ledger, audits withdrawals, and processes merchant settlements.',
    isSystem: false,
    color: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    matrix: DEFAULT_CATEGORIES.map((c) => ({
      ...c,
      items: c.items.map((i) => ({
        ...i,
        enabled: i.id.startsWith('finance.') || i.id === 'orders.view',
      })),
    })),
  },
];

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<RoleConfig[]>(INITIAL_ROLES);
  const [activeRole, setActiveRole] = useState<RoleConfig>(INITIAL_ROLES[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggle = (moduleName: string, permissionId: string) => {
    if (activeRole.id === 'superadmin') return;

    const updated = {
      ...activeRole,
      matrix: activeRole.matrix.map((cat) => {
        if (cat.moduleName !== moduleName) return cat;
        return {
          ...cat,
          items: cat.items.map((item) => {
            if (item.id !== permissionId) return item;
            return { ...item, enabled: !item.enabled };
          }),
        };
      }),
    };

    setActiveRole(updated);
    setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleSave = () => {
    setToastMessage(`Permissions saved for role "${activeRole.name}"`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <SuperAdminLayout
      activeNav="/superadmin/roles"
      title="Role-Based Access Control (RBAC)"
      subtitle="Define roles, granular permissions, and security matrix across platform subsystems"
    >
      <div className="space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-2xl flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)}>
              <X className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  Configured Roles
                </h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  {roles.length} Active
                </span>
              </div>

              <div className="space-y-2">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRole(r)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      activeRole.id === r.id
                        ? 'bg-slate-800 border-amber-500/40 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-200">{r.name}</span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${r.color}`}
                      >
                        {r.isSystem ? 'System' : 'Custom'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                      {r.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Granular Permission Matrix */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base font-black text-slate-100">{activeRole.name}</h2>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${activeRole.color}`}
                    >
                      {activeRole.isSystem ? 'Built-in System Role' : 'Custom Role'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{activeRole.description}</p>
                </div>
                <button
                  onClick={handleSave}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Matrix</span>
                </button>
              </div>

              {activeRole.id === 'superadmin' && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-3.5 rounded-xl flex items-center gap-2 font-semibold">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>
                    Super Administrator permissions are immutable and enforce 100% full-stack control.
                  </span>
                </div>
              )}

              {/* Modules List */}
              <div className="space-y-6">
                {activeRole.matrix.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.moduleName}
                      className="border border-slate-800/80 rounded-xl p-4 bg-slate-950/30 space-y-3"
                    >
                      <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2.5 text-xs font-black text-slate-300">
                        <Icon className="w-4 h-4 text-amber-500" />
                        <span>{cat.moduleName}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {cat.items.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border text-xs transition cursor-pointer ${
                              item.enabled
                                ? 'bg-slate-800/60 border-amber-500/30 text-slate-100'
                                : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:border-slate-700'
                            } ${activeRole.id === 'superadmin' ? 'cursor-not-allowed opacity-80' : ''}`}
                          >
                            <span className="font-bold">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={item.enabled}
                              disabled={activeRole.id === 'superadmin'}
                              onChange={() => handleToggle(cat.moduleName, item.id)}
                              className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
