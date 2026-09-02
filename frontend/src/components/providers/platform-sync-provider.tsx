'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePlatformSync, RealtimeSyncEvent } from '@/hooks/usePlatformSync';
import { Bell, CheckCircle2, AlertCircle, Sparkles, X, RefreshCw } from 'lucide-react';

interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const SyncContext = createContext<{ isConnected: boolean }>({ isConnected: false });

export const useSync = () => useContext(SyncContext);

export function PlatformSyncProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, lastEvent } = usePlatformSync();
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (title: string, message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev.slice(-4), { id, title, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const handleOrderSync = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeSyncEvent>;
      const data = customEvent.detail?.data;
      if (data && data.orderCode && data.newStatus) {
        const type = data.newStatus === 'DELIVERED' ? 'success' : data.newStatus === 'CANCELLED' ? 'warning' : 'info';
        addToast(
          `Order #${data.orderCode} Updated`,
          `Status transitioned from ${data.previousStatus} to ${data.newStatus}`,
          type
        );
      }
    };

    const handleProductSync = (e: Event) => {
      const customEvent = e as CustomEvent<RealtimeSyncEvent>;
      const data = customEvent.detail?.data;
      if (data && data.name) {
        addToast(
          'Catalog Synchronized',
          `Product "${data.name}" was updated in real time.`,
          'info'
        );
      }
    };

    window.addEventListener('sync:orders', handleOrderSync);
    window.addEventListener('sync:products', handleProductSync);

    return () => {
      window.removeEventListener('sync:orders', handleOrderSync);
      window.removeEventListener('sync:products', handleProductSync);
    };
  }, []);

  return (
    <SyncContext.Provider value={{ isConnected }}>
      {children}

      {/* Floating Live Sync Toast Notifications Container */}
      <div className="fixed bottom-5 right-5 z-[9995] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-modal border backdrop-blur-xl flex items-start gap-3 animate-slide-up transition-all ${
              t.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100'
                : t.type === 'warning'
                ? 'bg-amber-950/80 border-amber-500/30 text-amber-100'
                : 'bg-slate-900/85 border-slate-700 text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              {t.type === 'info' && <Sparkles className="w-5 h-5 text-amber-400" />}
            </div>
            <div className="flex-grow">
              <h4 className="text-xs font-black tracking-tight">{t.title}</h4>
              <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 opacity-60 hover:opacity-100 rounded transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </SyncContext.Provider>
  );
}
