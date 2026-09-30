'use client';

import React, { useState } from 'react';
import KPICard from '../ui/KPICard';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import {
  Wallet,
  Activity,
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle,
  Check,
  X,
  Lock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface WithdrawalRecord {
  id: string;
  user?: { fullName?: string; email?: string };
  userName?: string;
  role?: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  status: string;
  createdAt: string;
}

interface FinanceViewProps {
  totalRevenue: number;
  platformCommission: number;
  withdrawals: WithdrawalRecord[];
  onUpdateWithdrawalStatus: (id: string, newStatus: string) => Promise<void>;
  gateways: Record<string, boolean>;
  onToggleGateway: (name: string) => void;
  isLight: boolean;
}

export default function FinanceView({
  totalRevenue,
  platformCommission,
  withdrawals = [],
  onUpdateWithdrawalStatus,
  gateways,
  onToggleGateway,
  isLight
}: FinanceViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals' | 'gateways'>('overview');

  const merchantPayable = Math.round(totalRevenue * 0.85);
  const pendingPayouts = withdrawals
    .filter((w) => (w.status || '').toUpperCase() === 'PENDING')
    .reduce((acc, w) => acc + (w.amount || 0), 0);
  const netEarnings = platformCommission;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            ERP Financial Records & Payout Ledger
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Double-entry financial reporting, platform commission reconciliation, and merchant payout disbursements.
          </p>
        </div>
      </div>

      {/* Financial KPI Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Gross Revenue"
          value={`৳${totalRevenue.toLocaleString()}`}
          subtitle="Processed platform volume"
          icon={TrendingUp}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Platform Commission"
          value={`৳${platformCommission.toLocaleString()}`}
          subtitle="Retained service fee (10%)"
          icon={DollarSign}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Merchant Payable"
          value={`৳${merchantPayable.toLocaleString()}`}
          subtitle="Vendor & reseller balances"
          icon={CreditCard}
          color="blue"
          isLight={isLight}
        />
        <KPICard
          title="Pending Payouts"
          value={`৳${pendingPayouts.toLocaleString()}`}
          subtitle={`${withdrawals.filter((w) => (w.status || '').toUpperCase() === 'PENDING').length} withdrawal requests`}
          icon={Wallet}
          color="rose"
          isLight={isLight}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Accounting Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'withdrawals'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Payout Requests Queue ({withdrawals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'gateways'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Payment Gateways</span>
        </button>
      </div>

      {/* Content: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
            }`}
          >
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Platform Income & Commission Breakdown
            </h3>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Gross Platform Volume (GMV)</span>
                <span className="font-mono font-black text-slate-900 dark:text-white">৳{totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Base Platform Commission Rate</span>
                <span className="font-mono font-bold text-amber-500">10.0%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Merchant Disbursed Share</span>
                <span className="font-mono font-bold text-blue-500">৳{merchantPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 pt-3">
                <span className="font-extrabold text-slate-900 dark:text-white">Net Retained Operational Income</span>
                <span className="font-mono font-black text-base text-emerald-500">৳{netEarnings.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div
            className={`p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
            }`}
          >
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Payout Compliance & Tax Ledger
            </h3>
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">VAT Deduction Standard</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">8.0% (National NBR Tariff)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Source Tax Deducted at Payout</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">Automatically Calculated</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500">Audit Status</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Immutable Logged
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content: Payout Requests Queue */}
      {activeTab === 'withdrawals' && (
        <div
          className={`rounded-2xl border overflow-hidden transition-all ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Seller & Courier Withdrawal Requests Queue
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold ${isLight ? 'bg-slate-50/70 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                  <th className="py-3 px-4 font-black">User / Beneficiary</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 font-black">Amount (BDT)</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-semibold ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        title="No withdrawal requests"
                        description="No merchant or courier payout requests currently in queue."
                        icon={CheckCircle}
                        isLight={isLight}
                      />
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => {
                    const isPending = (w.status || '').toUpperCase() === 'PENDING';
                    return (
                      <tr key={w.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {w.userName || w.user?.fullName || w.user?.email || 'Vendor'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[10.5px]">
                          {w.role || 'VENDOR'}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-black text-amber-600 dark:text-[#FFC107]">
                          ৳{Number(w.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                          {w.paymentMethod}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                          {w.accountNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {new Date(w.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <StatusBadge status={w.status || 'PENDING'} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isPending && (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onUpdateWithdrawalStatus(w.id, 'APPROVED')}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[11px] rounded-lg shadow-xs cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onUpdateWithdrawalStatus(w.id, 'REJECTED')}
                                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-[11px] rounded-lg cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Gateways */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(gateways).map(([gwName, enabled]) => (
            <div
              key={gwName}
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
              }`}
            >
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{gwName}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {enabled ? 'Active on checkout' : 'Disabled on checkout'}
                </p>
              </div>
              <button
                onClick={() => onToggleGateway(gwName)}
                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-colors cursor-pointer ${
                  enabled
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : isLight
                    ? 'bg-slate-100 text-slate-500 border border-slate-200'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {enabled ? 'Active' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
