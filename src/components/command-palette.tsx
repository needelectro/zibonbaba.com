'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import { 
  Search, 
  Package, 
  Users, 
  ShoppingCart, 
  LayoutDashboard, 
  Store, 
  ShieldCheck, 
  Settings, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building,
  HelpCircle,
  Truck
} from 'lucide-react';

interface PaletteItem {
  id: string;
  title: string;
  category: 'Products' | 'Pages' | 'Actions' | 'Vendors';
  icon: any;
  href?: string;
  action?: () => void;
  badge?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { products, role } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const baseItems: PaletteItem[] = [
    { id: 'page-home', title: 'Home Storefront', category: 'Pages', icon: ShoppingCart, href: '/' },
    { id: 'page-cart', title: 'Shopping Cart', category: 'Pages', icon: ShoppingCart, href: '/cart' },
    { id: 'page-checkout', title: 'Checkout & Escrow', category: 'Pages', icon: CreditCard, href: '/checkout' },
    { id: 'page-orders', title: 'Customer Orders', category: 'Pages', icon: Package, href: '/dashboard' },
    { id: 'page-tracking', title: 'Live Order Tracking', category: 'Pages', icon: Truck, href: '/tracking' },
    { id: 'page-seller', title: 'Seller Portal', category: 'Pages', icon: Store, href: '/seller' },
    { id: 'page-erp', title: 'SaaS ERP Modules', category: 'Pages', icon: Building, href: '/erp' },
    { id: 'page-pos', title: 'Barcode POS Terminal', category: 'Pages', icon: ShoppingCart, href: '/erp/pos' },
    { id: 'page-admin', title: 'Admin Console', category: 'Pages', icon: LayoutDashboard, href: '/admin' },
    { id: 'page-superadmin', title: 'Superadmin Command Center', category: 'Pages', icon: ShieldCheck, href: '/superadmin' },
    { id: 'page-reseller', title: 'Reseller Network Hub', category: 'Pages', icon: TrendingUp, href: '/reseller' },
    { id: 'page-delivery', title: 'Delivery Fleet Portal', category: 'Pages', icon: Truck, href: '/delivery' },
  ];

  const productItems: PaletteItem[] = products.map((p) => ({
    id: `prod-${p.id}`,
    title: p.name,
    category: 'Products',
    icon: Package,
    href: `/product/${p.id}`,
    badge: `৳${(p.price * 80).toFixed(0)}`
  }));

  const allItems = [...baseItems, ...productItems];

  const filteredItems = query.trim() === ''
    ? baseItems
    : allItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    if (item.href) {
      router.push(item.href);
    } else if (item.action) {
      item.action();
    }
  };

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-light overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-light bg-neutral-light/30">
          <Search className="w-5 h-5 text-neutral-muted mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search products, or jump to page... (Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent text-sm font-semibold text-neutral-dark placeholder:text-neutral-muted outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] font-mono bg-white border border-neutral-light px-2 py-0.5 rounded shadow-sm text-neutral-muted">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-neutral-light/50">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-muted">
              No matching pages, actions, or products found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary-dark font-bold' : 'text-neutral-dark hover:bg-neutral-light/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-neutral-dark' : 'bg-neutral-light text-neutral-muted'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs truncate">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="text-[10px] bg-primary/20 text-primary-dark font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <span className="text-[9px] uppercase tracking-wider text-neutral-muted font-bold">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-muted opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-neutral-light/40 border-t border-neutral-light flex items-center justify-between text-[10px] text-neutral-muted">
          <div className="flex gap-3">
            <span><kbd className="font-mono bg-white px-1 rounded shadow-xs">↑</kbd> <kbd className="font-mono bg-white px-1 rounded shadow-xs">↓</kbd> Navigate</span>
            <span><kbd className="font-mono bg-white px-1 rounded shadow-xs">↵</kbd> Select</span>
          </div>
          <span>Zibonbaba Intelligent System</span>
        </div>
      </div>
    </div>
  );
}
