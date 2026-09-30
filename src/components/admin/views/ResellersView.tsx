'use client';

import React from 'react';
import KPICard from '../ui/KPICard';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { Handshake, CheckCircle, Users, DollarSign, ArrowUpRight } from 'lucide-react';

interface ResellerRecord {
  id: string;
  user?: { fullName?: string; email?: string; phone?: string };
  storeName?: string;
  commissionRate?: number;
  totalEarnings?: number;
  status: string;
}

interface ResellersViewProps {
  resellers: ResellerRecord[];
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  isLight: boolean;
}

export default function ResellersView({ resellers = [], onUpdateStatus, isLight }: ResellersViewProps) {
  const activeCount = resellers.filter((r) => (r.status || '').toUpperCase() === 'ACTIVE').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Handshake className="w-5 h-5 text-amber-500" />
            Resellers Program & Commission Matrix
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Micro-entrepreneur affiliate network, shared commission tiers, and sub-storefront analytics.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <KPICard
          title="Total Resellers"
          value={resellers.length}
          subtitle="Enrolled partners"
          icon={Users}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Active Accounts"
          value={activeCount}
          subtitle="Verified selling"
          icon={CheckCircle}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Avg Commission"
          value="12.5%"
          subtitle="Shared revenue tier"
          icon={DollarSign}
          color="indigo"
          isLight={isLight}
        />
      </div>

      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Reseller Accounts Roster ({resellers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-bold ${isLight ? 'bg-slate-50/70 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <th className="py-3 px-4 font-black">Reseller Store</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Commission Rate</th>
                <th className="py-3 px-4">Total Earnings</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-semibold ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
              {resellers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="No resellers enrolled"
                      description="No micro-entrepreneur resellers have applied to the program yet."
                      icon={Handshake}
                      isLight={isLight}
                    />
                  </td>
                </tr>
              ) : (
                resellers.map((r) => (
                  <tr key={r.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {r.storeName || 'Reseller Portal'}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white">{r.user?.fullName || 'Partner'}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{r.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-500">
                      {r.commissionRate || 12.0}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-500">
                      ৳{Number(r.totalEarnings || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={r.status || 'ACTIVE'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onUpdateStatus(r.id, r.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          r.status === 'ACTIVE'
                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        }`}
                      >
                        {r.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
