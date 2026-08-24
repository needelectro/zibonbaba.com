'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { translations } from '../utils/translations';

export default function MobileBottomNavigation() {
  const { mobileTab, setMobileTab, cart, wishlist, language } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  const t = translations[language];
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const tabs: { id: 'home' | 'categories' | 'cart' | 'orders' | 'account'; label: string; icon: any; count?: number }[] = [
    { id: 'home', label: language === 'en' ? 'Home' : 'হোম', icon: Home },
    { id: 'categories', label: language === 'en' ? 'Categories' : 'ক্যাটাগরি', icon: Grid },
    { id: 'cart', label: language === 'en' ? 'Cart' : 'কার্ট', icon: ShoppingBag, count: cartCount },
    { id: 'orders', label: language === 'en' ? 'Wishlist' : 'উইশলিস্ট', icon: Heart, count: wishlist.length },
    { id: 'account', label: language === 'en' ? 'Account' : 'অ্যাকাউন্ট', icon: User },
  ];

  const handleTabClick = (tabId: 'home' | 'categories' | 'cart' | 'orders' | 'account') => {
    setMobileTab(tabId);
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-light flex items-center justify-around py-1.5 px-2 md:hidden shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = mobileTab === tab.id && pathname === '/';
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all relative ${
              isActive ? 'text-primary-dark font-bold' : 'text-neutral-muted hover:text-neutral-dark'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
              {tab.count !== undefined && tab.count > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-primary text-neutral-dark font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {tab.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
