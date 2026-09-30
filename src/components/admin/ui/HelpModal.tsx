'use client';

import React from 'react';
import { X, HelpCircle, Keyboard, BookOpen, ShieldCheck, Mail } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight: boolean;
}

export default function HelpModal({ isOpen, onClose, isLight }: HelpModalProps) {
  if (!isOpen) return null;

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
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Admin Operations Help & Guide</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Zibonbaba Marketplace Operating System v2.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Shortcuts */}
          <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/50 border-slate-800'}`}>
            <h4 className="font-bold flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-200">
              <Keyboard className="w-4 h-4 text-amber-500" /> Key Shortcuts
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Global Search & Command Palette</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold border border-slate-300 dark:border-slate-700">Ctrl + K</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Close Slide-over Drawer / Modal</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-bold border border-slate-300 dark:border-slate-700">Esc</kbd>
              </div>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="space-y-2.5">
            <h4 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <BookOpen className="w-4 h-4 text-blue-500" /> Operational Principles
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] list-disc list-inside">
              <li><strong>Orders & Fulfillment:</strong> Use bulk selection to print dispatches or memos in batch.</li>
              <li><strong>Merchant KYC:</strong> Review trade licenses and national IDs directly from the Sellers KYC queue.</li>
              <li><strong>Cash Memos:</strong> Print single memos or multiple grouped batch invoices with 1-click.</li>
              <li><strong>Drawers:</strong> Clicking any table row opens a fast slide-over drawer to avoid losing page context.</li>
            </ul>
          </div>
        </div>

        <div
          className={`px-5 py-3 border-t text-right ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#FFC107] text-slate-950 font-black text-xs hover:bg-amber-400 transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
