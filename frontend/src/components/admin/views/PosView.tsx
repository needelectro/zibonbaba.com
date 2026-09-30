'use client';

import React, { useState } from 'react';
import { Monitor, Search, Plus, Trash2, ShoppingCart, CreditCard, DollarSign, CheckCircle } from 'lucide-react';

interface PosViewProps {
  products: any[];
  isLight: boolean;
}

export default function PosView({ products = [], isLight }: PosViewProps) {
  const [posSearch, setPosSearch] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(posSearch.toLowerCase())
  );

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setPaymentSuccess(true);
    setTimeout(() => {
      setCart([]);
      setPaymentSuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Monitor className="w-5 h-5 text-amber-500" />
            POS Terminal Counter Sales
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Physical retail counter terminal, barcode/SKU checkout, and instant cash memo generation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog Grid */}
        <div
          className={`lg:col-span-2 p-5 rounded-2xl border space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="flex items-center rounded-xl px-3 h-10 border text-xs focus-within:border-amber-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Quick search by product title or SKU..."
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              className="bg-transparent w-full outline-none font-medium text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {filtered.slice(0, 18).map((p) => (
              <div
                key={p.id}
                onClick={() => addToCart(p)}
                className={`p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isLight
                    ? 'bg-slate-50 border-slate-200 hover:border-amber-500'
                    : 'bg-slate-950/60 border-slate-800 hover:border-amber-500/60'
                }`}
              >
                <div>
                  <span className="text-[9.5px] font-mono font-bold text-amber-500 block truncate">{p.sku}</span>
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-2 mt-1">{p.name}</h4>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/80">
                  <span className="font-mono font-black text-xs text-slate-900 dark:text-white">৳{p.price}</span>
                  <span className="text-[10px] text-emerald-500 font-bold">Stock: {p.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Sales Cart & Settlement */}
        <div
          className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div>
            <div className="flex items-center justify-between border-b pb-3 mb-3 border-slate-100 dark:border-slate-800/80">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-amber-500" /> Current Register Cart
              </h3>
              <span className="text-xs font-mono font-bold text-slate-400">{cart.length} SKUs</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">Select products from the catalog to populate terminal checkout.</p>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.product.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.quantity} × ৳{item.product.price}
                      </p>
                    </div>
                    <span className="font-mono font-black text-slate-900 dark:text-white">
                      ৳{item.quantity * item.product.price}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-sm font-extrabold">
              <span className="text-slate-500">Gross Settlement Total:</span>
              <span className="font-mono font-black text-base text-amber-600 dark:text-[#FFC107]">৳{total.toLocaleString()}</span>
            </div>

            {paymentSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Settlement Complete! Cash memo recorded.
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              Complete Sale & Print Cash Memo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
