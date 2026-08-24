'use client';

import React, { useState } from 'react';
import SuperadminLayout from '@/components/superadmin-layout';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export default function SuperadminSettingsPage() {
  const [platformName, setPlatformName] = useState('Zibonbaba.com');
  const [commissionRate, setCommissionRate] = useState('8.5');
  const [vatRate, setVatRate] = useState('8.0');
  const [shippingFee, setShippingFee] = useState('10.00');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <SuperadminLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-black text-white">Global Platform Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure system fees, tax percentages, currency defaults, and site branding.
          </p>
        </div>

        {saved && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Platform settings updated successfully across all edge instances.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Marketplace Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform Commission (%)
                </label>
                <input
                  type="text"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  VAT / Tax Rate (%)
                </label>
                <input
                  type="text"
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Standard Shipping Fee (৳)
                </label>
                <input
                  type="text"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3.5 rounded-xl shadow-lg transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Global Configuration</span>
          </button>
        </form>
      </div>
    </SuperadminLayout>
  );
}
