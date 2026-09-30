'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  color?: 'amber' | 'blue' | 'emerald' | 'purple' | 'rose' | 'indigo';
  isLight: boolean;
  onClick?: () => void;
}

const colorMap = {
  amber: {
    bgLight: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    bgDark: 'bg-amber-500/10 text-[#FFC107] border-amber-500/20',
    valueLight: 'text-slate-900',
    valueDark: 'text-white'
  },
  blue: {
    bgLight: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    bgDark: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    valueLight: 'text-slate-900',
    valueDark: 'text-white'
  },
  emerald: {
    bgLight: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    bgDark: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    valueLight: 'text-slate-900',
    valueDark: 'text-white'
  },
  purple: {
    bgLight: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    bgDark: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    valueLight: 'text-slate-900',
    valueDark: 'text-white'
  },
  rose: {
    bgLight: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    bgDark: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    valueLight: 'text-slate-900',
    valueDark: 'text-white'
  },
  indigo: {
    bgLight: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    bgDark: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    valueLight: 'text-slate-900',
    valueDark: 'text-white'
  }
};

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'amber',
  isLight,
  onClick
}: KPICardProps) {
  const styles = colorMap[color] || colorMap.amber;

  return (
    <div
      onClick={onClick}
      className={`group p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${
        isLight
          ? 'bg-white border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300'
          : 'bg-slate-900/90 border-slate-800 shadow-xl hover:border-slate-700/80 hover:bg-slate-900'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-bold uppercase tracking-wider truncate ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}
        >
          {title}
        </span>
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105 ${
            isLight ? styles.bgLight : styles.bgDark
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className={`text-xl font-extrabold font-mono tracking-tight ${isLight ? styles.valueLight : styles.valueDark}`}>
          {value}
        </div>

        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md border ${
              trend.isPositive
                ? isLight
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isLight
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3 stroke-[2.5px]" />
            ) : (
              <ArrowDownRight className="w-3 h-3 stroke-[2.5px]" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className={`text-[11px] mt-1.5 truncate font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
