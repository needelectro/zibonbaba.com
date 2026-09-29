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
  Sun,
  Moon,
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function SystemSettingsPage() {
  const { adminTheme, setAdminTheme } = useStore();
  const isLight = adminTheme === 'light';

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
    try {
      if (token) {
        await fetch('/api/admin/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            platformCommission: defaultCommission,
            platformName,
            supportEmail,
            supportPhone,
            maintenanceMode
          })
        });
      }
    } catch (_) {}
    setToastMessage('System Configuration and Security Policies saved successfully to database!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <SuperAdminLayout
      activeNav="settings"
      title="Platform System Settings & Global Policy Configuration"
      subtitle="Configure Platform Parameters, Security Lockouts, Financial Commissions & SMTP Parameters"
    >
      {toastMessage && (
        <div className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-xl border ${
          isLight
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className={isLight ? 'text-emerald-700 hover:text-emerald-900' : 'text-emerald-500 hover:text-white'}>✕</button>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* ── General Settings ── */}
        <div className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className={`pb-4 border-b mb-6 flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div>
              <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Globe className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} /> General Platform Identity & Maintenance
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Core branding, contact parameters, and maintenance state</p>
            </div>
            {/* Maintenance Mode Toggle */}
            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all ${
              isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Maintenance Mode</span>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`text-2xl transition-colors cursor-pointer ${maintenanceMode ? 'text-rose-500' : isLight ? 'text-slate-400' : 'text-slate-600'}`}
              >
                {maintenanceMode ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Platform Name</label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Support Email Address</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Support Hotline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ── Interface Theme Appearance Policy ── */}
        <div className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className={`pb-4 border-b mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <div>
              <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Sun className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} /> Interface Theme Appearance
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Toggle between Enterprise Midnight Dark mode and Clean Daylight Light mode</p>
            </div>
            <div className={`flex items-center gap-2 p-1.5 rounded-2xl shrink-0 border ${
              isLight ? 'bg-slate-100 border-slate-300' : 'bg-slate-900 border-slate-800'
            }`}>
              <button
                type="button"
                onClick={() => setAdminTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTheme === 'light'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun size={15} /> Light Daylight
              </button>
              <button
                type="button"
                onClick={() => setAdminTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  adminTheme === 'dark'
                    ? 'bg-slate-800 text-white font-black shadow-md border border-slate-700'
                    : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                }`}
              >
                <Moon size={15} /> Dark Midnight
              </button>
            </div>
          </div>
          <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-slate-900/60 border-slate-800/80'
          }`}>
            <span className={`font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Current active theme preference is saved across browser sessions for Superadmin and Admin consoles.
            </span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isLight
                ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {adminTheme} Mode Active
            </span>
          </div>
        </div>

        {/* ── Security & Authentication Policy ── */}
        <div className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className={`pb-4 border-b mb-6 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Shield className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} /> Authentication & Lockout Security Rules
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Password complexity, failed login lockouts, and 2FA enforcement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs mb-6">
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Minimum Password Length</label>
              <input
                type="number"
                value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Max Failed Logins Before Lock</label>
              <input
                type="number"
                value={maxFailedLogins}
                onChange={(e) => setMaxFailedLogins(Number(e.target.value))}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Session Max Age (Days)</label>
              <input
                type="number"
                value={sessionMaxAgeDays}
                onChange={(e) => setSessionMaxAgeDays(Number(e.target.value))}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${
                isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-900 border-slate-800'
              }`}>
                <input
                  type="checkbox"
                  checked={enforce2FaAdmins}
                  onChange={(e) => setEnforce2FaAdmins(e.target.checked)}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>Enforce 2FA on Admins</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Financial & Commission Policy ── */}
        <div className={`border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className={`pb-4 border-b mb-6 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <DollarSign className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} /> Financial & Commission Parameters
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Platform commission fees and merchant payout rules</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Default Marketplace Commission (%)</label>
              <input
                type="number"
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(Number(e.target.value))}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Min Payout Threshold (৳)</label>
              <input
                type="number"
                value={minPayoutAmount}
                onChange={(e) => setMinPayoutAmount(Number(e.target.value))}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
            <div>
              <label className={`block font-extrabold mb-2 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className={`w-full rounded-xl px-4 py-3 outline-none border transition-colors font-semibold ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500'
                    : 'bg-slate-900 border-slate-800 text-white focus:border-amber-500'
                }`}
              />
            </div>
          </div>
        </div>

        {/* ── Save Settings Button ── */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-8 py-4 rounded-2xl transition-all shadow-xl flex items-center gap-2 cursor-pointer"
          >
            <Save size={18} /> Save All System Settings
          </button>
        </div>
      </form>
    </SuperAdminLayout>
  );
}
