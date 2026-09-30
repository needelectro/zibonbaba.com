'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Smartphone,
  Globe,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  XCircle,
  UserX,
  X
} from 'lucide-react';

interface ActiveSession {
  id: string;
  user: string;
  email: string;
  role: string;
  ip: string;
  device: string;
  createdAt: string;
}

interface AuditLogItem {
  id: string;
  user: string;
  role: string;
  action: string;
  ip: string;
  timestamp: string;
  risk: 'HIGH' | 'LOW';
}

interface SecurityAuditViewProps {
  isLight: boolean;
  token: string | null;
  showToast?: (msg: string) => void;
}

export default function SecurityAuditView({
  isLight,
  token,
  showToast = () => {}
}: SecurityAuditViewProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [blacklistedIps, setBlacklistedIps] = useState<string[]>([]);
  const [firewallStatus, setFirewallStatus] = useState('ACTIVE');
  const [blockedThreatsCount, setBlockedThreatsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [searchLog, setSearchLog] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [newIpInput, setNewIpInput] = useState('');
  const [activeTab, setActiveTab] = useState<'audit' | 'sessions' | 'firewall'>('audit');

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/security', {
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.activeSessions)) setActiveSessions(data.activeSessions);
        if (Array.isArray(data.recentAudits)) setAuditLogs(data.recentAudits);
        if (Array.isArray(data.blacklistedIps)) setBlacklistedIps(data.blacklistedIps);
        if (data.firewallStatus) setFirewallStatus(data.firewallStatus);
        if (data.blockedThreatsCount !== undefined) setBlockedThreatsCount(data.blockedThreatsCount);
      }
    } catch (err) {
      console.error('Security fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ action: 'REVOKE_SESSION', sessionId })
      });
      if (res.ok) {
        showToast('Active session terminated successfully.');
        fetchSecurityData();
      }
    } catch (_) {}
  };

  const handleAddBlacklistIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpInput.trim()) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ action: 'BLACKLIST_IP', ip: newIpInput.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`IP ${newIpInput.trim()} added to firewall blacklist.`);
        setNewIpInput('');
        if (data.blacklistedIps) setBlacklistedIps(data.blacklistedIps);
      }
    } catch (_) {}
  };

  const handleRemoveBlacklistIp = async (ip: string) => {
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ action: 'UNBLACKLIST_IP', ip })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`IP ${ip} removed from blacklist.`);
        if (data.blacklistedIps) setBlacklistedIps(data.blacklistedIps);
      }
    } catch (_) {}
  };

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchLog.toLowerCase();
      const matchesSearch =
        log.action.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.ip.includes(q);
      const matchesRisk = riskFilter === 'ALL' || log.risk === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [auditLogs, searchLog, riskFilter]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Security, Active Sessions & Audit Trail
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Live platform intrusion protection, immutable database audit logs & device session authority
          </p>
        </div>
        <button
          onClick={fetchSecurityData}
          className={`p-2 rounded-xl border transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Refresh Security Status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* KPI Security Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Firewall Engine</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-500">{firewallStatus}</span>
            <span className="text-[10px] text-slate-400 font-bold">100% Monitored</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Active Live Sessions</span>
            <Smartphone className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-blue-400">{activeSessions.length} Devices</span>
            <span className="text-[10px] text-slate-400 font-bold">Authenticated</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400">Threats Prevented</span>
            <ShieldAlert className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-500">{blockedThreatsCount} Blocked</span>
            <span className="text-[10px] text-slate-400 font-bold">IP & Brute-force</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex border-b text-xs font-bold ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3 px-4 border-b-2 transition-all ${
            activeTab === 'audit' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Security Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`py-3 px-4 border-b-2 transition-all ${
            activeTab === 'sessions' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Sessions ({activeSessions.length})
        </button>
        <button
          onClick={() => setActiveTab('firewall')}
          className={`py-3 px-4 border-b-2 transition-all ${
            activeTab === 'firewall' ? 'border-amber-500 text-amber-500 font-black' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          IP Firewall Blacklist ({blacklistedIps.length})
        </button>
      </div>

      {/* TAB 1: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit action, user or IP..."
                value={searchLog}
                onChange={e => setSearchLog(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
                }`}
              />
            </div>
            <select
              value={riskFilter}
              onChange={e => setRiskFilter(e.target.value)}
              className={`px-3 py-2 text-xs font-bold rounded-xl border outline-none ${
                isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              <option value="ALL">All Risk Levels</option>
              <option value="HIGH">High Severity Only</option>
              <option value="LOW">Standard / Informational</option>
            </select>
          </div>

          <div className={`rounded-2xl border overflow-hidden ${
            isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className={`uppercase tracking-wider text-[10px] font-black border-b ${
                  isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
                }`}>
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor Email</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Origin IP</th>
                    <th className="py-3 px-4 text-center">Risk Assessment</th>
                  </tr>
                </thead>
                <tbody className={`divide-y font-medium ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'}`}>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No audit events matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map(log => (
                      <tr key={log.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold">{log.user}</td>
                        <td className="py-3 px-4 font-mono text-xs">{log.action}</td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{log.ip}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            log.risk === 'HIGH' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {log.risk}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className={`rounded-2xl border overflow-hidden ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className={`uppercase tracking-wider text-[10px] font-black border-b ${
                isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
              }`}>
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Device / User Agent</th>
                  <th className="py-3 px-4">Login Time</th>
                  <th className="py-3 px-4 text-right">Session Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-medium ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'}`}>
                {activeSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No active device sessions recorded in SQLite/Postgres.
                    </td>
                  </tr>
                ) : (
                  activeSessions.map(s => (
                    <tr key={s.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                      <td className="py-3 px-4">
                        <div className="font-bold">{s.user}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] font-bold text-amber-500">{s.role}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">{s.ip}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs truncate">{s.device}</td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">{new Date(s.createdAt).toLocaleTimeString()}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleRevokeSession(s.id)}
                          className="px-3 py-1 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs font-bold"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FIREWALL BLACKLIST */}
      {activeTab === 'firewall' && (
        <div className="space-y-4 max-w-xl">
          <form onSubmit={handleAddBlacklistIp} className="flex gap-2">
            <input
              type="text"
              required
              placeholder="Enter IP address to block (e.g. 185.220.101.4)..."
              value={newIpInput}
              onChange={e => setNewIpInput(e.target.value)}
              className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none font-mono ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
              }`}
            />
            <button
              type="submit"
              className="bg-rose-600 text-white hover:bg-rose-500 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Block IP
            </button>
          </form>

          <div className={`rounded-2xl border divide-y ${
            isLight ? 'bg-white border-slate-200 divide-slate-100 shadow-xs' : 'bg-slate-900 border-slate-800 divide-slate-800 shadow-xl'
          }`}>
            {blacklistedIps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No IP addresses are currently blocked.
              </div>
            ) : (
              blacklistedIps.map(ip => (
                <div key={ip} className="p-3 px-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span className="font-mono font-bold">{ip}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 font-bold">BLOCKED</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlacklistIp(ip)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Unblock
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
