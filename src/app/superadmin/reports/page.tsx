'use client';

import React from 'react';
import SuperadminLayout from '@/components/superadmin-layout';
import { BarChart3, TrendingUp, Download, DollarSign, ShoppingBag, Store } from 'lucide-react';

export default function SuperadminReportsPage() {
  return (
    <SuperadminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">System Analytics & Financial Reports</h1>
            <p className="text-xs text-slate-400 mt-1">
              Cross-platform audit reports, merchant payout reconciliation, and tax exports.
            </p>
          </div>
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-black px-4 py-2.5 rounded-xl border border-slate-700 transition-all">
            <Download className="w-4 h-4" />
            <span>Export CSV Audit Ledger</span>
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-8 rounded-3xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-white">Financial Settlement Engine Active</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            All transaction ledgers are synchronized with automated VAT (8%) and marketplace commission (8.5%). Real-time reports generate dynamically.
          </p>
        </div>
      </div>
    </SuperadminLayout>
  );
}
