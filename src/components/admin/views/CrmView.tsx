'use client';

import React, { useState } from 'react';
import KPICard from '../ui/KPICard';
import { Contact, Plus, Trash2, Calendar, UserCheck, MessageSquare, Phone } from 'lucide-react';

interface CrmNote {
  id: any;
  name: string;
  note: string;
  date?: string;
}

interface CrmViewProps {
  crmNotes: CrmNote[];
  onAddCrmNote: (e: React.FormEvent, name: string, note: string) => Promise<void>;
  onDeleteCrmNote: (id: any) => Promise<void>;
  isLight: boolean;
}

export default function CrmView({
  crmNotes = [],
  onAddCrmNote,
  onDeleteCrmNote,
  isLight
}: CrmViewProps) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !note.trim()) return;
    await onAddCrmNote(e, name.trim(), note.trim());
    setName('');
    setNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Contact className="w-5 h-5 text-amber-500" />
            CRM Sales Pipeline & Customer Engagement Notes
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Track VIP buyer requests, follow-up calls, fulfillment confirmations, and account relationship logs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Note Card */}
        <div
          className={`p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" /> Add Follow-Up Note
          </h3>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Customer / Contact Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kabir Hasan"
                className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Observation / Interaction Note *</label>
              <textarea
                rows={4}
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Details of call, special delivery instructions, or product inquiries..."
                className={`w-full p-2.5 rounded-xl border outline-none font-medium resize-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-xs cursor-pointer"
            >
              Save Follow-up Entry
            </button>
          </form>
        </div>

        {/* Existing Notes List */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800/80">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Engagement Log Stream ({crmNotes.length})
            </h3>
          </div>

          <div className="space-y-3">
            {crmNotes.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">• {item.date || 'Recent'}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {item.note}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteCrmNote(item.id)}
                  className="p-1.5 rounded-lg border bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 shrink-0 cursor-pointer"
                  title="Remove note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
