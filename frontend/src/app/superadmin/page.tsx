'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SuperAdminLayout from '@/components/superadmin-layout';
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
    color: 'border-blue-500/30 text-blue-400',
    link: '/superadmin/accounts',
  },
  {
    label: 'System Roles Configured',
    value: '14 Roles',
    change: '32 Permissions Active',
    positive: true,
    icon: Key,
    color: 'border-emerald-500/30 text-emerald-400',
    link: '/superadmin/roles',
  },
  {
    label: 'Security Threats & Alerts',
    value: '3 Threats Blocked',
    change: 'Firewall Active',
    positive: true,
    icon: Shield,
    color: 'border-rose-500/30 text-rose-400',
    link: '/superadmin/security',
  },
  {
    label: 'Platform Revenue (GMV)',
    value: '৳162.9M',
    change: '+19.2% Growth',
    positive: true,
    icon: TrendingUp,
    color: 'border-amber-500/30 text-amber-400',
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
      <div className="space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-2xl flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)}>
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INITIAL_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Link
                key={idx}
                href={stat.link}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">{stat.label}</span>
                  <div className={`p-2 rounded-xl border ${stat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {stat.positive ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                    )}
                    <span
                      className={`text-[11px] font-bold ${
                        stat.positive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Accounts Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-white">Privileged Accounts Directory</h3>
              <p className="text-xs text-slate-400">All administrative, managerial, and operator roles</p>
            </div>
            <Link
              href="/superadmin/accounts"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Account Name</th>
                  <th className="p-4">Role Clearance</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">
                      <div>{acc.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{acc.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-[10px] bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
                        {acc.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          acc.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">{acc.joined}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(acc.id, acc.status)}
                        className={`p-1.5 rounded-lg border transition ${
                          acc.status === 'ACTIVE'
                            ? 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
                            : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                        title={acc.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {acc.status === 'ACTIVE' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(acc.id, acc.email)}
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition"
                        title="Delete Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
