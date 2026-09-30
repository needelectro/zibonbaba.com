'use client';

import React from 'react';
import { Search, X, Download, Plus, Filter, RefreshCw } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterGroup {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

interface DataTableToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: FilterGroup[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onExport?: (format: 'CSV' | 'EXCEL') => void;
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  selectedCount?: number;
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'primary' | 'destructive' | 'secondary';
    onClick: () => void;
  }[];
  onClearSelection?: () => void;
  isLight: boolean;
}

export default function DataTableToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters = [],
  onRefresh,
  isRefreshing = false,
  onExport,
  primaryAction,
  selectedCount = 0,
  bulkActions = [],
  onClearSelection,
  isLight
}: DataTableToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Primary Toolbar Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div
            className={`flex items-center rounded-xl px-3 h-9.5 w-full sm:w-72 transition-colors border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/10'
                : 'bg-slate-900/90 border-slate-800 text-white focus-within:border-amber-400'
            }`}
          >
            <Search className={`w-4 h-4 mr-2 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className={`bg-transparent text-xs w-full outline-none font-medium ${
                isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className={`p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Dynamic Filter Selects */}
          {filters.map((filter) => (
            <div key={filter.id} className="relative">
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className={`text-xs font-bold rounded-xl px-3 h-9.5 border outline-none cursor-pointer transition-colors appearance-none pr-7 ${
                  isLight
                    ? 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700'
                }`}
              >
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Filter className={`w-3 h-3 absolute right-2.5 top-3.5 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
            </div>
          ))}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-xl border text-xs flex items-center justify-center transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Refresh Records"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          )}
        </div>

        {/* Export & Primary Action */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {onExport && (
            <button
              onClick={() => onExport('CSV')}
              className={`h-9.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Export Current Table as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          )}

          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              className="h-9.5 px-3.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {primaryAction.icon ? (
                <primaryAction.icon className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4 stroke-[3px]" />
              )}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      </div>

      {/* Bulk Selection Bar (Shows when items are selected) */}
      {selectedCount > 0 && (
        <div
          className={`flex items-center justify-between px-4 py-2.5 rounded-xl border animate-fade-in ${
            isLight
              ? 'bg-amber-50/80 border-amber-200 text-slate-900'
              : 'bg-amber-500/10 border-amber-500/30 text-white'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>
              <strong className="text-amber-600 dark:text-amber-400">{selectedCount}</strong> {selectedCount === 1 ? 'item' : 'items'} selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                  action.variant === 'primary'
                    ? 'bg-[#FFC107] text-slate-950 font-black hover:bg-amber-400 shadow-sm'
                    : action.variant === 'destructive'
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : isLight
                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {action.icon && <action.icon className="w-3.5 h-3.5" />}
                <span>{action.label}</span>
              </button>
            ))}

            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 px-2 py-1 cursor-pointer font-semibold underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
