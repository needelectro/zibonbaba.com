'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Users, Store, CreditCard, Wallet, ArrowRight, Loader2 } from 'lucide-react';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category?: string;
  module: string;
  meta?: string;
}

interface SearchResults {
  products: SearchResultItem[];
  customers: SearchResultItem[];
  vendors: SearchResultItem[];
  orders: SearchResultItem[];
  transactions: SearchResultItem[];
}

interface AdminGlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (module: string, itemId: string, itemData?: any) => void;
  isLight: boolean;
}

export default function AdminGlobalSearchModal({
  isOpen,
  onClose,
  onSelectResult,
  isLight
}: AdminGlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    products: [],
    customers: [],
    vendors: [],
    orders: [],
    transactions: []
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ products: [], customers: [], vendors: [], orders: [], transactions: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults({ products: [], customers: [], vendors: [], orders: [], transactions: [] });
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query.trim())}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        const data = await res.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResultsCount =
    results.products.length +
    results.customers.length +
    results.vendors.length +
    results.orders.length +
    results.transactions.length;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className={`p-4 border-b flex items-center gap-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <Search className={`w-5 h-5 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, SKU, customers, vendors, order #, transactions..."
            className={`w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal ${
              isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-slate-500'
            }`}
          />
          {loading && <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className={`p-1 rounded-md text-xs hover:bg-slate-200/50 ${isLight ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${isLight ? 'bg-white border-slate-300 text-slate-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim().length >= 2 && totalResultsCount === 0 && !loading && (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by product name, SKU, vendor store, or customer phone.</p>
            </div>
          )}

          {query.trim().length < 2 && (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Search Shortcuts</p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto text-xs">
                <span className={`px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                  📦 Products by Name & SKU
                </span>
                <span className={`px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                  🏪 Vendors & Store Names
                </span>
                <span className={`px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                  👥 Customers by Email & Phone
                </span>
                <span className={`px-2.5 py-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                  🧾 Order IDs & Transactions
                </span>
              </div>
            </div>
          )}

          {/* 1. Products */}
          {results.products.length > 0 && (
            <div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Package className="w-3.5 h-3.5 text-amber-500" /> Products ({results.products.length})
              </div>
              <div className="space-y-1">
                {results.products.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectResult('marketplace', p.id, p);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{p.title}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{p.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-500">{p.meta}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Vendors */}
          {results.vendors.length > 0 && (
            <div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Store className="w-3.5 h-3.5 text-emerald-500" /> Vendors & Stores ({results.vendors.length})
              </div>
              <div className="space-y-1">
                {results.vendors.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      onSelectResult('sellers', v.id, v);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{v.title}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{v.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                        {v.meta}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Orders */}
          {results.orders.length > 0 && (
            <div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <CreditCard className="w-3.5 h-3.5 text-blue-500" /> Orders ({results.orders.length})
              </div>
              <div className="space-y-1">
                {results.orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      onSelectResult('orders', o.id, o);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{o.title}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{o.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-400">{o.meta}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Customers */}
          {results.customers.length > 0 && (
            <div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Users className="w-3.5 h-3.5 text-purple-500" /> Customers ({results.customers.length})
              </div>
              <div className="space-y-1">
                {results.customers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectResult('customers', c.id, c);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{c.title}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{c.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
                        {c.meta}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Transactions */}
          {results.transactions.length > 0 && (
            <div>
              <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider mb-2 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                <Wallet className="w-3.5 h-3.5 text-rose-500" /> Payouts & Transactions ({results.transactions.length})
              </div>
              <div className="space-y-1">
                {results.transactions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onSelectResult('wallet', t.id, t);
                      onClose();
                    }}
                    className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-colors ${
                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{t.title}</div>
                      <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{t.subtitle}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-rose-400">{t.meta}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-3 border-t text-[11px] flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50 text-slate-500' : 'border-slate-800 bg-slate-950 text-slate-400'}`}>
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd></span>
            <span>Select: <kbd className="font-mono font-bold">ENTER</kbd></span>
          </div>
          <span className="font-semibold text-amber-500">Zibonbaba Enterprise Search</span>
        </div>
      </div>
    </div>
  );
}
