'use client';

import React from 'react';
import SuperadminLayout from '@/components/superadmin-layout';
import { Key, Shield, Check, Plus } from 'lucide-react';

export default function SuperadminRolesPage() {
  const roles = [
    { name: 'SUPER_ADMIN', desc: 'Full unrestricted platform access, governance, and audit logs', usersCount: 2, level: 'Level 0 (Root)' },
    { name: 'ADMIN', desc: 'Platform management, category creation, seller approvals, and dispute resolution', usersCount: 5, level: 'Level 1 (Operations)' },
    { name: 'VENDOR_ADMIN', desc: 'Merchant store owner with full access to products, orders, payouts, and staff', usersCount: 142, level: 'Level 2 (Store Owner)' },
    { name: 'DELIVERY_MANAGER', desc: 'Logistics hub manager overseeing courier dispatch, fleet, and routes', usersCount: 8, level: 'Level 2 (Logistics)' },
    { name: 'FINANCE_OFFICER', desc: 'Escrow settlement auditor, VAT compliance, and seller payouts', usersCount: 3, level: 'Level 2 (Finance)' },
    { name: 'SUPPORT_AGENT', desc: 'Helpdesk ticketing, CRM customer support, and return tickets', usersCount: 12, level: 'Level 3 (Support)' },
  ];

  return (
    <SuperadminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Roles & RBAC Matrix</h1>
            <p className="text-xs text-slate-400 mt-1">
              Role-Based Access Control definitions and permission scope assignments.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition-all">
            <Plus className="w-4 h-4" />
            <span>Create Custom Role</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-red-400 font-black">{r.level}</span>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full">
                    {r.usersCount} Assigned
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-2 font-mono">{r.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{r.desc}</p>
              </div>
              <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition-colors">
                Configure Permissions
              </button>
            </div>
          ))}
        </div>
      </div>
    </SuperadminLayout>
  );
}
