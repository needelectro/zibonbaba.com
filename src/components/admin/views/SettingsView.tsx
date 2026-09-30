'use client';

import React, { useState } from 'react';
import { Settings2, Save, CheckCircle, ShieldCheck, DollarSign, Truck, Percent } from 'lucide-react';

interface SettingsViewProps {
  shippingCost: number;
  setShippingCost: (val: number) => void;
  globalVAT: number;
  setGlobalVAT: (val: number) => void;
  platformCommission: number;
  setPlatformCommission: (val: number) => void;
  gateways: Record<string, boolean>;
  onToggleGateway: (name: string) => void;
  onSaveSettings: () => Promise<void>;
  savedMsg: string;
  isLight: boolean;
}

export default function SettingsView({
  shippingCost,
  setShippingCost,
  globalVAT,
  setGlobalVAT,
  platformCommission,
  setPlatformCommission,
  gateways,
  onToggleGateway,
  onSaveSettings,
  savedMsg,
  isLight
}: SettingsViewProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-amber-500" />
            Global Platform Configuration & Tariffs
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure nationwide shipping tariffs, platform commission baseline, VAT deductions, and payment gateways.
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-fade-in">
            <CheckCircle className="w-4 h-4" /> {savedMsg}
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Base Platform Commission */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">
              <Percent className="w-4 h-4 text-amber-500" /> Baseline Marketplace Commission
            </div>
            <p className="text-[11px] text-slate-400">
              Default commission percentage deducted from vendor sales when not individually overridden.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={platformCommission}
                  onChange={(e) => setPlatformCommission(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
                <span className="text-sm font-black text-slate-400">%</span>
              </div>
            </div>
          </div>

          {/* Standard Shipping Tariff */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">
              <Truck className="w-4 h-4 text-blue-500" /> Standard Delivery Fee
            </div>
            <p className="text-[11px] text-slate-400">
              Default flat-rate nationwide shipping cost billed to customer during cart checkout.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-400">৳</span>
                <input
                  type="number"
                  step="1"
                  required
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Global VAT Tariff */}
          <div
            className={`p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase">
              <DollarSign className="w-4 h-4 text-emerald-500" /> National VAT Rate
            </div>
            <p className="text-[11px] text-slate-400">
              Standard Value-Added Tax percentage calculated on checkout and recorded for NBR compliance.
            </p>
            <div className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={globalVAT}
                  onChange={(e) => setGlobalVAT(parseFloat(e.target.value) || 0)}
                  className={`w-full p-2.5 rounded-xl border text-sm font-mono font-bold outline-none ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                />
                <span className="text-sm font-black text-slate-400">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Gateways Section */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Live Payment Gateway Integrations
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(gateways).map(([name, enabled]) => (
              <div
                key={name}
                onClick={() => onToggleGateway(name)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  enabled
                    ? isLight
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-emerald-500/10 border-emerald-500/30'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <span className="font-extrabold text-xs text-slate-900 dark:text-white">{name}</span>
                <span
                  className={`text-[10px] font-bold mt-2 font-mono ${
                    enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {enabled ? '● ONLINE' : '○ DISABLED'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Global Platform Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
