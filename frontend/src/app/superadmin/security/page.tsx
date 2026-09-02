'use client';

import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '@/components/superadmin-layout';
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
    showToast(`IP Address ${ip} removed from security blacklist.`);
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
      activeNav="/superadmin/security"
      title="Security Center & Threat Monitoring"
      subtitle="Real-time security logs, active sessions, IP firewall and zero-trust audit compliance"
    >
      <div className="space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-2xl flex items-center justify-between animate-slide-up">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)}>
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Sessions Panel */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    Active Privileged Sessions
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Live JWT tokens with operator clearance</p>
                </div>
                <button
                  onClick={handleRevokeAllSessions}
                  className="text-[10px] font-black uppercase text-rose-400 hover:text-rose-300 transition"
                >
                  Kill All
                </button>
              </div>

              <div className="space-y-2.5">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-slate-200">{s.user}</span>
                      <button
                        onClick={() => handleRevokeSession(s.id, s.email)}
                        className="text-[10px] font-black text-rose-400 hover:underline"
                      >
                        Revoke
                      </button>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>IP: {s.ip} ({s.location})</div>
                      <div>Device: {s.device}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* IP Blacklist */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-rose-400" />
                IP Address Firewall Blacklist
              </h3>

              <form onSubmit={handleAddBlacklistIp} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.100"
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shrink-0"
                >
                  Block IP
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {blacklistedIps.map((ip) => (
                  <span
                    key={ip}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-bold"
                  >
                    <span>{ip}</span>
                    <button onClick={() => handleRemoveBlacklistIp(ip)} className="hover:text-rose-200">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  Live Security Audit Log Trail
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ALL">All Risk</option>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/50 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">User & IP</th>
                      <th className="p-3">Action Event</th>
                      <th className="p-3">Risk Level</th>
                      <th className="p-3 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition font-medium">
                        <td className="p-3 text-slate-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-200 truncate max-w-[150px]">{log.user}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.ip}</div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-amber-400">{log.action}</td>
                        <td className="p-3">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              log.risk === 'CRITICAL' || log.risk === 'HIGH'
                                ? 'bg-rose-500/20 text-rose-400'
                                : log.risk === 'MEDIUM'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {log.risk}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`text-[10px] font-extrabold uppercase ${
                              log.status === 'BLOCKED'
                                ? 'text-rose-400'
                                : log.status === 'FLAGGED'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
