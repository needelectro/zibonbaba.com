'use client';

import React, { useState, useEffect } from 'react';
import { X, Store, Percent, Phone, User } from 'lucide-react';

interface SellerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  isLight: boolean;
}

export default function SellerFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLight
}: SellerFormModalProps) {
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [commissionRate, setCommissionRate] = useState('8.5');
  const [isApproved, setIsApproved] = useState(true);
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setStoreName(initialData.name || '');
      setDescription(initialData.description || '');
      setCommissionRate((initialData.commissionRate || 8.5).toString());
      setIsApproved(Boolean(initialData.isApproved));
      setOwnerName(initialData.owner?.name || '');
      setOwnerPhone(initialData.owner?.phone && initialData.owner?.phone !== 'N/A' ? initialData.owner?.phone : '');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name: storeName.trim(),
        description: description.trim(),
        commissionRate: parseFloat(commissionRate) || 8.5,
        isApproved,
        ownerName: ownerName.trim() || undefined,
        ownerPhone: ownerPhone.trim() || undefined
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
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Edit Vendor Store Settings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Store parameters, commission rate, and merchant credentials
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
            <label className="block text-[11px] text-slate-500 mb-1">Store Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Store Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full p-2.5 rounded-xl border outline-none font-medium resize-none ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Commission Rate (%) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Store Status</label>
              <select
                value={isApproved ? 'true' : 'false'}
                onChange={(e) => setIsApproved(e.target.value === 'true')}
                className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                <option value="true">VERIFIED & ACTIVE</option>
                <option value="false">SUSPENDED / PENDING</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Owner Contact Name</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Owner Contact Phone</label>
              <input
                type="text"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
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
              {submitting ? 'Saving...' : 'Save Store Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
