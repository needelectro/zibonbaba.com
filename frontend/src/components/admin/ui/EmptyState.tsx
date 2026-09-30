'use client';

import React from 'react';
import { LucideIcon, Search, RefreshCw, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  isLight: boolean;
}

export default function EmptyState({
  icon: Icon = Search,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  isLight
}: EmptyStateProps) {
  return (
    <div
      className={`p-10 rounded-2xl border text-center flex flex-col items-center justify-center my-4 ${
        isLight
          ? 'bg-white border-slate-200/80 shadow-xs'
          : 'bg-slate-900/60 border-slate-800 shadow-xl'
      }`}
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-3 shadow-xs">
        <Icon className="w-6 h-6 stroke-[1.8px]" />
      </div>

      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        {description}
      </p>

      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-2 mt-4">
          {onAction && actionText && (
            <button
              onClick={onAction}
              className="px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {actionText}
            </button>
          )}
          {onSecondaryAction && secondaryActionText && (
            <button
              onClick={onSecondaryAction}
              className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition-colors cursor-pointer ${
                isLight
                  ? 'border-slate-200 text-slate-700 hover:bg-slate-100'
                  : 'border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
