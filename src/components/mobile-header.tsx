'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Bell, ShoppingCart, ArrowLeft, X, HelpCircle, Globe, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function MobileHeader() {
  const {
    cart,
    mobileTab,
    setMobileTab,
    searchQuery,
    setSearchQuery,
    setSelectedCategory,
    categories,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    language,
    setLanguage,
    isLoggedIn,
    username,
    syncAuthFromStorage
  } = useStore();

  const pathname = usePathname();
  const router = useRouter();

  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleLogoClick = () => {
    setMobileTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleCartClick = () => {
    setMobileTab('cart');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    setShowSearchOverlay(false);
    setMobileTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleSuggestionClick = (text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
    setShowSearchOverlay(false);
    setMobileTab('home');
    if (pathname !== '/') {
      router.push('/');
    }
  };

  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };

  const toggleLang = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-light/70 shadow-sm h-14 flex items-center justify-between px-3 md:hidden">
        {/* Brand Logo */}
        <div 
          onClick={handleLogoClick}
          className="flex items-center gap-1.5 cursor-pointer select-none active:scale-95 transition-transform shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-neutral-dark text-lg shadow-sm">
            Z
          </div>
          <span className="font-extrabold text-base text-neutral-dark tracking-tight hidden xs:inline">
            Zibon<span className="text-primary-accent">baba</span>
          </span>
        </div>

        {/* Search trigger button */}
        <button
          type="button"
          onClick={() => setShowSearchOverlay(true)}
          className="flex-grow mx-2 bg-neutral-light/80 hover:bg-neutral-light text-neutral-muted rounded-full px-3 py-1.5 flex items-center gap-2 text-[11px] font-medium border border-neutral-light transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0 text-neutral-muted" />
          <span className="truncate">{searchQuery || (language === 'en' ? 'Search products, brands...' : 'পণ্য খুঁজুন...')}</span>
        </button>

        {/* Right action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Language switcher */}
          <button
            type="button"
            onClick={toggleLang}
            className="p-1.5 rounded-full hover:bg-neutral-light text-neutral-dark font-extrabold text-[10px] uppercase border border-neutral-light"
            title="Switch Language"
          >
            {language}
          </button>

          {/* Notifications button */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            className="relative p-1.5 text-neutral-dark hover:bg-neutral-light rounded-full"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-neutral-dark font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Shopping cart trigger */}
          <button
            type="button"
            onClick={handleCartClick}
            className="relative p-1.5 text-neutral-dark hover:bg-neutral-light rounded-full"
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-primary text-neutral-dark font-black text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Search Overlay Drawer */}
      {showSearchOverlay && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in md:hidden">
          <div className="flex items-center gap-2 p-3 border-b border-neutral-light">
            <button
              type="button"
              onClick={() => setShowSearchOverlay(false)}
              className="p-1 text-neutral-muted hover:text-neutral-dark"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <form onSubmit={handleSearchSubmit} className="flex-grow flex items-center bg-neutral-light rounded-full px-3 py-1.5">
              <Search className="w-4 h-4 text-neutral-muted mr-2" />
              <input
                type="text"
                autoFocus
                placeholder="Search products, SKUs, brands..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-semibold text-neutral-dark outline-none placeholder:text-neutral-muted"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => setLocalSearch('')}
                  className="p-0.5 text-neutral-muted hover:text-neutral-dark"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="bg-primary text-neutral-dark text-xs font-bold px-3 py-1.5 rounded-full"
            >
              Search
            </button>
          </div>

          <div className="p-4 flex-grow overflow-y-auto space-y-4">
            <div>
              <h4 className="text-[10px] font-black text-neutral-muted uppercase tracking-wider mb-2">Trending Searches</h4>
              <div className="flex flex-wrap gap-1.5">
                {['Galaxy S24', 'Wireless Earbuds', 'Denim Jacket', 'Smart Watch', 'Protein Powder'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    className="bg-neutral-light hover:bg-primary/20 text-neutral-dark text-xs font-semibold px-3 py-1.5 rounded-full border border-neutral-light"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-neutral-muted uppercase tracking-wider mb-2">Popular Categories</h4>
              <div className="grid grid-cols-2 gap-2">
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowSearchOverlay(false);
                      setMobileTab('categories');
                    }}
                    className="text-left bg-neutral-light/50 p-2.5 rounded-lg border border-neutral-light text-xs font-bold text-neutral-dark hover:border-primary flex items-center justify-between"
                  >
                    <span>{cat}</span>
                    <span className="text-primary-dark">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-end animate-fade-in md:hidden">
          <div className="w-4/5 max-w-sm bg-white h-full flex flex-col shadow-2xl animate-slide-left">
            <div className="p-4 border-b border-neutral-light flex items-center justify-between bg-neutral-dark text-white">
              <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-primary" /> Notifications
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[9px] text-primary hover:underline font-bold"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto p-3 divide-y divide-neutral-light">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-neutral-muted">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                    className={`py-3 px-2 cursor-pointer transition-colors ${
                      !n.isRead ? 'bg-primary/5 rounded-lg' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-neutral-dark leading-tight">{n.title}</h4>
                      {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </div>
                    <p className="text-[10px] text-neutral-muted mt-1 leading-snug">{n.body}</p>
                    <span className="text-[8px] text-neutral-muted mt-1 block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
