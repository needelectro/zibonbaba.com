'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, CreditCard, BarChart2 } from 'lucide-react';

export type TimeframeOption = 'today' | '7days' | '30days' | '90days' | 'year';

interface SalesDataPoint {
  date: string;
  gmv: number;
  orders: number;
  commission: number;
}

interface SalesOverviewChartProps {
  data?: SalesDataPoint[];
  selectedTimeframe: TimeframeOption;
  onTimeframeChange: (tf: TimeframeOption) => void;
  isLight: boolean;
  totalGmv?: number;
  totalCommission?: number;
  totalOrders?: number;
}

export default function SalesOverviewChart({
  data = [],
  selectedTimeframe,
  onTimeframeChange,
  isLight,
  totalGmv,
  totalCommission,
  totalOrders
}: SalesOverviewChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [activeMetric, setActiveMetric] = useState<'gmv' | 'commission' | 'orders'>('gmv');

  const hasData = data && data.length > 0 && data.some((d) => d.gmv > 0 || d.orders > 0 || d.commission > 0);

  const formatCurrency = (val: number) => `৳${Number(val || 0).toLocaleString()}`;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div
          className={`p-3 rounded-xl border shadow-xl text-xs space-y-1.5 min-w-[160px] ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-900 border-slate-800 text-white'
          }`}
        >
          <p className="font-extrabold text-[11px] text-slate-400 border-b pb-1 border-slate-100 dark:border-slate-800">
            {p.date}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Gross Sales:</span>
            <span className="font-mono font-bold text-amber-500">{formatCurrency(p.gmv)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Commission:</span>
            <span className="font-mono font-bold text-emerald-500">{formatCurrency(p.commission)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-500">Orders:</span>
            <span className="font-mono font-bold text-blue-500">{p.orders}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-xl'
      }`}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-4 border-slate-100 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-500" />
              Sales & Revenue Performance
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Live Flow
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Operational GMV, platform retained commission, and transactional volume.
          </p>
        </div>

        {/* Timeframe & Chart Type Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'today', label: 'Today' },
              { id: '7days', label: '7 Days' },
              { id: '30days', label: '30 Days' },
              { id: '90days', label: '90 Days' },
              { id: 'year', label: 'This Year' }
            ] as const
          ).map((tf) => (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedTimeframe === tf.id
                  ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
                  : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}

          <div className="border-l pl-1.5 ml-1 border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button
              onClick={() => setChartType('area')}
              className={`p-1 rounded-md text-xs transition-colors ${
                chartType === 'area'
                  ? 'bg-slate-200 dark:bg-slate-800 text-amber-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Area Chart"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-1 rounded-md text-xs transition-colors ${
                chartType === 'bar'
                  ? 'bg-slate-200 dark:bg-slate-800 text-amber-500'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Bar Chart"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Quick Selectors */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div
          onClick={() => setActiveMetric('gmv')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            activeMetric === 'gmv'
              ? 'border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/20'
              : isLight
              ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Sales (GMV)
          </span>
          <span className="text-base font-extrabold font-mono text-amber-500 mt-0.5 block">
            {totalGmv !== undefined ? formatCurrency(totalGmv) : '৳0'}
          </span>
        </div>

        <div
          onClick={() => setActiveMetric('commission')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            activeMetric === 'commission'
              ? 'border-emerald-500/50 bg-emerald-500/5 ring-1 ring-emerald-500/20'
              : isLight
              ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Platform Commission
          </span>
          <span className="text-base font-extrabold font-mono text-emerald-500 mt-0.5 block">
            {totalCommission !== undefined ? formatCurrency(totalCommission) : '৳0'}
          </span>
        </div>

        <div
          onClick={() => setActiveMetric('orders')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            activeMetric === 'orders'
              ? 'border-blue-500/50 bg-blue-500/5 ring-1 ring-blue-500/20'
              : isLight
              ? 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Orders Volume
          </span>
          <span className="text-base font-extrabold font-mono text-blue-500 mt-0.5 block">
            {totalOrders !== undefined ? totalOrders : 0} Orders
          </span>
        </div>
      </div>

      {/* Chart Canvas or Professional Empty State */}
      <div className="h-64 w-full">
        {!hasData ? (
          <div
            className={`w-full h-full rounded-xl border border-dashed flex flex-col items-center justify-center p-6 text-center ${
              isLight ? 'border-slate-200 bg-slate-50/60' : 'border-slate-800 bg-slate-950/30'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-2">
              <BarChart2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
              No sales data available for this period.
            </h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
              New transactions and confirmed customer orders will automatically populate this real-time analytics velocity chart.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFC107" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FFC107" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isLight ? '#F1F5F9' : '#1E293B'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={isLight ? '#94A3B8' : '#64748B'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isLight ? '#94A3B8' : '#64748B'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `৳${Math.round(v / 1000)}k` : `৳${v}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                {activeMetric === 'gmv' && (
                  <Area
                    type="monotone"
                    dataKey="gmv"
                    stroke="#FFC107"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorGmv)"
                  />
                )}
                {activeMetric === 'commission' && (
                  <Area
                    type="monotone"
                    dataKey="commission"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorComm)"
                  />
                )}
                {activeMetric === 'orders' && (
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3B82F6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                )}
              </AreaChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isLight ? '#F1F5F9' : '#1E293B'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={isLight ? '#94A3B8' : '#64748B'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={isLight ? '#94A3B8' : '#64748B'}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => (v >= 1000 ? `৳${Math.round(v / 1000)}k` : `৳${v}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={activeMetric}
                  fill={activeMetric === 'gmv' ? '#FFC107' : activeMetric === 'commission' ? '#10B981' : '#3B82F6'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
