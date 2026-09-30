'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Users,
  CheckCircle,
  Plus,
  Save,
  ShoppingBag,
  Package,
  FileText,
  DollarSign,
  Lock,
  X,
  UserCheck,
  RefreshCw,
  Trash2,
  AlertCircle
} from 'lucide-react';

interface PermissionItem {
  id: string;
  label: string;
  key: string;
  enabled: boolean;
}

interface PermissionCategory {
  moduleName: string;
  groupKey: string;
  items: PermissionItem[];
}

interface RoleConfig {
  id: string;
  roleKey: string;
  name: string;
  description: string;
  isSystem: boolean;
  matrix: PermissionCategory[];
  permissionsCount?: number;
}

interface RolesPermissionsViewProps {
  isLight: boolean;
  token: string | null;
  showToast?: (msg: string) => void;
}

export default function RolesPermissionsView({
  isLight,
  token,
  showToast = () => {}
}: RolesPermissionsViewProps) {
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>('ADMIN');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New Role Modal
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/roles', {
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.roles)) {
        setRoles(data.roles);
        if (!selectedRoleKey && data.roles.length > 0) {
          setSelectedRoleKey(data.roles[0].roleKey);
        }
      }
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const activeRole = roles.find((r) => r.roleKey === selectedRoleKey) || roles[0];

  const handleTogglePermission = (catIdx: number, itemIdx: number) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.roleKey === selectedRoleKey) {
          const newMatrix = JSON.parse(JSON.stringify(role.matrix));
          newMatrix[catIdx].items[itemIdx].enabled = !newMatrix[catIdx].items[itemIdx].enabled;
          return { ...role, matrix: newMatrix };
        }
        return role;
      })
    );
  };

  const handleToggleGroup = (catIdx: number, enable: boolean) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.roleKey === selectedRoleKey) {
          const newMatrix = JSON.parse(JSON.stringify(role.matrix));
          newMatrix[catIdx].items.forEach((item: any) => (item.enabled = enable));
          return { ...role, matrix: newMatrix };
        }
        return role;
      })
    );
  };

  const handleSaveMatrix = async () => {
    if (!activeRole) return;
    try {
      setSaving(true);
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);

      // Collect all enabled permission keys
      const activeKeys: string[] = [];
      activeRole.matrix.forEach(cat => {
        cat.items.forEach(item => {
          if (item.enabled) activeKeys.push(item.key);
        });
      });

      const res = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          roleId: activeRole.id,
          roleKey: activeRole.roleKey,
          description: activeRole.description,
          permissionKeys: activeKeys
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save permissions');
        return;
      }

      showToast(`Permission matrix for role "${activeRole.name}" saved to database successfully!`);
      fetchRoles();
    } catch (err: any) {
      showToast(err.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDesc.trim(),
          permissionKeys: ['view:users', 'view:orders', 'view:products']
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create role');
        return;
      }

      showToast(`Custom Role "${newRoleName}" created successfully!`);
      setShowAddRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      fetchRoles();
    } catch (err: any) {
      showToast(err.message || 'Network error');
    }
  };

  const handleDeleteRole = async (roleId: string, roleName: string) => {
    if (!window.confirm(`Delete custom role: ${roleName}?`)) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/admin/roles?id=${roleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      if (res.ok) {
        showToast(`Role ${roleName} deleted.`);
        fetchRoles();
      }
    } catch (_) {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-base font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Role-Based Access Control (RBAC) & Permission Matrix
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure granular module permissions and security policies across all system tiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchRoles}
            className={`p-2 rounded-xl border transition-colors ${
              isLight ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
            title="Refresh Roles"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddRoleModal(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <Plus className="w-4 h-4" /> New Custom Role
          </button>
          <button
            onClick={handleSaveMatrix}
            disabled={saving}
            className="bg-[#FFC107] text-slate-950 hover:bg-amber-400 px-5 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving to Database...' : 'Save Matrix Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Role Selector Tabs */}
        <div className={`rounded-2xl border p-3 space-y-1.5 ${
          isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'
        }`}>
          <div className="px-3 py-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
            Available Roles ({roles.length})
          </div>
          <div className="space-y-1 max-h-[70vh] overflow-y-auto">
            {roles.map((r) => {
              const isSelected = r.roleKey === selectedRoleKey;
              return (
                <div key={r.roleKey} className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedRoleKey(r.roleKey)}
                    className={`flex-1 text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                        : isLight
                          ? 'hover:bg-slate-100 text-slate-700'
                          : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{r.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      isSelected ? 'bg-slate-950/20 text-slate-950 font-bold' : isLight ? 'bg-slate-100 text-slate-500' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {r.isSystem ? 'System' : 'Custom'}
                    </span>
                  </button>
                  {!r.isSystem && (
                    <button
                      onClick={() => handleDeleteRole(r.id, r.name)}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      title="Delete Role"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Permission Matrix Grid */}
        <div className="lg:col-span-3 space-y-4">
          {activeRole && (
            <div className={`p-5 rounded-2xl border ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800 shadow-xl'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 mb-5 border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase text-amber-500">{activeRole.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      activeRole.isSystem ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {activeRole.isSystem ? 'BUILT-IN SYSTEM ROLE' : 'CUSTOM ENTERPRISE ROLE'}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                    {activeRole.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Granted Permissions</span>
                  <span className="text-lg font-black text-amber-500">
                    {activeRole.matrix.reduce((acc, cat) => acc + cat.items.filter(i => i.enabled).length, 0)} / 27 Active
                  </span>
                </div>
              </div>

              {/* Categorized Permission Checkbox Groups */}
              <div className="space-y-6">
                {activeRole.matrix.map((cat, catIdx) => (
                  <div key={cat.groupKey} className={`p-4 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                  }`}>
                    <div className="flex items-center justify-between border-b pb-2.5 mb-3 border-slate-800">
                      <h4 className="font-extrabold text-xs flex items-center gap-2">
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        <span>{cat.moduleName}</span>
                      </h4>
                      <div className="flex items-center gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(catIdx, true)}
                          className="font-bold text-emerald-500 hover:underline"
                        >
                          Enable All
                        </button>
                        <span className="text-slate-500">•</span>
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(catIdx, false)}
                          className="font-bold text-rose-500 hover:underline"
                        >
                          Disable All
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {cat.items.map((item, itemIdx) => (
                        <label
                          key={item.id}
                          className={`p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all ${
                            item.enabled
                              ? isLight ? 'bg-amber-50 border-amber-300 text-slate-900' : 'bg-amber-500/10 border-amber-500/30 text-white'
                              : isLight ? 'bg-white border-slate-200 text-slate-500 hover:border-slate-300' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => handleTogglePermission(catIdx, itemIdx)}
                            className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500/20 cursor-pointer w-4 h-4"
                          />
                          <span className="text-xs font-bold leading-tight select-none">{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: CREATE CUSTOM ROLE */}
      {showAddRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowAddRoleModal(false)}>
          <div
            className={`w-full max-w-md rounded-2xl shadow-2xl p-6 border transition-all ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-extrabold text-sm uppercase">Add Custom Staff RBAC Role</h3>
              <button onClick={() => setShowAddRoleModal(false)} className="p-1 rounded-lg hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Auditor"
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities & security scope..."
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs resize-none ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800 text-white'}`}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] text-slate-950 font-black py-2.5 rounded-xl text-xs hover:bg-amber-400 transition-all cursor-pointer"
                >
                  Create Role Now
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
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
