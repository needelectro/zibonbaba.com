'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Phone, Wallet, Lock, ShieldCheck } from 'lucide-react';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  isLight: boolean;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLight
}: CustomerFormModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [wallet, setWallet] = useState('0');
  const [points, setPoints] = useState('0');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setEmail(initialData.email || '');
      setPhone(initialData.phone && initialData.phone !== 'N/A' ? initialData.phone : '');
      setStatus(initialData.status || 'ACTIVE');
      setWallet(initialData.walletBalance !== undefined ? initialData.walletBalance.toString() : '0');
      setPoints(initialData.loyaltyPoints !== undefined ? initialData.loyaltyPoints.toString() : '0');
      setPassword('');
    } else {
      setName('');
      setEmail('');
      setPhone('+880 1700-000000');
      setStatus('ACTIVE');
      setWallet('0');
      setPoints('0');
      setPassword('Customer123!');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status,
        walletBalance: parseFloat(wallet) || 0,
        loyaltyPoints: parseInt(points, 10) || 0,
        password: password.trim() || undefined
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden animate-slide-up ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-500 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {initialData ? `Edit Customer: ${initialData.name}` : 'Enrol New Customer Account'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Customer identity, wallet balance, and credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Email Address *</label>
              <input
                type="email"
                required
                disabled={Boolean(initialData)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none font-mono text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500 disabled:opacity-60' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400 disabled:opacity-60'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1700-000000"
                className={`w-full p-2.5 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Account Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="PENDING_VERIFICATION">PENDING</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Wallet (৳)</label>
              <input
                type="number"
                step="0.01"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Points</label>
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-1">
              {initialData ? 'Reset Password (Optional)' : 'Default Password *'}
            </label>
            <input
              type="password"
              placeholder={initialData ? 'Leave blank to preserve password' : 'Enter account password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
              }`}
            />
          </div>

          <div
            className={`px-0 pt-4 border-t flex items-center justify-between ${
              isLight ? 'border-slate-200' : 'border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Save Customer' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
