'use client';

import React, { useState, useMemo } from 'react';
import KPICard from '../ui/KPICard';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Check,
  X,
  Lock,
  Wallet
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

interface CommerceViewProps {
  orders: any[];
  withdrawals: WithdrawalRecord[];
  totalRevenue: number;
  platformCommission: number;
  onUpdateWithdrawalStatus: (id: string, newStatus: string) => Promise<void>;
  gateways: Record<string, boolean>;
  onToggleGateway: (name: string) => void;
  isLight: boolean;
  onInspectOrder?: (order: any) => void;
}

export default function CommerceView({
  orders = [],
  withdrawals = [],
  totalRevenue = 0,
  platformCommission = 0,
  onUpdateWithdrawalStatus,
  gateways = {},
  onToggleGateway,
  isLight,
  onInspectOrder
}: CommerceViewProps) {
  const [activeTab, setActiveTab] = useState<'payments' | 'commissions' | 'refunds' | 'payouts' | 'gateways'>('payments');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Simulated / dynamic refunds state derived from cancelled/refunded orders
  const [refundRequests, setRefundRequests] = useState<any[]>([
    {
      id: 'REF-8012',
      orderId: orders[0]?.id || 'ORD-9821',
      customerName: orders[0]?.customerName || 'Rahim Ahmed',
      customerEmail: 'rahim@gmail.com',
      amount: 2450,
      reason: 'Damaged item received during transit',
      method: 'bKash',
      status: 'PENDING',
      date: '2026-09-29'
    },
    {
      id: 'REF-8013',
      orderId: orders[1]?.id || 'ORD-9822',
      customerName: orders[1]?.customerName || 'Nusrat Jahan',
      customerEmail: 'nusrat@outlook.com',
      amount: 1200,
      reason: 'Wrong size delivered by merchant',
      method: 'Nagad',
      status: 'APPROVED',
      date: '2026-09-28'
    },
    {
      id: 'REF-8014',
      orderId: 'ORD-9740',
      customerName: 'Tanvir Hossain',
      customerEmail: 'tanvir@gmail.com',
      amount: 4800,
      reason: 'Customer cancelled prior to dispatch',
      method: 'SSLCommerz',
      status: 'PROCESSED',
      date: '2026-09-25'
    }
  ]);

  const handleApproveRefund = (refId: string) => {
    setRefundRequests(prev =>
      prev.map(r => (r.id === refId ? { ...r, status: 'APPROVED' } : r))
    );
  };

  const handleRejectRefund = (refId: string) => {
    setRefundRequests(prev =>
      prev.map(r => (r.id === refId ? { ...r, status: 'REJECTED' } : r))
    );
  };

  const handleProcessRefund = (refId: string) => {
    setRefundRequests(prev =>
      prev.map(r => (r.id === refId ? { ...r, status: 'PROCESSED' } : r))
    );
  };

  // Derive payments list from orders
  const paymentsList = useMemo(() => {
    return orders.map((o, idx) => {
      const isDelivered = (o.status || '').toUpperCase() === 'DELIVERED';
      const isCancelled = ['CANCELLED', 'REFUNDED'].includes((o.status || '').toUpperCase());
      const pStatus = isCancelled ? 'REFUNDED' : isDelivered ? 'PAID' : 'PENDING';
      const method = o.source === 'POS' ? 'POS Terminal (Cash)' : idx % 2 === 0 ? 'bKash' : 'Nagad';

      return {
        paymentId: `PAY-${o.id ? o.id.slice(0, 8).toUpperCase() : `800${idx}`}`,
        orderId: o.id,
        customerName: o.customerName || o.customer?.profile?.fullName || 'Customer',
        amount: o.total || 0,
        method,
        status: pStatus,
        transactionId: `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        date: o.date || new Date().toISOString().split('T')[0]
      };
    });
  }, [orders]);

  // Derive vendor commissions list from orders
  const commissionList = useMemo(() => {
    return orders.map((o) => {
      const vendorName = o.store?.name || o.branchName || 'Zibonbaba Direct';
      const commRate = o.store?.commissionRate || 10;
      const commAmount = Math.round(((o.total || 0) * commRate) / 100);
      const vendorEarning = (o.total || 0) - commAmount;

      return {
        orderId: o.id,
        vendorName,
        orderValue: o.total || 0,
        commissionRate: commRate,
        commissionAmount: commAmount,
        vendorEarning,
        status: (o.status || '').toUpperCase() === 'DELIVERED' ? 'SETTLED' : 'PENDING',
        date: o.date || new Date().toISOString().split('T')[0]
      };
    });
  }, [orders]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return paymentsList.filter(p => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        p.paymentId.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.transactionId.toLowerCase().includes(q)
      );
    });
  }, [paymentsList, statusFilter, searchQuery]);

  // Financial summary
  const totalSettledPayments = paymentsList
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingDisbursements = withdrawals
    .filter(w => (w.status || '').toUpperCase() === 'PENDING')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const pendingRefundsTotal = refundRequests
    .filter(r => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Commerce & Financial Management
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Centralized hub for gateway transactions, vendor commission settlements, refund workflows, and payouts.
          </p>
        </div>

        <button
          onClick={() => {
            const csv = [
              ['Payment ID', 'Order ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'],
              ...paymentsList.map(p => [p.paymentId, p.orderId, p.customerName, p.amount, p.method, p.status, p.date])
            ]
              .map(r => r.join(','))
              .join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zibonbaba-commerce-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
          }}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-amber-500" />
          <span>Export Commerce Ledger</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Processed Volume"
          value={`৳${totalRevenue.toLocaleString()}`}
          subtitle={`${orders.length} marketplace orders`}
          icon={TrendingUp}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Platform Commission"
          value={`৳${platformCommission.toLocaleString()}`}
          subtitle="Net platform retained fee"
          icon={DollarSign}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Pending Payouts"
          value={`৳${pendingDisbursements.toLocaleString()}`}
          subtitle={`${withdrawals.filter(w => (w.status || '').toUpperCase() === 'PENDING').length} seller requests`}
          icon={Wallet}
          color="blue"
          isLight={isLight}
        />
        <KPICard
          title="Pending Refunds"
          value={`৳${pendingRefundsTotal.toLocaleString()}`}
          subtitle={`${refundRequests.filter(r => r.status === 'PENDING').length} claims awaiting review`}
          icon={RotateCcw}
          color="rose"
          isLight={isLight}
        />
      </div>

      {/* Commerce Tabs */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-3 text-xs font-bold ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Payments & Transactions ({paymentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commissions')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'commissions'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Marketplace Commissions</span>
        </button>

        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'refunds'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Refunds & Returns ({refundRequests.filter(r => r.status === 'PENDING').length} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('payouts')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'payouts'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Merchant Payouts ({withdrawals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'gateways'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Payment Gateways</span>
        </button>
      </div>

      {/* 1. PAYMENTS & TRANSACTIONS TAB */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              className={`flex items-center rounded-xl px-3 h-10 border text-xs w-full max-w-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search payment ID, order, customer..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Filter:</span>
              {['ALL', 'PAID', 'PENDING', 'REFUNDED'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    statusFilter === st
                      ? 'bg-amber-500 text-slate-950'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Payment ID</th>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Transaction ID</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredPayments.map(p => (
                    <tr
                      key={p.paymentId}
                      className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-500">
                        {p.paymentId}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => {
                            const ord = orders.find(o => o.id === p.orderId);
                            if (ord && onInspectOrder) onInspectOrder(ord);
                          }}
                          className="font-mono text-slate-600 dark:text-slate-300 hover:text-amber-500 underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>#{p.orderId.slice(0, 8)}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {p.customerName}
                      </td>
                      <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                        ৳{p.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.method}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                        {p.transactionId}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 font-mono">
                        {p.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMMISSIONS TAB */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-500/5 border-amber-500/20'
            }`}
          >
            <div>
              <h3 className="font-black text-xs text-amber-900 dark:text-amber-400">Platform Commission Rules</h3>
              <p className="text-[11px] text-amber-800/80 dark:text-slate-400 mt-0.5">
                Default marketplace commission rate is 10.0%. Vendor-specific custom rates override default rates upon order completion.
              </p>
            </div>
            <span className="text-xs font-mono font-black text-amber-500 px-3 py-1.5 rounded-xl bg-amber-500/10">
              Avg. 10.0% Take Rate
            </span>
          </div>

          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Order ID</th>
                    <th className="px-5 py-3.5">Merchant / Store</th>
                    <th className="px-5 py-3.5">Order Gross Value</th>
                    <th className="px-5 py-3.5">Commission Rate</th>
                    <th className="px-5 py-3.5">Commission Retained</th>
                    <th className="px-5 py-3.5">Vendor Payout Balance</th>
                    <th className="px-5 py-3.5">Settlement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {commissionList.map((c, idx) => (
                    <tr
                      key={idx}
                      className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-amber-500">
                        #{c.orderId.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                        {c.vendorName}
                      </td>
                      <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                        ৳{c.orderValue.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-400">
                        {c.commissionRate}%
                      </td>
                      <td className="px-5 py-3.5 font-black text-emerald-500">
                        ৳{c.commissionAmount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                        ৳{c.vendorEarning.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            c.status === 'SETTLED'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. REFUNDS & RETURNS TAB */}
      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Claim ID</th>
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Claim Amount</th>
                    <th className="px-5 py-3.5">Reason & Details</th>
                    <th className="px-5 py-3.5">Payout Method</th>
                    <th className="px-5 py-3.5">Claim Status</th>
                    <th className="px-5 py-3.5 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {refundRequests.map(r => (
                    <tr
                      key={r.id}
                      className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-rose-500">
                        {r.id}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        #{r.orderId.slice(0, 8)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{r.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{r.customerEmail}</span>
                      </td>
                      <td className="px-5 py-3.5 font-black text-rose-500">
                        ৳{r.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 max-w-xs text-slate-600 dark:text-slate-300">
                        {r.reason}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-500">
                        {r.method}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            r.status === 'PROCESSED'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : r.status === 'APPROVED'
                              ? 'bg-blue-500/10 text-blue-500'
                              : r.status === 'REJECTED'
                              ? 'bg-rose-500/10 text-rose-500'
                              : 'bg-amber-500/10 text-amber-500'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {r.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveRefund(r.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] hover:bg-emerald-400 transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectRefund(r.id)}
                              className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 font-bold text-[10px] hover:bg-rose-500/10 transition"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {r.status === 'APPROVED' && (
                          <button
                            onClick={() => handleProcessRefund(r.id)}
                            className="px-3 py-1 rounded-lg bg-[#FFC107] text-slate-950 font-black text-[10px] hover:bg-amber-400 transition"
                          >
                            Disburse Funds
                          </button>
                        )}
                        {r.status === 'PROCESSED' && (
                          <span className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="w-3 h-3" /> Refund Settled
                          </span>
                        )}
                        {r.status === 'REJECTED' && (
                          <span className="text-[10px] text-rose-500 font-bold flex items-center justify-end gap-1">
                            <XCircle className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MERCHANT PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Request ID</th>
                    <th className="px-5 py-3.5">Merchant / Partner</th>
                    <th className="px-5 py-3.5">Role</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Gateway / Bank</th>
                    <th className="px-5 py-3.5">Account Details</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Disbursement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No merchant payout requests in the ledger.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map(w => {
                      const isPending = (w.status || '').toUpperCase() === 'PENDING';
                      return (
                        <tr
                          key={w.id}
                          className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}
                        >
                          <td className="px-5 py-3.5 font-mono font-bold text-amber-500">
                            #{w.id.slice(0, 8)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                            {w.userName || w.user?.fullName || w.user?.email || 'Merchant'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                              {w.role || 'VENDOR'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-black text-emerald-500 text-sm">
                            ৳{w.amount.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-700 dark:text-slate-300">
                            {w.paymentMethod}
                          </td>
                          <td className="px-5 py-3.5 font-mono text-slate-400">
                            {w.accountNumber}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={w.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => onUpdateWithdrawalStatus(w.id, 'APPROVED')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] hover:bg-emerald-400 transition"
                                >
                                  Disburse
                                </button>
                                <button
                                  onClick={() => onUpdateWithdrawalStatus(w.id, 'REJECTED')}
                                  className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 font-bold text-[10px] hover:bg-rose-500/10 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-slate-400">{w.status}</span>
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
        </div>
      )}

      {/* 5. PAYMENT GATEWAYS TAB */}
      {activeTab === 'gateways' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: 'bKash',
                name: 'bKash Merchant PGW',
                desc: 'Direct mobile wallet checkout with automated tokenized billing',
                tag: 'MFS Bangladesh',
                icon: 'bKash'
              },
              {
                id: 'Nagad',
                name: 'Nagad Direct Gateway',
                desc: 'Instant QR and mobile wallet settlement via Bangladesh Post',
                tag: 'MFS Bangladesh',
                icon: 'Nagad'
              },
              {
                id: 'Rocket',
                name: 'DBBL Rocket',
                desc: 'Dutch-Bangla Bank mobile banking infrastructure',
                tag: 'Banking',
                icon: 'Rocket'
              },
              {
                id: 'SSLCommerz',
                name: 'SSLCommerz Unified',
                desc: 'Multi-card acceptance (Visa, Mastercard, Amex, Internet Banking)',
                tag: 'Card PGW',
                icon: 'SSLCommerz'
              },
              {
                id: 'Stripe',
                name: 'Stripe International',
                desc: 'Global credit & debit cards with 3D Secure 2.0 verification',
                tag: 'Global',
                icon: 'Stripe'
              },
              {
                id: 'CashOnDelivery',
                name: 'Cash On Delivery (COD)',
                desc: 'Rider cash collection upon doorstep package handover',
                tag: 'Offline',
                icon: 'COD'
              }
            ].map(gw => {
              const isActive = gateways[gw.id] ?? true;

              return (
                <div
                  key={gw.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500">
                      {gw.tag}
                    </span>
                    <button
                      onClick={() => onToggleGateway(gw.id)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                        isActive ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                    {gw.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {gw.desc}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className={`font-bold flex items-center gap-1.5 ${isActive ? 'text-emerald-500' : 'text-slate-500'}`}>
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                      <span>{isActive ? 'Active for Checkout' : 'Disabled'}</span>
                    </span>
                    <button
                      onClick={() => onToggleGateway(gw.id)}
                      className="text-[11px] font-bold text-amber-500 hover:underline cursor-pointer"
                    >
                      {isActive ? 'Configure Keys' : 'Enable'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
