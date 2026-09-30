'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  X,
  Shield,
  KeyRound,
  RefreshCw,
  Wallet
} from 'lucide-react';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED';
  walletBalance?: number;
  loyaltyPoints?: number;
  createdAt?: string;
  joined: string;
}

const ALL_ROLES = [
  'ALL',
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'ACCOUNTANT',
  'CUSTOMER_SUPPORT',
  'MARKETING',
  'WAREHOUSE_MANAGER',
  'INVENTORY_MANAGER',
  'DELIVERY_MANAGER',
  'VENDOR_ADMIN',
  'VENDOR_STAFF',
  'CUSTOMER',
  'RESELLER',
  'DELIVERY_MAN'
];

interface AccountsManagementViewProps {
  isLight: boolean;
  token: string | null;
  showToast?: (msg: string) => void;
}

export default function AccountsManagementView({
  isLight,
  token,
  showToast = () => {}
}: AccountsManagementViewProps) {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAccount, setEditAccount] = useState<UserAccount | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('Password123!');
  const [formRole, setFormRole] = useState('CUSTOMER');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'BLOCKED'>('ACTIVE');
  const [formWallet, setFormWallet] = useState('0');
  const [formPoints, setFormPoints] = useState('0');

  const fetchLiveAccounts = async () => {
    try {
      setLoading(true);
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/users?limit=100', {
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      const data = await res.json();
      if (res.ok && data.users && Array.isArray(data.users)) {
        const liveMapped: UserAccount[] = data.users.map((u: any) => ({
          id: u.id,
          name: u.name || u.email.split('@')[0],
          email: u.email,
          phone: u.phone || 'N/A',
          role: u.role,
          status: (u.status || 'ACTIVE') as any,
          walletBalance: u.walletBalance || 0,
          loyaltyPoints: u.loyaltyPoints || 0,
          joined: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '2026-01-01'
        }));
        setAccounts(liveMapped);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveAccounts();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        acc.name.toLowerCase().includes(q) ||
        acc.email.toLowerCase().includes(q) ||
        acc.phone.includes(q);
      const matchesRole = selectedRole === 'ALL' || acc.role === selectedRole;
      const matchesStatus = selectedStatus === 'ALL' || acc.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, searchQuery, selectedRole, selectedStatus]);

  // Create Account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formName.trim() || !formPassword.trim()) {
      showToast('Name, Email and Password are required.');
      return;
    }

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          fullName: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || null,
          role: formRole,
          password: formPassword,
          status: formStatus
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create user account');
        return;
      }

      showToast(`Account ${formEmail} created successfully with role [${formRole}].`);
      setShowAddModal(false);
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormPassword('Password123!');
      fetchLiveAccounts();
    } catch (err: any) {
      showToast(err.message || 'Network error');
    }
  };

  // Edit / Update Account
  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAccount) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/admin/users/${editAccount.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          fullName: formName.trim(),
          phone: formPhone.trim(),
          role: formRole,
          status: formStatus,
          walletBalance: parseFloat(formWallet) || 0,
          loyaltyPoints: parseInt(formPoints, 10) || 0,
          password: formPassword !== 'Password123!' ? formPassword : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update account');
        return;
      }

      showToast(`Account ${editAccount.email} updated successfully.`);
      setEditAccount(null);
      fetchLiveAccounts();
    } catch (err: any) {
      showToast(err.message || 'Network error');
    }
  };

  // Toggle Suspend Status
  const handleToggleSuspend = async (acc: UserAccount) => {
    const newStatus = acc.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/admin/users/${acc.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Account ${acc.email} marked as [${newStatus}].`);
        fetchLiveAccounts();
      }
    } catch (_) {}
  };

  // Delete Account
  const handleDeleteAccount = async (acc: UserAccount) => {
    if (!window.confirm(`Are you sure you want to permanently delete account: ${acc.email}? This cannot be undone.`)) {
      return;
    }
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/admin/users/${acc.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete account');
        return;
      }
      showToast(`Account ${acc.email} permanently removed.`);
      fetchLiveAccounts();
    } catch (err: any) {
      showToast(err.message || 'Network error');
    }
  };

  const openEditModal = (acc: UserAccount) => {
    setEditAccount(acc);
    setFormName(acc.name);
    setFormEmail(acc.email);
    setFormPhone(acc.phone === 'N/A' ? '' : acc.phone);
    setFormRole(acc.role);
    setFormStatus(acc.status);
    setFormWallet((acc.walletBalance || 0).toString());
    setFormPoints((acc.loyaltyPoints || 0).toString());
    setFormPassword('Password123!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Enterprise Staff & User Accounts
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage administrators, operations managers, support leads, vendors, couriers & customer profiles ({accounts.length} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLiveAccounts}
            className={`p-2 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Refresh Account Records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button
            onClick={() => {
              setFormName('');
              setFormEmail('');
              setFormPhone('');
              setFormPassword('Password123!');
              setFormRole('CUSTOMER');
              setFormStatus('ACTIVE');
              setShowAddModal(true);
            }}
            className="bg-[#FFC107] text-slate-950 hover:bg-amber-400 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3px]" /> Add Account
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row gap-3 items-center justify-between ${
        isLight ? 'bg-white border-slate-200/80 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none font-medium ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Role selector */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border outline-none ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r}>Role: {r.replace(/_/g, ' ')}</option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`px-3 py-2 text-xs font-bold rounded-xl border outline-none ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}
          >
            <option value="ALL">Status: ALL</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PENDING">PENDING</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="BLOCKED">BLOCKED</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className={`uppercase tracking-wider text-[10px] font-black border-b ${
              isLight ? 'bg-slate-50 text-slate-500 border-slate-200' : 'bg-slate-950/80 text-slate-400 border-slate-800'
            }`}>
              <tr>
                <th className="py-3 px-4">Account Profile</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-medium ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-slate-800/60 text-slate-300'}`}>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No accounts match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className={`transition-colors ${isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          acc.role === 'SUPER_ADMIN' ? 'bg-rose-500/20 text-rose-500' :
                          acc.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-500' :
                          acc.role.startsWith('VENDOR') ? 'bg-emerald-500/20 text-emerald-500' :
                          acc.role === 'DELIVERY_MAN' ? 'bg-blue-500/20 text-blue-500' :
                          'bg-purple-500/20 text-purple-500'
                        }`}>
                          {acc.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-extrabold text-xs">{acc.name}</p>
                          <p className={`text-[11px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>{acc.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        acc.role === 'SUPER_ADMIN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        acc.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        acc.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        acc.role.startsWith('VENDOR') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {acc.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px]">{acc.phone}</td>

                    <td className="py-3 px-4 font-black text-amber-500 font-mono">
                      ৳{(acc.walletBalance || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        acc.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' :
                        acc.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-rose-500/10 text-rose-500'
                      }`}>
                        {acc.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-[11px] text-slate-400">{acc.joined}</td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(acc)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            isLight ? 'hover:bg-slate-100 text-slate-600 border-slate-200' : 'hover:bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                          title="Edit Account Details"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(acc)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            acc.status === 'SUSPENDED'
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                          }`}
                          title={acc.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
                        >
                          {acc.status === 'SUSPENDED' ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        </button>
                        {acc.role !== 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteAccount(acc)}
                            className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD NEW ACCOUNT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddModal(false)}>
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 border transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-extrabold text-sm uppercase">Create Authorized Staff or User Account</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="e.g. Shahriar Kabir"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="e.g. user@zibonbaba.com"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="01711-XXXXXX"
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Account Password *</label>
                  <input
                    type="password"
                    required
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">System Role</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  >
                    {ALL_ROLES.filter(r => r !== 'ALL').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Initial Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] text-slate-950 font-black py-2.5 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer"
                >
                  Create Account Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACCOUNT */}
      {editAccount && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditAccount(null)}>
          <div
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 border transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-extrabold text-sm uppercase">Modify Account: {editAccount.email}</h3>
              <button onClick={() => setEditAccount(null)} className="p-1 rounded-lg hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  >
                    {ALL_ROLES.filter(r => r !== 'ALL').map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="BLOCKED">BLOCKED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Wallet Balance (৳)</label>
                  <input
                    type="number"
                    value={formWallet}
                    onChange={e => setFormWallet(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Reset Password (leave if unchanged)</label>
                  <input
                    type="password"
                    placeholder="New password..."
                    value={formPassword === 'Password123!' ? '' : formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] text-slate-950 font-black py-2.5 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer"
                >
                  Save Account Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditAccount(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-bold hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
