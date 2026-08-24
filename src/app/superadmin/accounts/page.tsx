'use client';

import React, { useState } from 'react';
import SuperadminLayout from '@/components/superadmin-layout';
import { Users, UserPlus, Shield, Key, Search, Trash2, Edit, CheckCircle2, XCircle } from 'lucide-react';

export default function SuperadminAccountsPage() {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  const [accounts, setAccounts] = useState([
    { id: 'usr_001', name: 'Root System Admin', email: 'admin@zibonbaba.com', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '10 mins ago' },
    { id: 'usr_002', name: 'Apex Electronics (Merchant)', email: 'owner@apexelectronics.com', role: 'VENDOR_ADMIN', status: 'ACTIVE', lastLogin: '2 hours ago' },
    { id: 'usr_003', name: 'Dhaka Logistics Hub', email: 'dispatch@zibonbaba.com', role: 'DELIVERY_MANAGER', status: 'ACTIVE', lastLogin: 'Yesterday' },
    { id: 'usr_004', name: 'Platform Finance Officer', email: 'finance@zibonbaba.com', role: 'FINANCE_OFFICER', status: 'ACTIVE', lastLogin: '3 days ago' },
    { id: 'usr_005', name: 'Customer Support Lead', email: 'support@zibonbaba.com', role: 'SUPPORT_AGENT', status: 'ACTIVE', lastLogin: '1 day ago' },
  ]);

  const filtered = accounts.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole === 'ALL' || a.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <SuperadminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Accounts & Governance</h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit, elevate, or revoke permissions across all administrative and merchant identities.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition-all">
            <UserPlus className="w-4 h-4" />
            <span>Create Admin User</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, user ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">Filter Role:</span>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Administrator</option>
              <option value="ADMIN">Platform Admin</option>
              <option value="VENDOR_ADMIN">Vendor Admin</option>
              <option value="DELIVERY_MANAGER">Logistics Manager</option>
              <option value="FINANCE_OFFICER">Finance Officer</option>
            </select>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">System Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Last Activity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full text-[10px] font-black">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[10px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[10px]">{u.lastLogin}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors" title="Edit Permissions">
                          <Key className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors" title="Revoke Access">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  );
}
