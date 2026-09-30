'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  footerActions?: React.ReactNode;
  isLight: boolean;
  width?: 'md' | 'lg' | 'xl';
}

export default function DetailsDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  children,
  footerActions,
  isLight,
  width = 'lg'
}: DetailsDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClass =
    width === 'md'
      ? 'max-w-md'
      : width === 'xl'
      ? 'max-w-2xl'
      : 'max-w-lg';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen ${widthClass} shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-up border-l ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-950/50'
            }`}
          >
            <div className="min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold truncate text-slate-900 dark:text-white">
                  {title}
                </h3>
                {badge}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate font-mono">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  : 'border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Close Drawer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 scrollbar-thin">
            {children}
          </div>

          {/* Footer Actions */}
          {footerActions && (
            <div
              className={`px-5 py-3.5 border-t shrink-0 flex items-center justify-end gap-2.5 ${
                isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/50'
              }`}
            >
              {footerActions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
