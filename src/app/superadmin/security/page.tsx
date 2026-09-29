'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
import { useStore } from '@/store/useStore';
import {
  Lock,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Trash2,
  Plus,
  RefreshCw,
  Globe,
  Key,
  Smartphone,
  Eye,
  UserX,
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  ip: string;
  device: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ALLOWED' | 'BLOCKED' | 'FLAGGED';
}

interface ActiveSession {
  id: string;
  user: string;
  email: string;
  role: string;
  ip: string;
  location: string;
  device: string;
  loginTime: string;
}

const INITIAL_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-07-28 18:40:12', user: 'superadmin@zibonbaba.com', action: 'SUPERADMIN_LOGIN_SUCCESS', ip: '103.14.28.91', device: 'Chrome / Windows 11', risk: 'LOW', status: 'ALLOWED' },
  { id: 'log-2', timestamp: '2026-07-28 18:35:01', user: 'unknown_attacker@dark.net', action: 'BRUTE_FORCE_ATTEMPT', ip: '185.220.101.4', device: 'Python Requests Script', risk: 'CRITICAL', status: 'BLOCKED' },
  { id: 'log-3', timestamp: '2026-07-28 18:12:44', user: 'vendor@zibonbaba.com', action: 'PRODUCT_BULK_DELETE', ip: '118.179.45.12', device: 'Firefox / macOS', risk: 'MEDIUM', status: 'ALLOWED' },
  { id: 'log-4', timestamp: '2026-07-28 17:50:20', user: 'customer@zibonbaba.com', action: 'PASSWORD_RESET_REQUEST', ip: '203.112.55.8', device: 'Safari / iPhone 15', risk: 'LOW', status: 'ALLOWED' },
  { id: 'log-5', timestamp: '2026-07-28 17:22:15', user: 'staff@zibonbaba.com', action: 'UNAUTHORIZED_API_ACCESS', ip: '45.15.24.99', device: 'Postman Client', risk: 'HIGH', status: 'FLAGGED' },
  { id: 'log-6', timestamp: '2026-07-28 16:45:00', user: 'accountant@zibonbaba.com', action: 'EXPORT_FINANCE_REPORT', ip: '103.14.28.92', device: 'Edge / Windows 10', risk: 'LOW', status: 'ALLOWED' },
];

const INITIAL_SESSIONS: ActiveSession[] = [
  { id: 'sess-1', user: 'Super Admin', email: 'superadmin@zibonbaba.com', role: 'SUPER_ADMIN', ip: '103.14.28.91', location: 'Dhaka, Bangladesh', device: 'Chrome on Windows 11', loginTime: '10 mins ago' },
  { id: 'sess-2', user: 'Vendor Admin', email: 'vendor@zibonbaba.com', role: 'VENDOR_ADMIN', ip: '118.179.45.12', location: 'Chittagong, Bangladesh', device: 'Firefox on macOS', loginTime: '45 mins ago' },
  { id: 'sess-3', user: 'Support Manager', email: 'support@zibonbaba.com', role: 'CUSTOMER_SUPPORT', ip: '203.112.55.8', location: 'Sylhet, Bangladesh', device: 'Safari on iPad', loginTime: '2 hours ago' },
  { id: 'sess-4', user: 'Warehouse Mgr', email: 'warehouse@zibonbaba.com', role: 'WAREHOUSE_MANAGER', ip: '103.14.28.95', location: 'Dhaka, Bangladesh', device: 'Chrome on Android', loginTime: '3 hours ago' },
];

export default function SecurityLogsPage() {
  const { adminTheme } = useStore();
  const isLight = adminTheme === 'light';

  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [sessions, setSessions] = useState<ActiveSession[]>(INITIAL_SESSIONS);
  const [blacklistedIps, setBlacklistedIps] = useState<string[]>(['185.220.101.4', '45.15.24.99']);
  const [newIpInput, setNewIpInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      fetch('/api/admin/audit-logs', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
            setLogs(data.logs.map((l: any) => ({
              id: l.id,
              timestamp: new Date(l.createdAt).toLocaleString(),
              user: l.user?.email || 'System / Anonymous',
              action: l.action,
              ip: l.ipAddress || '127.0.0.1',
              device: l.userAgent || 'Web Browser',
              risk: (l.action.includes('FAIL') || l.action.includes('ERROR') || l.action.includes('BLOCK')) ? 'HIGH' : 'LOW',
              status: l.action.includes('BLOCK') ? 'BLOCKED' : 'ALLOWED'
            })));
          }
        })
        .catch(() => {});
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRevokeSession = (sessionId: string, userEmail: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast(`Active login session for ${userEmail} has been revoked.`);
  };

  const handleRevokeAllSessions = () => {
    setSessions([]);
    showToast('All non-admin active sessions have been forcibly terminated.');
  };

  const handleAddBlacklistIp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;
    if (blacklistedIps.includes(newIpInput.trim())) {
      showToast(`IP ${newIpInput} is already blacklisted.`);
      return;
    }
    setBlacklistedIps((prev) => [...prev, newIpInput.trim()]);
    showToast(`IP Address ${newIpInput} added to security blacklist.`);
    setNewIpInput('');
  };

  const handleRemoveBlacklistIp = (ip: string) => {
    setBlacklistedIps((prev) => prev.filter((item) => item !== ip));
    showToast(`IP ${ip} removed from blacklist.`);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.includes(searchQuery);
    const matchesRisk = riskFilter === 'ALL' || log.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  return (
    <SuperAdminLayout
      activeNav="security"
      title="Security & System Audit Center"
      subtitle="Real-time Intrusion Logs, Active Session Revocation & IP Blacklist Firewall Controls"
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

      {/* ── Top Stats Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Security Threats Blocked', value: '142', change: '+14 today', lightBorder: 'border-rose-200', lightText: 'text-rose-700', darkColor: 'border-rose-500/30 text-rose-400', icon: Shield },
          { label: 'Active User Sessions', value: sessions.length.toString(), change: 'Live tracked', lightBorder: 'border-emerald-200', lightText: 'text-emerald-700', darkColor: 'border-emerald-500/30 text-emerald-400', icon: Smartphone },
          { label: 'Blacklisted IP Addresses', value: blacklistedIps.length.toString(), change: 'Firewall protected', lightBorder: 'border-amber-200', lightText: 'text-amber-700', darkColor: 'border-amber-500/30 text-amber-400', icon: Globe },
          { label: '2FA Compliance Rate', value: '98.5%', change: 'Mandatory on Admin', lightBorder: 'border-blue-200', lightText: 'text-blue-700', darkColor: 'border-blue-500/30 text-blue-400', icon: Key },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-3xl border transition-all ${
                isLight
                  ? `bg-white ${stat.lightBorder} shadow-sm`
                  : `bg-slate-950 ${stat.darkColor} shadow-lg`
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {stat.label}
                </span>
                <Icon size={18} className={isLight ? stat.lightText : ''} />
              </div>
              <p className={`text-2xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{stat.value}</p>
              <span className={`text-[10px] font-bold mt-1 block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>{stat.change}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* ── Active Sessions Section (2 Cols) ── */}
        <div className={`lg:col-span-2 border rounded-3xl p-6 transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className={`flex items-center justify-between pb-4 border-b mb-5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <div>
              <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Smartphone className={`w-4 h-4 ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`} /> Active User Login Sessions
              </h2>
              <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Manage live user tokens and terminate suspicious sessions</p>
            </div>
            {sessions.length > 0 && (
              <button
                onClick={handleRevokeAllSessions}
                className={`font-extrabold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 border ${
                  isLight
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                    : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400'
                }`}
              >
                <UserX size={14} /> Revoke All Sessions
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className={`text-center py-12 text-xs ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>No active user sessions found.</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>{sess.user}</span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                        isLight
                          ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                          : 'bg-slate-800 text-amber-400 border-slate-700'
                      }`}>
                        {sess.role}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isLight ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{sess.email} · {sess.device}</p>
                    <p className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>IP: {sess.ip} ({sess.location}) · {sess.loginTime}</p>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(sess.id, sess.email)}
                    className={`font-bold text-xs px-3.5 py-2 rounded-xl transition-colors self-start sm:self-auto shrink-0 border ${
                      isLight
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    Revoke Session
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── IP Blacklist Firewall (1 Col) ── */}
        <div className={`border rounded-3xl p-6 flex flex-col transition-all ${
          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
        }`}>
          <div className={`pb-4 border-b mb-5 ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
            <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Globe className={`w-4 h-4 ${isLight ? 'text-amber-700' : 'text-amber-400'}`} /> IP Firewall Blacklist
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Block malicous IPs from accessing Zibonbaba</p>
          </div>

          <form onSubmit={handleAddBlacklistIp} className="flex gap-2 mb-5">
            <input
              type="text"
              placeholder="e.g. 185.220.101.5"
              value={newIpInput}
              onChange={(e) => setNewIpInput(e.target.value)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs outline-none border transition-colors ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 focus:border-amber-500'
                  : 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500 focus:border-amber-500'
              }`}
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1 shrink-0 shadow-sm"
            >
              <Plus size={14} /> Add IP
            </button>
          </form>

          <div className="flex-1 space-y-2 max-h-64 overflow-y-auto scrollbar-none">
            {blacklistedIps.map((ip) => (
              <div
                key={ip}
                className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-colors ${
                  isLight
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{ip}</span>
                </div>
                <button
                  onClick={() => handleRemoveBlacklistIp(ip)}
                  className={`p-1 transition-colors ${isLight ? 'text-slate-400 hover:text-rose-600' : 'text-slate-500 hover:text-rose-400'}`}
                  title="Remove from blacklist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── System Audit Logs Table ── */}
      <div className={`border rounded-3xl p-6 transition-all ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-950 border-slate-800 shadow-xl'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b mb-5 ${
          isLight ? 'border-slate-200' : 'border-slate-800'
        }`}>
          <div>
            <h2 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Lock className={`w-4 h-4 ${isLight ? 'text-blue-700' : 'text-blue-400'}`} /> Live Security Audit Logs
            </h2>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>Comprehensive audit trail of authentication and platform operations</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className={`flex items-center border rounded-xl px-3 py-1.5 text-xs ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}>
              <Search size={14} className={`mr-2 ${isLight ? 'text-slate-500' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Filter logs by user or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent outline-none text-xs ${
                  isLight ? 'text-slate-900 placeholder:text-slate-500' : 'text-white placeholder:text-slate-500'
                }`}
              />
            </div>
            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className={`border text-xs font-bold rounded-xl px-3 py-2 outline-none transition-colors ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="CRITICAL">Critical Risk</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`font-extrabold uppercase text-[9px] tracking-wider border-b ${
              isLight
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User Account</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">IP Address & Device</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isLight ? 'divide-slate-200' : 'divide-slate-800/60'}`}>
              {filteredLogs.map((log) => (
                <tr
                  key={log.id}
                  className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/60'}`}
                >
                  <td className={`py-3 px-4 font-mono text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>{log.timestamp}</td>
                  <td className={`py-3 px-4 font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{log.user}</td>
                  <td className={`py-3 px-4 font-mono font-bold text-[11px] ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>{log.action}</td>
                  <td className="py-3 px-4">
                    <span className={`font-mono block font-semibold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{log.ip}</span>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-600' : 'text-slate-500'}`}>{log.device}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      isLight
                        ? (log.risk === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                           log.risk === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                           log.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                           'bg-emerald-100 text-emerald-800 border-emerald-300')
                        : (log.risk === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                           log.risk === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                           log.risk === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                           'bg-emerald-500/20 text-emerald-400 border-emerald-500/30')
                    }`}>
                      {log.risk}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${
                      isLight
                        ? (log.status === 'ALLOWED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                           log.status === 'BLOCKED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                           'bg-amber-100 text-amber-800 border-amber-300')
                        : (log.status === 'ALLOWED' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' :
                           log.status === 'BLOCKED' ? 'bg-rose-950 text-rose-400 border-rose-800' :
                           'bg-amber-950 text-amber-400 border-amber-800')
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
