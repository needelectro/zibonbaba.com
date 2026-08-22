'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { ShoppingCart, Trash2, ArrowRight, ShoppingBag, Percent } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useStore();

  const [isMounted, setIsMounted] = useState(false);
  const [coupon, setCoupon] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const validCart = (cart || []).filter(item => item && item.product && typeof item.product.price === 'number');
  const subtotal = validCart.reduce((sum, item) => sum + (item.product.price * (item.quantity || 1)), 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const tax = subtotal * 0.05;
  const shipping = subtotal > 0 ? (subtotal > 2000 ? 0 : 60.00) : 0;
  const grandTotal = subtotal - discountAmount + tax + shipping;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.toUpperCase() === 'SAVE10') {
      setDiscountPercent(10);
      setCouponMsg('Coupon applied: 10% discount deducted!');
    } else {
      setCouponMsg('Invalid coupon code. Try "SAVE10".');
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-8">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-primary" />
          Shopping Cart
        </h1>
        <p className="text-xs text-gray-400 mt-1">Review your items before proceeding to secure payment checkouts.</p>
      </div>

      {validCart.length === 0 ? (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl shadow-card">
          <ShoppingBag className="w-12 h-12 text-gray-500 mx-auto mb-3 animate-bounce" />
          <h3 className="text-base font-bold text-white">Your shopping cart is empty</h3>
          <p className="text-xs text-gray-400 mt-1">Explore our catalog to add verified products.</p>
          <Link
            href="/"
            className="inline-block bg-primary hover:bg-primary-accent text-gray-950 text-xs font-bold px-6 py-2.5 rounded-lg mt-6 transition-colors shadow-glow"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {validCart.map((item) => (
              <div
                key={item.product.id}
                className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-card flex items-center justify-between gap-4"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                </div>
                <div className="flex-grow">
                  <h3 className="text-xs font-bold text-white line-clamp-1">{item.product.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">SKU: {item.product.sku} | Vendor: {item.product.vendor}</p>
                  <p className="text-xs font-extrabold text-primary mt-1">৳{item.product.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-white/10 rounded-lg bg-white/5 overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-white/10 text-white"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold hover:bg-white/10 text-white"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-card space-y-4">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">
                Order Summary
              </h2>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-bold">-৳{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-300">
                  <span>Estimated Tax (5%)</span>
                  <span className="font-semibold">৳{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">৳{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-extrabold text-sm border-t border-white/10 pt-2.5">
                  <span>Total</span>
                  <span className="text-primary">৳{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-glow mt-6 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-card space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1">
                <Percent className="w-4 h-4 text-primary" />
                Promo Coupon Code
              </h3>
              {couponMsg && (
                <p className={`text-[10px] font-bold ${discountPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {couponMsg}
                </p>
              )}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. SAVE10"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 rounded-lg transition-colors border border-white/10"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
