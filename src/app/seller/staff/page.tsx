'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Users, UserPlus, Shield, Trash2, ArrowLeft, Mail, Lock, CheckCircle2 } from 'lucide-react';

export default function SellerStaffPage() {
  const [staffList, setStaffList] = useState([
    { id: '1', name: 'Karim Ahmed', email: 'karim@store.com', role: 'Staff Manager', status: 'ACTIVE' },
    { id: '2', name: 'Tanvir Hossain', email: 'tanvir@store.com', role: 'Inventory Staff', status: 'ACTIVE' },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Inventory Staff');

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setStaffList([
      ...staffList,
      { id: String(Date.now()), name, email, role, status: 'ACTIVE' }
    ]);
    setName('');
    setEmail('');
    setShowAddModal(false);
  };

  const handleRemove = (id: string) => {
    setStaffList(staffList.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/seller" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white font-bold">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Seller Dashboard</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-black">Store Staff & Operators</h1>
            <p className="text-xs text-slate-400 mt-1">
              Grant restricted operational access to your shop managers and warehouse assistants.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role Assigned</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-black">
                        {staff.name.charAt(0)}
                      </div>
                      <span>{staff.name}</span>
                    </td>
                    <td className="py-4 px-4 text-slate-300">{staff.email}</td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-bold text-[10px]">
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold text-[9px]">
                        {staff.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleRemove(staff.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-black text-white mb-1">Add Staff Account</h2>
            <p className="text-xs text-slate-400 mb-4">Create access credentials for your employee</p>

            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Shakil Ahmed"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@store.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Store Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Staff Manager">Staff Manager (Full Shop Access)</option>
                  <option value="Inventory Staff">Inventory Staff (Products & Stock Only)</option>
                  <option value="Order Dispatcher">Order Dispatcher (Orders & Shipping Only)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-black text-slate-950 shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
