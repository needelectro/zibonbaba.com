'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
  Loader2,
  AlertCircle,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

type DashTab = 'overview' | 'orders' | 'wishlist' | 'profile';

function CustomerDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab') as DashTab | null;

  const { orders, wishlist, products, toggleWishlist, addToCart, username, isLoggedIn, token, logout, language } = useStore();
  const { isMobile, isMounted } = useIsMobile();

  const [activeTab, setActiveTab] = useState<DashTab>('overview');

  // Sync tab with URL search parameter
  useEffect(() => {
    if (tabParam && ['overview', 'orders', 'wishlist', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Live profile & address state
  const [profileName, setProfileName] = useState(username || '');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileAddr, setProfileAddr] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);

  const getHeaders = useCallback(() => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
    };
  }, [token]);

  // Fetch live profile and addresses
  useEffect(() => {
    if (!isLoggedIn) return;

    fetch('/api/me/profile', { headers: getHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.user) {
          if (data.user.fullName) setProfileName(data.user.fullName);
          if (data.user.email) setProfileEmail(data.user.email);
          if (data.user.phone) setProfilePhone(data.user.phone);
        }
      })
      .catch(() => {});

    fetch('/api/me/addresses', { headers: getHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.addresses && Array.isArray(data.addresses)) {
          setAddresses(data.addresses);
          if (data.addresses.length > 0) {
            setProfileAddr(data.addresses[0].addressLine1 || '');
          }
        }
      })
      .catch(() => {});
  }, [isLoggedIn, getHeaders]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setProfileError('');
    setProfileSaved(false);

    try {
      const res = await fetch('/api/me/profile', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ fullName: profileName, phone: profilePhone })
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || 'Failed to update profile.');
      } else {
        if (profileAddr.trim()) {
          await fetch('/api/me/addresses', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
              fullName: profileName,
              phone: profilePhone,
              addressLine1: profileAddr,
              city: 'Dhaka',
              isDefault: true
            })
          });
        }
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3500);
      }
    } catch {
      setProfileError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!isMounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Mobile view on small screens
  if (isMobile) {
    return <MobileDashboard />;
  }

  // Desktop Dashboard
  return (
    <div className="max-w-[1440px] mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-slide-up space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-light pb-5">
        <div>
          <h1 className="text-2xl font-black text-neutral-dark tracking-tight flex items-center gap-2">
            <span>Customer Dashboard</span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
              {language === 'en' ? 'Verified Buyer' : 'ভেরিফাইড ক্রেতা'}
            </span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            Welcome back, <span className="font-bold text-neutral-dark">{username || 'Valued Customer'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tracking"
            className="flex items-center gap-1.5 bg-neutral-light hover:bg-neutral-light/80 text-neutral-dark text-xs font-bold px-4 py-2 rounded-xl border border-neutral-light transition-colors"
          >
            <Truck className="w-4 h-4 text-primary-accent" />
            <span>Track Order</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors font-bold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid with Sidebar Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-2 bg-white p-4 rounded-2xl border border-neutral-light shadow-card h-fit">
          {[
            { id: 'overview', label: 'Account Overview', icon: User },
            { id: 'orders', label: `My Orders (${orders.length})`, icon: Package },
            { id: 'wishlist', label: `Saved Wishlist (${wishlist.length})`, icon: Heart },
            { id: 'profile', label: 'Profile & Addresses', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as DashTab);
                  router.push(`/dashboard?tab=${tab.id}`, { scroll: false });
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-neutral-dark shadow-sm'
                    : 'text-neutral-dark hover:bg-neutral-light'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-neutral-dark' : 'text-neutral-muted'}`} />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'opacity-100' : ''}`} />
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-light shadow-card space-y-2">
                  <div className="flex items-center justify-between text-neutral-muted">
                    <span className="text-xs font-bold uppercase">Total Orders</span>
                    <Package className="w-5 h-5 text-primary-accent" />
                  </div>
                  <div className="text-2xl font-black text-neutral-dark">{orders.length}</div>
                  <p className="text-[11px] text-neutral-muted">Purchases across marketplace</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-light shadow-card space-y-2">
                  <div className="flex items-center justify-between text-neutral-muted">
                    <span className="text-xs font-bold uppercase">Wishlist Items</span>
                    <Heart className="w-5 h-5 text-rose-500" />
                  </div>
                  <div className="text-2xl font-black text-neutral-dark">{wishlist.length}</div>
                  <p className="text-[11px] text-neutral-muted">Saved products for later</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-light shadow-card space-y-2">
                  <div className="flex items-center justify-between text-neutral-muted">
                    <span className="text-xs font-bold uppercase">Escrow Safeguard</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600">Active</div>
                  <p className="text-[11px] text-neutral-muted">100% money-back guarantee</p>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-light pb-3">
                  <h3 className="text-sm font-black text-neutral-dark">Recent Activity</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-primary-dark hover:underline"
                  >
                    View All
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <ShoppingBag className="w-10 h-10 text-neutral-muted mx-auto" />
                    <p className="text-xs font-bold text-neutral-dark">No orders yet</p>
                    <Link
                      href="/"
                      className="inline-block text-xs bg-primary font-bold px-4 py-2 rounded-xl text-neutral-dark hover:bg-primary-dark transition"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-light">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-neutral-dark font-mono">{o.id}</p>
                          <p className="text-[11px] text-neutral-muted">{o.date}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-neutral-dark">৳{o.total.toFixed(2)}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Orders */}
          {activeTab === 'orders' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-card space-y-4">
              <h3 className="text-sm font-black text-neutral-dark border-b border-neutral-light pb-3">
                Order History & Live Status
              </h3>
              {orders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Package className="w-12 h-12 text-neutral-muted mx-auto" />
                  <p className="text-xs font-bold text-neutral-dark">You haven&apos;t placed any orders yet.</p>
                  <Link
                    href="/"
                    className="inline-block text-xs bg-primary font-bold px-5 py-2.5 rounded-xl text-neutral-dark hover:bg-primary-dark transition"
                  >
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 rounded-xl border border-neutral-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-light/30 transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-primary-dark">{order.id}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-muted">
                          Placed on {order.date} • {order.items.length} items
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-neutral-dark">৳{order.total.toFixed(2)}</span>
                        <Link
                          href={`/tracking?orderId=${order.id}`}
                          className="bg-neutral-dark hover:bg-neutral-dark/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-card space-y-4">
              <h3 className="text-sm font-black text-neutral-dark border-b border-neutral-light pb-3">
                Saved Wishlist ({wishlist.length})
              </h3>
              {wishlist.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Heart className="w-12 h-12 text-neutral-muted mx-auto" />
                  <p className="text-xs font-bold text-neutral-dark">Your wishlist is empty.</p>
                  <Link
                    href="/"
                    className="inline-block text-xs bg-primary font-bold px-5 py-2.5 rounded-xl text-neutral-dark hover:bg-primary-dark transition"
                  >
                    Browse Marketplace
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlist.map((id) => {
                    const prod = products.find((p) => p.id === id);
                    if (!prod) return null;
                    return (
                      <div
                        key={prod.id}
                        className="p-4 rounded-xl border border-neutral-light flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <img src={prod.image} alt={prod.name} className="w-12 h-12 rounded-lg object-cover bg-neutral-light" />
                          <div>
                            <p className="text-xs font-bold text-neutral-dark line-clamp-1">{prod.name}</p>
                            <p className="text-xs font-extrabold text-primary-dark mt-0.5">৳{prod.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => addToCart(prod)}
                            className="p-2 bg-primary text-neutral-dark rounded-lg hover:bg-primary-dark transition text-xs font-bold"
                            title="Add to Cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleWishlist(prod.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                            title="Remove"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Profile */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-card space-y-6">
              <h3 className="text-sm font-black text-neutral-dark border-b border-neutral-light pb-3">
                Profile & Shipping Details
              </h3>

              {profileSaved && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl p-3 flex items-center gap-2 font-semibold animate-fade-in">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Profile and shipping coordinates updated successfully.</span>
                </div>
              )}
              {profileError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full bg-neutral-light border border-neutral-light rounded-xl px-3.5 py-2.5 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1.5">Account Email</label>
                    <input
                      type="email"
                      disabled
                      value={profileEmail || 'customer@example.com'}
                      className="w-full bg-neutral-light/50 border border-neutral-light rounded-xl px-3.5 py-2.5 text-xs text-neutral-muted font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1.5">Contact Phone</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+880 1700-000000"
                      className="w-full bg-neutral-light border border-neutral-light rounded-xl px-3.5 py-2.5 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-dark mb-1.5">Primary Delivery Street Address</label>
                    <input
                      type="text"
                      value={profileAddr}
                      onChange={(e) => setProfileAddr(e.target.value)}
                      placeholder="House, Road, Area, Dhaka"
                      className="w-full bg-neutral-light border border-neutral-light rounded-xl px-3.5 py-2.5 text-xs text-neutral-dark outline-none focus:border-primary font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary-dark text-neutral-dark text-xs font-extrabold px-6 py-2.5 rounded-xl transition disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Save Profile Updates</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CustomerDashboardContent />
    </Suspense>
  );
}
