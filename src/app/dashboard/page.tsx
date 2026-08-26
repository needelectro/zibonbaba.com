'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDashboard from '@/components/mobile-dashboard';
import {
  Package,
  Heart,
  User,
  Clock,
  Star,
  Truck,
  CheckCircle,
  RefreshCcw,
  ShoppingBag,
  Settings,
  Bell,
  ChevronRight,
  MapPin,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

type DashTab = 'overview' | 'orders' | 'wishlist' | 'profile';

export default function CustomerDashboardPage() {
  const { orders, wishlist, products, toggleWishlist, addToCart, username } = useStore();
  const { isMobile, isMounted } = useIsMobile();

  if (isMobile && isMounted) {
    return <MobileDashboard />;
  }

  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  // Profile state
  const [profileName, setProfileName] = useState(username || 'Sarah Jenkins');
  const [profileEmail, setProfileEmail] = useState('sarah.jenkins@gmail.com');
  const [profilePhone, setProfilePhone] = useState('+880 1712-345678');
  const [profileAddr, setProfileAddr] = useState('House 12, Road 5, Dhanmondi, Dhaka 1209');
  const [profileSaved, setProfileSaved] = useState(false);

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    PROCESSING: 'bg-blue-100 text-blue-700 border-blue-300',
    DISPATCHED: 'bg-orange-100 text-orange-700 border-orange-300',
    SHIPPED: 'bg-purple-100 text-purple-700 border-purple-300',
    DELIVERED: 'bg-green-100 text-green-700 border-green-300',
    CANCELLED: 'bg-red-100 text-red-700 border-red-300',
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-light pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-extrabold text-neutral-dark border-2 border-primary">
            {profileName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-neutral-dark">{profileName}</h1>
            <p className="text-xs text-neutral-muted">Customer Account · Zibonbaba Marketplace</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full border border-neutral-light hover:bg-neutral-light transition-colors text-neutral-dark">
            <Bell className="w-4 h-4" />
          </button>
          <Link
            href="/"
            className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-4 py-2 rounded-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-neutral-light mb-8 overflow-x-auto">
        {([
          { id: 'overview', label: 'Overview', icon: Package },
          { id: 'orders', label: 'My Orders', icon: ShoppingBag },
          { id: 'wishlist', label: 'Wishlist', icon: Heart },
          { id: 'profile', label: 'Profile & Settings', icon: Settings },
        ] as { id: DashTab; label: string; icon: React.ElementType }[]).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 text-xs font-bold py-3 px-4 border-b-2 whitespace-nowrap transition-all ${
              activeTab === id
                ? 'border-primary text-neutral-dark font-extrabold'
                : 'border-transparent text-neutral-muted hover:text-neutral-dark'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === 'wishlist' && wishlist.length > 0 && (
              <span className="bg-primary text-neutral-dark text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ---- OVERVIEW TAB ---- */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-slide-up">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Orders', value: orders.length, icon: Package, color: 'text-primary-dark' },
              { label: 'Wishlist Items', value: wishlist.length, icon: Heart, color: 'text-error' },
              { label: 'Total Spent', value: `৳${(totalSpent * 80).toFixed(0)}`, icon: CreditCard, color: 'text-success' },
              { label: 'Active Shipments', value: orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length, icon: Truck, color: 'text-warning' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-lg border border-neutral-light shadow-card">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-neutral-muted font-bold uppercase">{stat.label}</p>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-extrabold text-neutral-dark">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Recent Orders Preview */}
          <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-light pb-3">
              <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider">Recent Orders</h2>
              <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-primary-dark hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-neutral-light/50 border border-neutral-light rounded-md text-xs">
                  <div>
                    <span className="font-mono font-bold text-neutral-dark">{order.id}</span>
                    <p className="text-[10px] text-neutral-muted mt-0.5">{order.date} · {order.items.length} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-neutral-dark">৳{order.total.toFixed(2)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <Link href={`/tracking?orderId=${order.id}`} className="text-primary-dark hover:underline font-bold flex items-center gap-0.5">
                      Track <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Milestone Timeline for the most recent active order */}
          {orders.filter(o => o.status !== 'DELIVERED').length > 0 && (
            <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card">
              <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3 mb-6">
                Active Shipment Milestone
              </h2>
              {(() => {
                const activeOrder = orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
                if (!activeOrder) return null;
                const statusLevels = ['PENDING', 'PROCESSING', 'DISPATCHED', 'SHIPPED', 'DELIVERED'];
                const activeIndex = statusLevels.indexOf(activeOrder.status);
                return (
                  <div>
                    <p className="text-[10px] text-neutral-muted font-semibold mb-4">Order: <span className="font-mono font-bold text-neutral-dark">{activeOrder.id}</span></p>
                    <div className="relative flex justify-between items-center">
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-light -translate-y-1/2 -z-10"></div>
                      <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
                        style={{ width: `${(activeIndex / (statusLevels.length - 1)) * 100}%` }}
                      ></div>
                      {statusLevels.map((lvl, index) => {
                        const isCompleted = index < activeIndex;
                        const isActive = index === activeIndex;
                        return (
                          <div key={lvl} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-extrabold transition-all ${isCompleted ? 'bg-primary border-primary text-neutral-dark' : isActive ? 'bg-white border-primary-accent text-primary-dark scale-110 shadow-glow' : 'bg-neutral-light border-neutral-light text-neutral-muted'}`}>
                              {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                            </div>
                            <span className={`text-[9px] font-bold uppercase ${isActive ? 'text-primary-dark' : 'text-neutral-muted'}`}>{lvl}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ---- ORDERS TAB ---- */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-sm font-bold text-neutral-dark mb-4">All Purchase Orders</h2>
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-light rounded-lg shadow-card">
              <ShoppingBag className="w-10 h-10 text-neutral-muted mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-dark">No orders placed yet</p>
              <p className="text-xs text-neutral-muted mt-1">Explore the marketplace to place your first order.</p>
              <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-6 py-2.5 rounded-md mt-4 transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-4">
                {/* Order header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-light pb-3">
                  <div>
                    <span className="font-mono text-xs font-extrabold text-neutral-dark">{order.id}</span>
                    <p className="text-[10px] text-neutral-muted mt-0.5">Placed: {order.date} · Source: {order.source}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-extrabold text-neutral-dark">৳{order.total.toFixed(2)}</span>
                    <Link href={`/tracking?orderId=${order.id}`} className="bg-neutral-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-neutral-dark/90 transition-colors">
                      <Truck className="w-3 h-3" /> Track Shipment
                    </Link>
                  </div>
                </div>
                {/* Order items */}
                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-xs">
                      <div className="w-10 h-10 rounded overflow-hidden bg-neutral-light shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-neutral-dark line-clamp-1">{item.product.name}</p>
                        <p className="text-[10px] text-neutral-muted">Qty: {item.quantity} · SKU: {item.product.sku}</p>
                      </div>
                      <span className="font-bold text-neutral-dark">৳{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ---- WISHLIST TAB ---- */}
      {activeTab === 'wishlist' && (
        <div className="animate-slide-up">
          <h2 className="text-sm font-bold text-neutral-dark mb-6">My Wishlist ({wishlistProducts.length} items)</h2>
          {wishlistProducts.length === 0 ? (
            <div className="text-center py-20 bg-white border border-neutral-light rounded-lg shadow-card">
              <Heart className="w-10 h-10 text-neutral-muted mx-auto mb-3" />
              <p className="text-sm font-bold text-neutral-dark">Your wishlist is empty</p>
              <p className="text-xs text-neutral-muted mt-1">Browse products and star them to save for later.</p>
              <Link href="/" className="inline-block bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-6 py-2.5 rounded-md mt-4 transition-colors">
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistProducts.map((p) => (
                <div key={p.id} className="bg-white rounded-lg border border-neutral-light shadow-card overflow-hidden hover:border-primary transition-all group">
                  <div className="relative aspect-video bg-neutral-light overflow-hidden">
                    <img src={p.image} alt={p.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[9px] text-neutral-muted font-bold uppercase">{p.category} · {p.vendor}</p>
                      <h3 className="text-xs font-bold text-neutral-dark mt-1 line-clamp-1">{p.name}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-neutral-dark">৳{p.price.toFixed(2)}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 text-warning fill-current" />
                        <span className="font-bold">{p.rating}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { addToCart(p); alert(`${p.name} added to cart!`); }}
                        className="flex-1 bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold py-2 rounded-md transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="p-2 border border-error/30 text-error hover:bg-error/5 rounded-md transition-colors"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---- PROFILE TAB ---- */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up">
          {/* Profile form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-5">
            <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3">
              Personal Details
            </h2>
            {profileSaved && (
              <div className="bg-success/10 border border-success text-success text-xs p-3 rounded-md flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Profile updated successfully!
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Full Name</label>
                  <input type="text" value={profileName} onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2.5 text-xs text-neutral-dark outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Email Address</label>
                  <input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2.5 text-xs text-neutral-dark outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Mobile Phone</label>
                  <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2.5 text-xs text-neutral-dark outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-dark mb-1">Delivery Address</label>
                  <input type="text" value={profileAddr} onChange={e => setProfileAddr(e.target.value)}
                    className="w-full bg-neutral-light border border-neutral-light rounded-md p-2.5 text-xs text-neutral-dark outline-none focus:border-primary" />
                </div>
              </div>
              <button type="submit"
                className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-bold px-6 py-2.5 rounded-md transition-colors">
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Account security panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-4">
              <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3">Account Security</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-neutral-light/50 rounded-md">
                  <span className="font-semibold text-neutral-dark">Password</span>
                  <button className="text-primary-dark font-bold hover:underline">Change</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-light/50 rounded-md">
                  <span className="font-semibold text-neutral-dark">Two-Factor Auth</span>
                  <span className="text-success font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-light/50 rounded-md">
                  <span className="font-semibold text-neutral-dark">Login Sessions</span>
                  <button className="text-error font-bold hover:underline">Revoke All</button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-neutral-light shadow-card space-y-4">
              <h2 className="text-xs font-bold text-neutral-dark uppercase tracking-wider border-b border-neutral-light pb-3">Notifications</h2>
              <div className="space-y-3 text-xs">
                {['Order updates via SMS', 'Promotional emails', 'Flash Sale alerts'].map((item, i) => (
                  <label key={i} className="flex items-center justify-between cursor-pointer">
                    <span className="font-semibold text-neutral-dark">{item}</span>
                    <div className="relative">
                      <input type="checkbox" defaultChecked={i !== 1} className="sr-only peer" />
                      <div className="w-9 h-5 bg-neutral-light peer-checked:bg-primary rounded-full transition-colors cursor-pointer"></div>
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4 shadow-sm"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
