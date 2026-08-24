'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import MobileHeader from './mobile-header';
import MobileBottomNavigation from './mobile-bottom-navigation';
import Footer from './footer';
import CommandPalette from './command-palette';
import PwaRegister from './pwa-register';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Determine if current route is an internal dashboard layout
  const isDashboard =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/seller') ||
    pathname.startsWith('/erp') ||
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/reseller') ||
    pathname.startsWith('/delivery') ||
    pathname.startsWith('/staff');

  return (
    <>
      <PwaRegister />
      <CommandPalette />
      
      {!isDashboard && (
        <>
          <div className="hidden md:block">
            <Navbar />
          </div>
          <div className="block md:hidden">
            <MobileHeader />
          </div>
        </>
      )}

      <main className="flex-grow">{children}</main>

      {!isDashboard && (
        <>
          <Footer />
          <div className="block md:hidden">
            <MobileBottomNavigation />
          </div>
        </>
      )}
    </>
  );
}
