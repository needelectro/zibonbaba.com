'use client';

import React, { useState, useEffect } from 'react';
import KPICard from '../ui/KPICard';
import EmptyState from '../ui/EmptyState';
import {
  Megaphone,
  Tag,
  Zap,
  Flame,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Calendar,
  Percent,
  Clock,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Send,
  X
} from 'lucide-react';

interface CouponItem {
  id: string;
  code: string;
  discount: number;
  expiry: string;
  active: boolean;
  createdAt?: string;
}

interface BannerItem {
  id: number | string;
  title: string;
  desc: string;
  image: string;
  linkText: string;
  cat?: string;
  isActive: boolean;
}

interface MarketingViewProps {
  isLight: boolean;
  token?: string | null;
}

export default function MarketingView({ isLight, token }: MarketingViewProps) {
  const [activeTab, setActiveTab] = useState<'coupons' | 'banners' | 'campaigns' | 'announcements'>('coupons');
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: 'success' });

  // Add Coupon Modal State
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState('10');
  const [newExpiry, setNewExpiry] = useState('');

  // Promotional Banners State
  const [banners, setBanners] = useState<BannerItem[]>([
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80',
      title: 'Grand Seasonal Campaign 2026',
      desc: 'Up to 50% discount on gadgets, health & apparel across verified stores',
      linkText: 'Shop Grand Sale',
      cat: 'Electronics & Gadgets',
      isActive: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80',
      title: 'Tech & Lifestyle Festival',
      desc: 'Extra 10% instant cashback with Zibonbaba Unified Wallet balance',
      linkText: 'Explore Tech Hub',
      cat: 'Electronics & Gadgets',
      isActive: true
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
      title: 'Exclusive Fashion Collection',
      desc: 'New arrivals from verified multi-vendor designer houses and boutiques',
      linkText: 'View Outfits',
      cat: 'Apparel & Fashion',
      isActive: true
    }
  ]);

  // Flash Sales & Campaigns
  const [campaigns, setCampaigns] = useState([
    {
      id: 'c1',
      title: 'Flash Sale: 10.10 Super Tuesday',
      type: 'Flash Sale',
      discountRange: '20% - 60% OFF',
      startDate: '2026-10-10',
      endDate: '2026-10-11',
      participatingVendors: 14,
      status: 'SCHEDULED'
    },
    {
      id: 'c2',
      title: 'Autumn Electronics Mega Carnival',
      type: 'Mega Campaign',
      discountRange: '15% Flat Discount',
      startDate: '2026-10-01',
      endDate: '2026-10-25',
      participatingVendors: 28,
      status: 'LIVE'
    }
  ]);

  // Announcements Broadcast State
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementTarget, setAnnouncementTarget] = useState<'ALL' | 'CUSTOMERS' | 'VENDORS'>('ALL');
  const [activeAnnouncements, setActiveAnnouncements] = useState<string[]>([
    'Welcome to Zibonbaba! Enjoy free shipping on all orders above ৳2,000 across Dhaka Metropolitan.',
    'Vendors: Monthly payout processing scheduled for every Monday. Ensure bank records are up to date.'
  ]);

  // Fetch real coupons from API
  const fetchCoupons = async () => {
    try {
      setIsLoadingCoupons(true);
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/coupons', {
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      const data = await res.json();
      if (res.ok && data.coupons) {
        setCoupons(data.coupons);
      }
    } catch (err) {
      console.error('Failed to load coupons:', err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // Default tomorrow for expiry
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 30);
    setNewExpiry(tomorrow.toISOString().split('T')[0]);
  }, []);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: 'success' }), 4000);
  };

  // Create Coupon
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim() || !newDiscount) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discount: parseFloat(newDiscount),
          expiry: newExpiry || new Date(Date.now() + 30 * 86400000).toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      showToast(`Coupon code ${newCode.toUpperCase()} activated!`);
      setIsAddCouponOpen(false);
      setNewCode('');
      fetchCoupons();
    } catch (err: any) {
      showToast(err.message || 'Error creating coupon', 'error');
    }
  };

  // Toggle Coupon Active
  const handleToggleCoupon = async (id: string, currentActive: boolean) => {
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          id,
          active: !currentActive
        })
      });

      if (res.ok) {
        setCoupons(prev =>
          prev.map(c => (c.id === id ? { ...c, active: !currentActive } : c))
        );
        showToast('Coupon status updated.');
      }
    } catch (err: any) {
      showToast('Failed to toggle coupon status', 'error');
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon code ${code}?`)) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });

      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast(`Coupon ${code} removed.`);
      }
    } catch (err: any) {
      showToast('Failed to delete coupon', 'error');
    }
  };

  // Broadcast Announcement
  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setActiveAnnouncements([announcementText.trim(), ...activeAnnouncements]);
    setAnnouncementText('');
    showToast('Platform notification broadcasted live to all users!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-amber-500" />
            Marketing & Growth Control Center
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage promotional coupon codes, homepage hero campaigns, flash sale schedules, and global announcements.
          </p>
        </div>

        <button
          onClick={() => setIsAddCouponOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {msg.text && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className={`flex flex-wrap items-center gap-2 border-b pb-3 text-xs font-bold ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'coupons'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Discount Coupons ({coupons.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('banners')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'banners'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Promotional Hero Banners ({banners.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'campaigns'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Flash Sales & Seasonal Events</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Platform Announcements</span>
        </button>
      </div>

      {/* 1. COUPONS TAB */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Coupon Promo Code</th>
                    <th className="px-5 py-3.5">Discount Rate</th>
                    <th className="px-5 py-3.5">Valid Until</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400">
                        No promotional discount coupons registered yet. Create one to drive buyer conversion!
                      </td>
                    </tr>
                  ) : (
                    coupons.map(c => (
                      <tr
                        key={c.id}
                        className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-black text-amber-500 text-sm px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            {c.code}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-black text-slate-900 dark:text-white">
                          {c.discount}% OFF
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono">
                          {c.expiry}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.active)}
                            className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase transition cursor-pointer ${
                              c.active
                                ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                          >
                            {c.active ? 'Active' : 'Muted'}
                          </button>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROMOTIONAL BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {banners.map(b => (
              <div
                key={b.id}
                className={`rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="h-36 relative overflow-hidden bg-slate-950">
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-full h-full object-cover opacity-85 hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-950/80 text-amber-400 backdrop-blur-sm">
                    {b.cat || 'Homepage Hero'}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">{b.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">{b.desc}</p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] font-black text-amber-500">{b.linkText}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                      Live
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. FLASH SALES & CAMPAIGNS TAB */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map(camp => (
              <div
                key={camp.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {camp.type}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                      camp.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'
                    }`}
                  >
                    {camp.status}
                  </span>
                </div>

                <h3 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                  {camp.title}
                </h3>
                <p className="text-xs font-black text-amber-500 mt-0.5">
                  {camp.discountRange}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {camp.startDate} to {camp.endDate}
                  </span>
                  <span className="font-bold text-slate-300">
                    {camp.participatingVendors} Stores Enrolled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. ANNOUNCEMENTS TAB */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          <div
            className={`p-5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2">
              <Megaphone className="w-3.5 h-3.5 text-amber-500" />
              Broadcast Live Announcement Banner
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Pushes high-priority announcement banners across customer storefront headers and seller dashboards.
            </p>

            <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
              <textarea
                rows={2}
                placeholder="Type platform announcement message..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                required
                className={`w-full p-3 rounded-xl border text-xs font-medium focus:outline-hidden ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-bold">Target Audience:</span>
                  {(['ALL', 'CUSTOMERS', 'VENDORS'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAnnouncementTarget(t)}
                      className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition cursor-pointer ${
                        announcementTarget === t
                          ? 'bg-amber-500 text-slate-950'
                          : isLight
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Broadcast Live</span>
                </button>
              </div>
            </form>
          </div>

          {/* Active announcements list */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Active Broadcaster History
            </h4>
            {activeAnnouncements.map((ann, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-200">{ann}</span>
                </div>
                <button
                  onClick={() => setActiveAnnouncements(prev => prev.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-rose-500 p-1"
                  title="Remove Announcement"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {isAddCouponOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-sm">Create New Coupon Promo Code</h3>
              <button onClick={() => setIsAddCouponOpen(false)} className="p-1 hover:text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">Coupon Promo Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EID50, FESTIVE10"
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 rounded-xl border font-mono font-black ${
                    isLight ? 'bg-slate-50 border-slate-200 text-amber-600' : 'bg-slate-950 border-slate-800 text-amber-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Discount Rate (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={newDiscount}
                    onChange={e => setNewDiscount(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={e => setNewExpiry(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border font-mono ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCouponOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FFC107] text-slate-950 font-black"
                >
                  Publish Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
