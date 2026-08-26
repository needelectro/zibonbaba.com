'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useIsMobile } from '@/hooks/useIsMobile';
import PWARegister from '@/components/pwa-register';
import MobileHeader from '@/components/mobile-header';
import MobileBottomNavigation from '@/components/mobile-bottom-navigation';
import CommandPalette from '@/components/command-palette';
import { useStore } from '@/store/useStore';
import { Bell, X } from 'lucide-react';
import { getDashboardForRole, isCustomerInterfaceRoute, shouldHideStorefrontHeader } from '@/utils/roleRoutes';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, isMounted } = useIsMobile();
  const { isLoggedIn, role, initNotificationWebSocket } = useStore();
  const [toast, setToast] = useState<any | null>(null);

  const hideStorefront = shouldHideStorefrontHeader(pathname, role, isLoggedIn);

  // Strict Client-Side Role Isolation Guard
  useEffect(() => {
    if (isLoggedIn && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('zibonbaba_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          const currentRole = u.role ? u.role.trim().toUpperCase() : 'CUSTOMER';
          if (currentRole !== 'CUSTOMER' && isCustomerInterfaceRoute(pathname)) {
            const targetDashboard = getDashboardForRole(currentRole);
            if (pathname !== targetDashboard) {
              router.replace(targetDashboard);
            }
          }
        } catch (_) {}
      }
    }
  }, [isLoggedIn, pathname, router]);

  // Subscribe to real-time WebSockets
  useEffect(() => {
    if (isLoggedIn) {
      const storedUser = localStorage.getItem('zibonbaba_user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          if (u.id) {
            const disconnect = initNotificationWebSocket(u.id);
            return () => disconnect();
          }
        } catch (_) {}
      }
    }
  }, [isLoggedIn, initNotificationWebSocket]);

  // Capture slide-up toasts
  useEffect(() => {
    const handleToast = (e: any) => {
      setToast(e.detail);
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    };

    window.addEventListener('zibonbaba-notification-toast', handleToast);
    return () => window.removeEventListener('zibonbaba-notification-toast', handleToast);
  }, []);

  // Premium App Splash Screen
  if (!isMounted) {
    return (
      <div className="fixed inset-0 z-[9999] bg-neutral-dark flex flex-col items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center font-black text-neutral-dark text-4xl shadow-glow animate-pulse-glow">
            Z
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black tracking-tight">
              Zibon<span className="text-primary-accent">baba</span>
            </h1>
          </div>
        </div>
        <div className="absolute bottom-16 w-36 bg-neutral-body/30 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full rounded-full w-20 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CommandPalette />
      {/* Real-time floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-[99999] max-w-sm w-full bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl text-white flex gap-3 items-start animate-slide-up backdrop-blur-xl">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
          <div className="flex-grow min-w-0 text-left">
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest block">{toast.module}</span>
            <h4 className="text-xs font-black truncate mt-0.5">{toast.title}</h4>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">{toast.body}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-500 hover:text-white shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Hide website storefront header & footer on admin, seller, staff, and management dashboards */}
      {hideStorefront ? (
        <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
          <PWARegister />
          <main className="flex-grow flex flex-col w-full relative">
            {children}
          </main>
        </div>
      ) : isMobile ? (
        <div className="flex flex-col min-h-screen bg-neutral-light text-neutral-dark overflow-x-hidden pb-16">
          <PWARegister />
          <MobileHeader />
          <main className="flex-grow flex flex-col w-full relative">
            {children}
          </main>
          <Footer />
          <MobileBottomNavigation />
        </div>
      ) : (
        <div className="flex flex-col min-h-screen bg-neutral-light">
          <Navbar />
          <main className="flex-grow flex flex-col w-full">
            {children}
          </main>
          <Footer />
        </div>
      )}
    </>
  );
}
