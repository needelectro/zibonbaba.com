'use client';

import React from 'react';
import { ArrowRight, ShieldCheck, CreditCard, Store, Package, Clock, AlertCircle } from 'lucide-react';

export interface ActionCenterItem {
  id: string;
  title: string;
  count: number;
  description: string;
  module: string;
  actionText: string;
  severity: 'warning' | 'info' | 'danger';
}

interface ActionCenterProps {
  items: ActionCenterItem[];
  onNavigateModule: (module: string) => void;
  isLight: boolean;
}

export default function ActionCenter({ items, onNavigateModule, isLight }: ActionCenterProps) {
  const activeItems = items.filter((item) => item.count > 0);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm'
          : 'bg-slate-900/90 border-slate-800 shadow-xl'
      }`}
    >
      <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
            Action Center
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono">
            {activeItems.length} active queues
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Requires Operational Attention</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item) => {
          const hasCount = item.count > 0;
          return (
            <div
              key={item.id}
              onClick={() => onNavigateModule(item.module)}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                hasCount
                  ? isLight
                    ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50 hover:border-amber-300 shadow-xs'
                    : 'bg-slate-950/60 border-amber-500/20 hover:border-amber-500/40 hover:bg-slate-800/60'
                  : isLight
                  ? 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                  : 'bg-slate-950/30 border-slate-800/60 text-slate-500'
              }`}
            >
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-black font-mono ${
                      hasCount ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {item.title}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">{item.description}</p>
              </div>

              <span
                className={`text-[11px] font-extrabold shrink-0 flex items-center gap-1 ${
                  hasCount ? 'text-amber-600 dark:text-amber-400 hover:underline' : 'text-slate-400'
                }`}
              >
                {item.actionText} <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
