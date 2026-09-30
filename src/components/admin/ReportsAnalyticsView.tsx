'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  DollarSign,
  Download,
  Calendar,
  Users,
  ShoppingBag,
  CreditCard,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  RefreshCw,
  Store,
  Layers
} from 'lucide-react';

interface ReportsData {
  summary: {
    grossVolume: number;
    platformCommission: number;
    netMerchantPayout: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    totalVendors: number;
    totalProducts: number;
    totalStores: number;
  };
  timeline: { date: string; gmv: number; orders: number; commission: number }[];
  categoryBreakdown: { name: string; totalSales: number; unitsSold: number }[];
  topStores: { storeName: string; totalSales: number; commission: number; orderCount: number }[];
  recentOrders: { id: string; customer: string; store: string; total: number; status: string; date: string }[];
}

interface ReportsAnalyticsViewProps {
  isLight: boolean;
  token: string | null;
  showToast?: (msg: string) => void;
}

export default function ReportsAnalyticsView({
  isLight,
  token,
  showToast = () => {}
}: ReportsAnalyticsViewProps) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/admin/reports?timeframe=${timeframe}`, {
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      const resData = await res.json();
      if (res.ok) {
        setData(resData);
      }
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeframe]);

  const handleExportCsv = () => {
    if (!data) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += '--- ZIBONBABA FINANCIAL & REVENUE REPORT ---\n';
    csvContent += `Report Period: ${timeframe.toUpperCase()}\n`;
    csvContent += `Generated At: ${new Date().toISOString()}\n\n`;

    csvContent += 'METRIC,VALUE\n';
    csvContent += `Gross Merchandise Volume (GMV),৳${data.summary.grossVolume}\n`;
    csvContent += `Platform Commission,৳${data.summary.platformCommission}\n`;
    csvContent += `Net Merchant Payout,৳${data.summary.netMerchantPayout}\n`;
    csvContent += `Total Orders,${data.summary.totalOrders}\n`;
    csvContent += `Delivered Orders,${data.summary.completedOrders}\n`;
    csvContent += `Average Order Value,৳${data.summary.avgOrderValue}\n\n`;

    csvContent += 'STORE NAME,TOTAL SALES (BDT),COMMISSION (BDT),ORDERS\n';
    data.topStores.forEach(s => {
      csvContent += `"${s.storeName}",৳${s.totalSales},৳${s.commission},${s.orderCount}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zibonbaba_Report_${timeframe.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Financial report for ${timeframe.toUpperCase()} exported to CSV.`);
  };

  const summary = data?.summary || {
    grossVolume: 0,
    platformCommission: 0,
    netMerchantPayout: 0,
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalProducts: 0,
    totalStores: 0
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Financial Intelligence & Platform Reports
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Gross merchandise value, marketplace commission split, merchant settlement ledgers & sales velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe selector */}
          <div className={`flex items-center p-1 rounded-xl border ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
          }`}>
            {(['today', 'week', 'month', 'year', 'all'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  timeframe === t
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={fetchReports}
            className={`p-2 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Refresh Report Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>

          <button
            onClick={handleExportCsv}
            className="bg-[#FFC107] text-slate-950 hover:bg-amber-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Gross Sales (GMV)</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-amber-500">৳{summary.grossVolume.toLocaleString()}</span>
            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Over {summary.totalOrders} total customer orders
            </p>
          </div>
        </div>

        {/* Platform Commission */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Platform Commission</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-500">৳{summary.platformCommission.toLocaleString()}</span>
            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Earned platform fee revenue
            </p>
          </div>
        </div>

        {/* Net Merchant Settlement */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Merchant Net Payout</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-blue-400">৳{summary.netMerchantPayout.toLocaleString()}</span>
            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              To {summary.totalStores} active stores
            </p>
          </div>
        </div>

        {/* Average Order Value */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Avg Order Basket</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-400">৳{summary.avgOrderValue.toLocaleString()}</span>
            <p className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Average customer transaction
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Stores & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Stores Breakdown */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-800">
            <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-500" /> Top Performing Vendor Stores
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{data?.topStores?.length || 0} Stores</span>
          </div>

          <div className="space-y-3">
            {(!data?.topStores || data.topStores.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No store sales recorded in this timeframe.</p>
            ) : (
              data.topStores.map((s, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div>
                    <p className="font-bold text-xs">{s.storeName}</p>
                    <p className="text-[10px] text-slate-400">{s.orderCount} orders completed</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs text-amber-500">৳{s.totalSales.toLocaleString()}</p>
                    <p className="text-[10px] text-emerald-500">Comm: ৳{Math.round(s.commission).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className={`p-5 rounded-2xl border ${isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'}`}>
          <div className="flex items-center justify-between border-b pb-3 mb-4 border-slate-800">
            <h3 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" /> Category Revenue Velocity
            </h3>
            <span className="text-[10px] text-slate-400 font-bold">{data?.categoryBreakdown?.length || 0} Categories</span>
          </div>

          <div className="space-y-3">
            {(!data?.categoryBreakdown || data.categoryBreakdown.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No category sales in this timeframe.</p>
            ) : (
              data.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}>
                  <div>
                    <p className="font-bold text-xs">{cat.name}</p>
                    <p className="text-[10px] text-slate-400">{cat.unitsSold} units ordered</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-xs text-emerald-500">৳{cat.totalSales.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
