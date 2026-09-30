'use client';

import React from 'react';

export type StatusType =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'VERIFIED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PENDING_KYC'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'IN_STOCK'
  | 'PAID'
  | 'UNPAID'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, label, size = 'sm' }: StatusBadgeProps) {
  const norm = (status || '').toString().toUpperCase().replace(/\s+/g, '_');
  const displayLabel = label || norm.replace(/_/g, ' ');

  // Color mapping
  let bg = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  let dot = 'bg-slate-400';

  switch (norm) {
    case 'DELIVERED':
    case 'VERIFIED':
    case 'APPROVED':
    case 'ACTIVE':
    case 'PAID':
    case 'IN_STOCK':
    case 'PUBLISHED':
    case 'COMPLETED':
      bg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      dot = 'bg-emerald-500';
      break;

    case 'PROCESSING':
    case 'PACKED':
    case 'CONFIRMED':
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY':
      bg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      dot = 'bg-blue-500';
      break;

    case 'PENDING':
    case 'PENDING_KYC':
    case 'PENDING_VERIFICATION':
    case 'PENDING_APPROVAL':
    case 'DRAFT':
      bg = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      dot = 'bg-amber-500 animate-pulse';
      break;

    case 'LOW_STOCK':
      bg = 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      dot = 'bg-orange-500';
      break;

    case 'CANCELLED':
    case 'REJECTED':
    case 'SUSPENDED':
    case 'OUT_OF_STOCK':
    case 'RETURNED':
    case 'UNPAID':
      bg = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      dot = 'bg-rose-500';
      break;

    case 'REFUNDED':
      bg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      dot = 'bg-purple-500';
      break;
  }

  const sizeClass = size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${bg} ${sizeClass}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      <span className="truncate">{displayLabel}</span>
    </span>
  );
}
