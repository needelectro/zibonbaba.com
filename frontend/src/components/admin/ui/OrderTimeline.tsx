'use client';

import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';

interface OrderTimelineProps {
  currentStatus: string;
  isLight: boolean;
}

const standardSteps = [
  { id: 'PENDING', label: 'Pending', icon: Clock },
  { id: 'PROCESSING', label: 'Processing', icon: Package },
  { id: 'SHIPPED', label: 'Shipped', icon: Truck },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
];

export default function OrderTimeline({ currentStatus, isLight }: OrderTimelineProps) {
  const norm = (currentStatus || 'PENDING').toUpperCase();

  const isCancelled = norm === 'CANCELLED' || norm === 'RETURNED' || norm === 'REFUNDED';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 0;
      case 'CONFIRMED':
      case 'PROCESSING':
      case 'PACKED':
        return 1;
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
      case 'DISPATCHED':
        return 2;
      case 'DELIVERED':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(norm);

  if (isCancelled) {
    return (
      <div
        className={`p-3.5 rounded-xl border flex items-center gap-3 ${
          isLight
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}
      >
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider">Order Status: {norm}</p>
          <p className="text-[11px] opacity-80 mt-0.5">
            This order has been terminated and removed from the active delivery fulfillment route.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div
          className={`absolute left-4 right-4 top-4 h-0.5 -translate-y-1/2 z-0 ${
            isLight ? 'bg-slate-200' : 'bg-slate-800'
          }`}
        >
          <div
            className="h-full bg-amber-500 transition-all duration-500"
            style={{ width: `${(activeIndex / (standardSteps.length - 1)) * 100}%` }}
          />
        </div>

        {standardSteps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCurrent
                    ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-glow'
                    : isCompleted
                    ? isLight
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-emerald-500 border-emerald-500 text-slate-950'
                    : isLight
                    ? 'bg-white border-slate-300 text-slate-400'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3px]" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
              </div>

              <span
                className={`text-[10px] font-bold mt-2 truncate ${
                  isCurrent
                    ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                    : isCompleted
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
