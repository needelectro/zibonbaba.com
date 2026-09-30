'use client';

import React, { useState } from 'react';
import { BellRing, Send, CheckCircle, Radio, Mail, MessageSquare } from 'lucide-react';

interface NotificationsViewProps {
  isLight: boolean;
}

export default function NotificationsView({ isLight }: NotificationsViewProps) {
  const [target, setTarget] = useState<'ALL' | 'SELLERS' | 'CUSTOMERS'>('ALL');
  const [channel, setChannel] = useState<'PUSH' | 'SMS' | 'EMAIL'>('PUSH');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sentSuccess, setSentSuccess] = useState('');

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSentSuccess(`Broadcast dispatched successfully to [${target}] via [${channel}].`);
    setTitle('');
    setBody('');
    setTimeout(() => setSentSuccess(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-500" />
            Ecosystem Broadcast & Notification Hub
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Dispatch real-time in-app push messages, email digests, and SMS notices to customers and sellers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Compose Message Broadcast
          </h3>

          {sentSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-4 h-4" /> {sentSuccess}
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Target Audience</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="ALL">All Platform Users</option>
                  <option value="SELLERS">Verified Merchants Only</option>
                  <option value="CUSTOMERS">Active Buyers Only</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Dispatch Channel</label>
                <select
                  value={channel}
                  onChange={(e) => setChannel(e.target.value as any)}
                  className={`w-full p-2.5 rounded-xl border outline-none font-bold ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-slate-950 border-slate-800 text-white'
                  }`}
                >
                  <option value="PUSH">In-App Push Notification</option>
                  <option value="SMS">SMS Gateway Direct</option>
                  <option value="EMAIL">Marketing Email</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Notice Headline *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Flash Sale Announcement or Maintenance Notice"
                className={`w-full p-2.5 rounded-xl border outline-none font-medium ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Message Content Body *</label>
              <textarea
                rows={4}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write message details for the selected audience..."
                className={`w-full p-2.5 rounded-xl border outline-none font-medium resize-none ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500' : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                }`}
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Notice Now</span>
            </button>
          </form>
        </div>

        <div
          className={`p-5 rounded-2xl border space-y-3 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Broadcast Channel SLAs
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In-app push notifications are delivered in real time across active sessions using web-socket channels.
          </p>
          <div className="space-y-2 pt-2 text-xs font-semibold">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Push Latency</span>
              <span className="text-emerald-500 font-bold">&lt; 150ms</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">SMS Gateway Queue</span>
              <span className="text-blue-500 font-bold">Banglalink / Grameenphone</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
