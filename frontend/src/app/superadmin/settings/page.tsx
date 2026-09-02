'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import {
  Settings,
  Shield,
  DollarSign,
  Mail,
  Lock,
  Globe,
  Save,
  CheckCircle,
  AlertTriangle,
  Server,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function SystemSettingsPage() {
  const [platformName, setPlatformName] = useState('Zibonbaba.com');
  const [supportEmail, setSupportEmail] = useState('support@zibonbaba.com');
  const [supportPhone, setSupportPhone] = useState('+880 1711-000000');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security Policy
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [maxFailedLogins, setMaxFailedLogins] = useState(5);
  const [sessionMaxAgeDays, setSessionMaxAgeDays] = useState(7);
  const [enforce2FaAdmins, setEnforce2FaAdmins] = useState(true);

  // Financial Policy
  const [defaultCommission, setDefaultCommission] = useState(10);
  const [minPayoutAmount, setMinPayoutAmount] = useState(1000);
  const [currencySymbol, setCurrencySymbol] = useState('৳');

  // SMTP Settings
  const [smtpHost, setSmtpHost] = useState('smtp.zibonbaba.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('notifications@zibonbaba.com');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      fetch('/api/admin/settings', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            if (data.settings.platformCommission !== undefined) setDefaultCommission(data.settings.platformCommission);
            if (data.settings.platformName) setPlatformName(data.settings.platformName);
            if (data.settings.supportEmail) setSupportEmail(data.settings.supportEmail);
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      try {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            settings: {
              platformName,
              supportEmail,
              platformCommission: defaultCommission,
              maintenanceMode
            }
          })
        });
      } catch (_) {}
    }
    setToastMessage('Platform system settings updated successfully.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <SuperAdminLayout
      activeNav="/superadmin/settings"
      title="Global Platform Settings"
      subtitle="Configure core enterprise parameters, financial commission policies & security rules"
    >
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {toastMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-2xl flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Action Header */}
        <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-100">Configuration Engine</h2>
              <p className="text-[11px] text-slate-400">Applies across API gateway and multi-tenant nodes</p>
            </div>
          </div>
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Platform Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <Globe className="w-4 h-4 text-amber-500" />
              General Platform Identity
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Support & Helpdesk Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Support Phone Line</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center justify-between p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-slate-200">Maintenance Mode</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Restrict non-admin access during database migrations</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="accent-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Financial Policy Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              Financial & Marketplace Policies
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Default Platform Commission Rate (%)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={defaultCommission}
                  onChange={(e) => setDefaultCommission(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">%</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Minimum Merchant Withdrawal (BDT)</label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  step="100"
                  value={minPayoutAmount}
                  onChange={(e) => setMinPayoutAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-bold">৳ BDT</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1.5">Primary Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>
      </form>
    </SuperAdminLayout>
  );
}
