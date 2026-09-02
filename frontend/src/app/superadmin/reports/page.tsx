'use client';

import React from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';

export default function SuperAdminReportsPage() {
  return (
    <SuperAdminLayout activeNav="/superadmin/reports">
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Audit & Analytics Reports</h1>
          <p className="text-xs text-slate-400">Generate compliance, revenue, and system activity logs.</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          System analytics dashboard & automated CSV export center ready.
        </div>
      </div>
    </SuperAdminLayout>
  );
}
