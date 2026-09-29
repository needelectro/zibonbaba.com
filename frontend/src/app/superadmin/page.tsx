'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SuperAdminLayout from '@/components/superadmin-layout';
import { useStore } from '@/store/useStore';
import {
  Users,
  Shield,
  Settings,
  Key,
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  ShoppingBag,
  TrendingUp,
  HeadphonesIcon,
  ChevronRight,
  BarChart2,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
  UserX,
} from 'lucide-react';

const INITIAL_STATS = [
  {
    label: 'Total Users & Accounts',
    value: '14 Accounts',
    change: '+14 Active Roles',
    positive: true,
    icon: Users,
    lightBorder: 'border-blue-200',
    lightIcon: 'text-blue-600',
    darkBorder: 'border-blue-500/30',
    darkIcon: 'text-blue-400',
    link: '/superadmin/accounts',
  },
  {
    label: 'System Roles Configured',
    value: '14 Roles',
    change: '32 Permissions Active',
    positive: true,
    icon: Key,
    lightBorder: 'border-emerald-200',
    lightIcon: 'text-emerald-700',
    darkBorder: 'border-emerald-500/30',
    darkIcon: 'text-emerald-400',
    link: '/superadmin/roles',
  },
  {
    label: 'Security Threats & Alerts',
    value: '3 Threats Blocked',
    change: 'Firewall Active',
    positive: true,
    icon: Shield,
    lightBorder: 'border-rose-200',
    lightIcon: 'text-rose-600',
    darkBorder: 'border-rose-500/30',
    darkIcon: 'text-rose-400',
    link: '/superadmin/security',
  },
  {
    label: 'Platform Revenue (GMV)',
    value: '৳162.9M',
    change: '+19.2% Growth',
    positive: true,
    icon: TrendingUp,
    lightBorder: 'border-amber-200',
    lightIcon: 'text-amber-700',
    darkBorder: 'border-amber-500/30',
    darkIcon: 'text-amber-400',
    link: '/superadmin/reports',
  },
];

interface QuickAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  joined: string;
}

const INITIAL_ACCOUNTS: QuickAccount[] = [
  { id: 'acc-1', name: 'Super Admin', email: 'superadmin@zibonbaba.com', role: 'SUPER_ADMIN', status: 'ACTIVE', joined: '2026-01-01' },
  { id: 'acc-2', name: 'Platform Admin', email: 'admin@zibonbaba.com', role: 'ADMIN', status: 'ACTIVE', joined: '2026-01-05' },
  { id: 'acc-3', name: 'Operations Manager', email: 'manager@zibonbaba.com', role: 'MANAGER', status: 'ACTIVE', joined: '2026-02-10' },
  { id: 'acc-4', name: 'Chief Accountant', email: 'accountant@zibonbaba.com', role: 'ACCOUNTANT', status: 'ACTIVE', joined: '2026-02-14' },
  { id: 'acc-5', name: 'Support Lead', email: 'support@zibonbaba.com', role: 'CUSTOMER_SUPPORT', status: 'ACTIVE', joined: '2026-03-01' },
  { id: 'acc-6', name: 'Warehouse Supervisor', email: 'warehouse@zibonbaba.com', role: 'WAREHOUSE_MANAGER', status: 'ACTIVE', joined: '2026-03-12' },
  { id: 'acc-7', name: 'Vendor Owner', email: 'vendor@zibonbaba.com', role: 'VENDOR_ADMIN', status: 'ACTIVE', joined: '2026-04-01' },
];

export default function SuperAdminDashboard() {
  const { adminTheme } = useStore();
  const isLight = adminTheme === 'light';

  const [accounts, setAccounts] = useState<QuickAccount[]>(INITIAL_ACCOUNTS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === id) {
          const newStatus = acc.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
          showToast(`Account ${acc.email} status changed to ${newStatus}.`);
          return { ...acc, status: newStatus };
        }
        return acc;
      })
    );
  };

  const handleDeleteAccount = (id: string, email: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    showToast(`Account ${email} has been removed.`);
  };

  return (
    <SuperAdminLayout
      activeNav="dashboard"
      title="Executive Overview Dashboard"
      subtitle="Real-time KPI metrics, System Health Monitor & Quick Admin Controls"
    >
      {toastMessage && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-white">✕</button>
        </div>
      )}

      {/* ── KPI Stat Cards (All Clickable) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {INITIAL_STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.link}
              className={`p-5 rounded-3xl border transition-all group cursor-pointer ${
                isLight
                  ? `bg-white ${stat.lightBorder} hover:border-amber-500 shadow-sm hover:shadow-md`
                  : `bg-slate-950 ${stat.darkBorder} hover:border-amber-500/50 shadow-xl`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${
                  isLight ? 'text-slate-600 group-hover:text-amber-700' : 'text-slate-400 group-hover:text-amber-400'
                }`}>
                  {stat.label}
                </span>
                <Icon size={18} className={isLight ? stat.lightIcon : stat.darkIcon} />
              </div>
              <p className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{stat.value}</p>
              <div className={`flex items-center justify-between mt-2 text-xs font-bold ${
                isLight ? 'text-emerald-700' : 'text-emerald-400'
              }`}>
                <span>{stat.change}</span>
                <ChevronRight size={14} className={isLight ? 'text-slate-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all' : 'text-slate-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all'} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Quick Action Hub Bar ── */}
      <div className={`border rounded-3xl p-6 mb-8 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
      }`}>
        <h2 className={`text-xs font-black uppercase tracking-wider mb-4 ${
          isLight ? 'text-slate-600' : 'text-slate-400'
        }`}>Quick Executive Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/superadmin/accounts?action=create"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs p-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-center"
          >
            <Plus size={16} /> Create User Account
          </Link>
          <Link
            href="/superadmin/roles"
            className={`border text-xs p-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center font-extrabold ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
            }`}
          >
            <Key size={16} className={isLight ? 'text-amber-700' : 'text-amber-400'} /> Manage Permissions
          </Link>
          <Link
            href="/superadmin/security"
            className={`border text-xs p-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center font-extrabold ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
            }`}
          >
            <Lock size={16} className={isLight ? 'text-rose-600' : 'text-rose-400'} /> View Security Audit
          </Link>
          <Link
            href="/superadmin/reports"
            className={`border text-xs p-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-center font-extrabold ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
            }`}
          >
            <BarChart2 size={16} className={isLight ? 'text-emerald-700' : 'text-emerald-400'} /> Export Reports
          </Link>
        </div>
      </div>

      {/* ── Accounts Management Table Preview ── */}
      <div className={`border rounded-3xl p-6 mb-8 transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
      }`}>
        <div className={`flex items-center justify-between pb-4 border-b mb-5 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              <Users className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} /> Core System Accounts
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
              Direct quick status toggling and account management
            </p>
          </div>
          <Link
            href="/superadmin/accounts"
            className={`text-xs font-black flex items-center gap-1 ${
              isLight ? 'text-amber-700 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            View All Accounts ({accounts.length}) <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-extrabold uppercase text-[9px] tracking-wider border-b ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">User Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {accounts.map((acc) => (
                <tr key={acc.id} className={`transition-colors ${
                  isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'
                }`}>
                  <td className={`py-3.5 px-4 font-bold flex items-center gap-2.5 ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}>
                    <div className={`w-7 h-7 rounded-xl font-black flex items-center justify-center text-[10px] border ${
                      isLight
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      {acc.name.charAt(0)}
                    </div>
                    {acc.name}
                  </td>
                  <td className={`py-3.5 px-4 font-mono text-[11px] font-semibold ${
                    isLight ? 'text-slate-800' : 'text-slate-300'
                  }`}>{acc.email}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      isLight
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-slate-900 text-amber-400 border-slate-700'
                    }`}>
                      {acc.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                      acc.status === 'ACTIVE'
                        ? isLight
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : isLight
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                    }`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(acc.id, acc.status)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors shadow-sm ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                            : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/50'
                        }`}
                        title="Toggle Active/Suspended status"
                      >
                        {acc.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.email)}
                        className={`p-1.5 rounded-xl border transition-colors ${
                          isLight
                            ? 'bg-rose-100 hover:bg-rose-200 text-rose-700 border-rose-300'
                            : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                        }`}
                        title="Delete account"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
