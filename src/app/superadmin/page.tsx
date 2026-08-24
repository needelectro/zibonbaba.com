'use client';

import React from 'react';
import SuperadminLayout from '@/components/superadmin-layout';
import { ShieldCheck, Users, Store, DollarSign, Activity, Server, AlertTriangle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function SuperadminOverviewPage() {
  const stats = [
    { label: 'Total Verified Merchants', val: '142', change: '+12% this month', icon: Store, color: 'text-amber-500' },
    { label: 'Active Buyer Accounts', val: '18,490', change: '+24% this week', icon: Users, color: 'text-blue-500' },
    { label: 'Platform GMV (Monthly)', val: '৳4.28M', change: '+18.4% vs last month', icon: DollarSign, color: 'text-emerald-500' },
    { label: 'System Health & Uptime', val: '99.98%', change: 'All services nominal', icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <SuperadminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white">System Command Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global monitoring, RBAC policy enforcement, and infrastructure health
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{s.label}</span>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <h3 className="text-2xl font-black text-white mt-2">{s.val}</h3>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">{s.change}</span>
              </div>
            );
          })}
        </div>

        {/* Quick Audits & System Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Security & Audit Events */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Audit Log</span>
              </h2>
              <Link href="/superadmin/security" className="text-[10px] text-slate-400 hover:text-white font-bold">
                View full logs →
              </Link>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { event: 'Superadmin root login authorized', ip: '103.205.71.14', time: '5 mins ago', status: 'SUCCESS' },
                { event: 'Role elevated for User usr_981 (VENDOR_ADMIN)', ip: '103.205.71.14', time: '1 hour ago', status: 'AUDITED' },
                { event: 'Database migration sync executed', ip: '127.0.0.1', time: '4 hours ago', status: 'SYS_OK' },
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <div>
                    <p className="font-bold text-slate-200">{log.event}</p>
                    <span className="text-[10px] font-mono text-slate-500">{log.ip} • {log.time}</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span>Cluster & Microservices Status</span>
              </h2>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { service: 'Next.js App Engine (Vercel Edge)', latency: '18ms', status: 'ONLINE' },
                { service: 'PostgreSQL Database (Prisma/Supabase)', latency: '34ms', status: 'ONLINE' },
                { service: 'Realtime WebSocket Gateway (WS:5000)', latency: '12ms', status: 'ONLINE' },
                { service: 'Multi-Tenant S3 Storage Cluster', latency: '45ms', status: 'ONLINE' },
              ].map((srv, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800/80">
                  <div>
                    <p className="font-bold text-white">{srv.service}</p>
                    <span className="text-[10px] font-mono text-slate-500">Latency: {srv.latency}</span>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black px-2 py-0.5 rounded-full">
                    {srv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  );
}
