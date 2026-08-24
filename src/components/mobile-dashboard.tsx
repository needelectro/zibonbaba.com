'use client';

import React from 'react';
import { useStore } from '../store/useStore';
import { User, Package, Heart, CreditCard, HelpCircle, LogOut, ChevronRight, Store, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getDashboardForRole } from '../utils/roleRoutes';

export default function MobileDashboard() {
  const { username, userEmail, role, logout, orders, wishlist, setMobileTab, language } = useStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const roleLabel =
    role === 'superadmin' || role === 'admin' ? 'Administrator' :
    role === 'vendor' ? 'Seller / Merchant' :
    role === 'reseller' ? 'Verified Reseller' :
    role === 'deliveryman' ? 'Delivery Agent' : 'Customer Account';

  return (
    <div className="flex-1 bg-neutral-light pb-24 overflow-y-auto px-4 py-4 animate-slide-up md:hidden">
      {/* Profile Header */}
      <div className="bg-neutral-dark text-white p-5 rounded-2xl shadow-card flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-neutral-dark font-black text-xl flex items-center justify-center uppercase shadow-sm">
          {(username || 'U').charAt(0)}
        </div>
        <div className="flex-grow min-w-0">
          <h2 className="text-sm font-extrabold truncate">{username || 'Guest User'}</h2>
          <p className="text-[10px] text-neutral-muted truncate">{userEmail || 'customer@zibonbaba.com'}</p>
          <span className="inline-block text-[9px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full mt-1">
            {roleLabel}
          </span>
        </div>
      </div>

      {/* Quick Summary Badges */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white p-3 rounded-xl border border-neutral-light shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-neutral-muted uppercase font-bold block">Orders</span>
            <span className="text-sm font-black text-neutral-dark">{orders.length} Placed</span>
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-neutral-light shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 text-rose-500">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-neutral-muted uppercase font-bold block">Wishlist</span>
            <span className="text-sm font-black text-neutral-dark">{wishlist.length} Items</span>
          </div>
        </div>
      </div>

      {/* Management Navigation */}
      <div className="bg-white rounded-2xl border border-neutral-light shadow-card overflow-hidden divide-y divide-neutral-light mb-4 text-xs font-semibold text-neutral-dark">
        <Link href="/dashboard" className="flex items-center justify-between p-3.5 hover:bg-neutral-light/50 transition-colors">
          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-primary-accent" />
            <span>My Profile & Addresses</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-muted" />
        </Link>
        <Link href="/tracking" className="flex items-center justify-between p-3.5 hover:bg-neutral-light/50 transition-colors">
          <div className="flex items-center gap-3">
            <Package className="w-4 h-4 text-primary-accent" />
            <span>Track Live Shipment</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-muted" />
        </Link>
        <Link href="/account/wallet" className="flex items-center justify-between p-3.5 hover:bg-neutral-light/50 transition-colors">
          <div className="flex items-center gap-3">
            <CreditCard className="w-4 h-4 text-primary-accent" />
            <span>Wallet & Escrow Balance</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-muted" />
        </Link>
        <Link href="/account/tickets" className="flex items-center justify-between p-3.5 hover:bg-neutral-light/50 transition-colors">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-primary-accent" />
            <span>Help Center & Support Tickets</span>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-muted" />
        </Link>
      </div>

      {/* Seller Portal Direct Link if vendor/admin */}
      {(role === 'vendor' || role === 'admin' || role === 'superadmin') && (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
          <h4 className="text-xs font-black text-neutral-dark flex items-center gap-2">
            <Store className="w-4 h-4 text-primary-dark" /> Merchant Tools
          </h4>
          <p className="text-[10px] text-neutral-body mt-1">Open your vendor dashboard to manage inventory & sales.</p>
          <Link
            href="/seller"
            className="mt-3 inline-flex items-center gap-1 text-xs font-extrabold text-neutral-dark bg-primary px-4 py-2 rounded-xl shadow-xs"
          >
            <span>Open Seller Center</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}
