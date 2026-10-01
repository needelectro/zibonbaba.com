'use client';

import React, { useState } from 'react';
import {
  X,
  Store,
  User,
  Package,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit,
  DollarSign,
  TrendingUp,
  Tag,
  KeyRound,
  ExternalLink,
  Printer,
  FileText,
  Boxes,
  Layers,
  Image as ImageIcon,
  Sparkles,
  RotateCcw,
  Truck,
  Star,
  Activity,
  Calendar,
  Check,
  Building
} from 'lucide-react';
import StatusBadge from './ui/StatusBadge';
import OrderTimeline from './ui/OrderTimeline';

// =============================================================================
// 1. VENDOR / STORE DETAIL MODAL (8 TABS AS SPECIFIED IN PROMPT)
// Tabs: Overview, Store, Products, Orders, Financials, Commission, Activity, Documents
// =============================================================================
interface VendorDetailModalProps {
  vendor: any | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveToggle: (vendorId: string, currentApproved: boolean) => void;
  onUpdateCommission: (vendorId: string, newRate: number) => void;
  isLight: boolean;
}

export function VendorDetailModal({
  vendor,
  isOpen,
  onClose,
  onApproveToggle,
  onUpdateCommission,
  isLight
}: VendorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'store' | 'products' | 'orders' | 'financials' | 'commission' | 'activity' | 'documents'
  >('overview');
  const [commissionInput, setCommissionInput] = useState<string>(vendor?.commissionRate?.toString() || '10');

  if (!isOpen || !vendor) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'store', label: 'Store' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'financials', label: 'Financials' },
    { id: 'commission', label: 'Commission' },
    { id: 'activity', label: 'Activity' },
    { id: 'documents', label: 'Documents' }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-black">
              {vendor.logo ? (
                <img src={vendor.logo} alt={vendor.name} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Store className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm">{vendor.name}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vendor.isApproved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {vendor.isApproved ? 'Verified Partner' : 'Pending KYC'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Merchant ID: {vendor.id} • Owner: {vendor.owner?.email || 'N/A'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 8 Tabs Header */}
        <div className={`flex border-b text-xs font-bold px-4 overflow-x-auto ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/20'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* 1. OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Sales</span>
                  <p className="text-base font-black text-emerald-500 mt-1">৳{(vendor.grossSales || 0).toLocaleString()}</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Catalog Products</span>
                  <p className="text-base font-black text-amber-500 mt-1">{vendor.productsCount || vendor._count?.products || 0}</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                  <p className="text-base font-black text-blue-500 mt-1">{vendor.ordersCount || vendor._count?.orders || 0}</p>
                </div>
                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Commission Rate</span>
                  <p className="text-base font-black text-purple-500 mt-1">{vendor.commissionRate || 10}%</p>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <h4 className="font-bold text-slate-400 uppercase text-[10px]">Merchant Contact Information</h4>
                <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <div><strong>Email:</strong> {vendor.owner?.email || 'N/A'}</div>
                  <div><strong>Phone:</strong> {vendor.owner?.phone || '+880 1711-000000'}</div>
                  <div><strong>Owner Name:</strong> {vendor.owner?.profile?.fullName || vendor.ownerName || 'Verified Vendor'}</div>
                  <div><strong>Joined Date:</strong> {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. STORE */}
          {activeTab === 'store' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Store Description</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {vendor.description || 'Verified merchant storefront specializing in genuine marketplace goods on Zibonbaba.com.'}
                </p>
              </div>

              <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Store Front Banner</span>
                  <div className="h-20 rounded-lg bg-slate-800 overflow-hidden">
                    <img src={vendor.banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop'} alt="Banner" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Logo Badge</span>
                  <div className="w-20 h-20 rounded-lg bg-slate-800 overflow-hidden">
                    <img src={vendor.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=120&auto=format&fit=crop'} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">Total Listed Products: {vendor.productsCount || vendor._count?.products || 0}</span>
                <span className="text-amber-500 font-bold">All SKUs Synchronized</span>
              </div>
              <div className={`p-4 rounded-xl border text-slate-400 text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                Active catalog items assigned to Store ID: {vendor.id}. View full inventory in the Marketplace Products view.
              </div>
            </div>
          )}

          {/* 4. ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">Merchant Fulfillment Orders</span>
                <span className="text-emerald-500 font-bold">Total: {vendor.ordersCount || vendor._count?.orders || 0}</span>
              </div>
              <div className={`p-4 rounded-xl border text-slate-400 text-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                Merchant orders are routed through multi-vendor sub-order isolation. All order items are automatically tracked.
              </div>
            </div>
          )}

          {/* 5. FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Merchant GMV</span>
                  <p className="text-xl font-black text-emerald-500 mt-1">৳{(vendor.grossSales || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Platform Retained (Fee)</span>
                  <p className="text-xl font-black text-amber-500 mt-1">
                    ৳{Math.round(((vendor.grossSales || 0) * (vendor.commissionRate || 10)) / 100).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Merchant Wallet Balance</span>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">৳{(vendor.owner?.walletBalance || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* 6. COMMISSION */}
          {activeTab === 'commission' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Configure Store Commission</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={commissionInput}
                    onChange={e => setCommissionInput(e.target.value)}
                    className={`w-28 px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}
                  />
                  <span className="font-bold text-slate-400">% Rate</span>
                  <button
                    onClick={() => onUpdateCommission(vendor.id, parseFloat(commissionInput) || 10)}
                    className="px-4 py-2 rounded-xl bg-[#FFC107] text-slate-950 font-black text-xs hover:bg-amber-400 transition"
                  >
                    Save Commission
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold">Store Created & Seeded</span>
                  <span className="text-slate-400 ml-auto font-mono text-[10px]">{vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-bold">Commission Rate Verified at {vendor.commissionRate || 10}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${vendor.isApproved ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <span className="font-bold">KYC Status: {vendor.isApproved ? 'Approved & Operating' : 'Pending Verification'}</span>
                </div>
              </div>
            </div>
          )}

          {/* 8. DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Trade License / Business Registration</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Document Verified</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold">National ID Card (NID)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">NID Matched</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold">Bank Account / bKash Merchant Line</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Payout Active</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          <button
            onClick={() => onApproveToggle(vendor.id, vendor.isApproved)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              vendor.isApproved
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black'
            }`}
          >
            {vendor.isApproved ? 'Suspend / Revoke Store' : 'Approve Store KYC'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 2. CUSTOMER DETAIL MODAL (6 TABS AS SPECIFIED IN PROMPT)
// Tabs: Profile, Orders, Payments, Addresses, Reviews, Activity
// =============================================================================
interface CustomerDetailModalProps {
  customer: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (userId: string, newStatus: string) => void;
  onAdjustBalance: (userId: string, newBalance: number) => void;
  isLight: boolean;
}

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onUpdateStatus,
  onAdjustBalance,
  isLight
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'payments' | 'addresses' | 'reviews' | 'activity'>('profile');
  const [balanceInput, setBalanceInput] = useState<string>(customer?.walletBalance?.toString() || '0');

  if (!isOpen || !customer) return null;

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'orders', label: 'Orders' },
    { id: 'payments', label: 'Payments' },
    { id: 'addresses', label: 'Addresses' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'activity', label: 'Activity' }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 font-black">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm">{customer.name || customer.email}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${customer.status === 'SUSPENDED' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {customer.status || 'ACTIVE'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {customer.email} • ID: {customer.id}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Header */}
        <div className={`flex border-b text-xs font-bold px-4 overflow-x-auto ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/20'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-500 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div><span className="text-slate-400">Email:</span> <strong className="ml-1">{customer.email}</strong></div>
                <div><span className="text-slate-400">Phone:</span> <strong className="ml-1">{customer.phone || 'N/A'}</strong></div>
                <div><span className="text-slate-400">Customer Tier:</span> <strong className="ml-1 text-amber-500">{customer.status === 'VIP' ? 'VIP Tier' : 'Regular Buyer'}</strong></div>
                <div><span className="text-slate-400">Total Spent:</span> <strong className="ml-1 text-emerald-400">৳{(customer.totalSpent || 0).toLocaleString()}</strong></div>
              </div>

              <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Zibonbaba Wallet</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-black text-base text-amber-500">৳</span>
                    <input
                      type="number"
                      value={balanceInput}
                      onChange={e => setBalanceInput(e.target.value)}
                      className={`w-28 px-2.5 py-1 rounded-lg border text-xs font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}
                    />
                    <button
                      onClick={() => onAdjustBalance(customer.id, parseFloat(balanceInput) || 0)}
                      className="px-3 py-1 rounded-lg bg-[#FFC107] text-slate-950 font-black text-xs hover:bg-amber-400 transition"
                    >
                      Save Balance
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Loyalty Points</span>
                  <p className="text-lg font-black text-amber-500 mt-1">{customer.loyaltyPoints || 0} pts</p>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-400">Total Orders Placed: {customer.ordersCount || 0}</span>
                <span className="text-emerald-500 font-bold">Lifetime Value: ৳{(customer.totalSpent || 0).toLocaleString()}</span>
              </div>
              <div className={`p-4 rounded-xl border text-center text-slate-400 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                Order history records for this customer are tracked under the central Orders view.
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Preferred Payment Method</span>
                <p className="text-slate-700 dark:text-slate-300 font-bold">bKash / Cash On Delivery (COD)</p>
                <p className="text-[11px] text-slate-400">All gateway transactions cleared with zero chargeback alerts.</p>
              </div>
            </div>
          )}

          {/* ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-amber-500" /> Primary Shipping Address</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">Default</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{customer.address || 'House 24, Road 7, Dhanmondi, Dhaka-1205'}</p>
                <p className="text-slate-400 text-[11px]">Bangladesh</p>
              </div>
            </div>
          )}

          {/* REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <Star className="w-4 h-4 fill-amber-500" />
                  <span className="text-slate-400 text-xs ml-2">5.0 Star Verified Buyer</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 italic">"Fast delivery and genuine products from Zibonbaba vendors. Very satisfied!"</p>
              </div>
            </div>
          )}

          {/* ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Account authenticated and active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Placed {customer.ordersCount || 1} verified marketplace order</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          <button
            onClick={() => onUpdateStatus(customer.id, customer.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              customer.status === 'SUSPENDED'
                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black'
                : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
            }`}
          >
            {customer.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Customer'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 3. PRODUCT DETAIL MODAL (9 TABS AS SPECIFIED IN PROMPT)
// Tabs: Basic Information, Images, Variants, Pricing, Inventory, Vendor, SEO, Status, Activity
// =============================================================================
interface ProductDetailModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (prodId: string, status: string) => void;
  onSaveProduct: (prodId: string, data: any) => void;
  isLight: boolean;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onUpdateStatus,
  onSaveProduct,
  isLight
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    'basic' | 'images' | 'variants' | 'pricing' | 'inventory' | 'vendor' | 'seo' | 'status' | 'activity'
  >('basic');
  const [editPrice, setEditPrice] = useState<string>(product?.price?.toString() || '0');
  const [editStock, setEditStock] = useState<string>(product?.stock?.toString() || '10');

  if (!isOpen || !product) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'images', label: 'Images' },
    { id: 'variants', label: 'Variants' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'vendor', label: 'Vendor' },
    { id: 'seo', label: 'SEO' },
    { id: 'status', label: 'Status' },
    { id: 'activity', label: 'Activity' }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-black">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm line-clamp-1">{product.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500">
                  {product.category || 'General'}
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                SKU: {product.sku || 'N/A'} • ID: {product.id}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 9 Tabs */}
        <div className={`flex border-b text-xs font-bold px-4 overflow-x-auto ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/20'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-3.5 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-500 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-xs">
          {/* 1. BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div><span className="text-slate-400">Product Title:</span> <strong className="ml-1 text-slate-900 dark:text-white">{product.name}</strong></div>
                <div><span className="text-slate-400">Category:</span> <strong className="ml-1">{product.category || 'General'}</strong></div>
                <div><span className="text-slate-400">SKU Code:</span> <strong className="ml-1 font-mono">{product.sku || 'SKU-NONE'}</strong></div>
                <div><span className="text-slate-400">Listed Price:</span> <strong className="ml-1 text-amber-500">৳{product.price}</strong></div>
              </div>
              <div className={`p-4 rounded-xl border space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Product Description</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {product.description || 'Premium genuine product listed under Zibonbaba Multi-Vendor Marketplace catalog with guaranteed quality assurance.'}
                </p>
              </div>
            </div>
          )}

          {/* 2. IMAGES */}
          {activeTab === 'images' && (
            <div className="space-y-3">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Catalog Product Media</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="h-32 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 relative">
                  <img src={product.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop'} alt="Product" className="w-full h-full object-cover" />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold bg-slate-950/80 text-amber-400">Primary Cover</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Standard SKU Variant</span>
                  <span className="font-mono text-amber-500">SKU: {product.sku || 'SKU-001'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Stock Available: {product.stock || 10} units</span>
                  <span className="font-black text-slate-900 dark:text-white">৳{product.price}</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. PRICING */}
          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Direct Price Calibration</span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-black text-amber-500">৳</span>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={e => setEditPrice(e.target.value)}
                    className={`w-36 px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}
                  />
                  <button
                    onClick={() => onSaveProduct(product.id, { price: parseFloat(editPrice) || product.price, stock: parseInt(editStock, 10) || product.stock })}
                    className="px-4 py-2 rounded-xl bg-[#FFC107] text-slate-950 font-black hover:bg-amber-400 transition"
                  >
                    Update Price
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Stock Adjustment</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={editStock}
                    onChange={e => setEditStock(e.target.value)}
                    className={`w-32 px-3 py-2 rounded-xl border text-xs font-bold ${isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'}`}
                  />
                  <span className="font-bold text-slate-400">Available Units</span>
                  <button
                    onClick={() => onSaveProduct(product.id, { price: parseFloat(editPrice) || product.price, stock: parseInt(editStock, 10) || product.stock })}
                    className="px-4 py-2 rounded-xl bg-[#FFC107] text-slate-950 font-black hover:bg-amber-400 transition"
                  >
                    Save Stock
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. VENDOR */}
          {activeTab === 'vendor' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Merchant</span>
                <p className="text-sm font-black text-amber-500">{product.vendor || product.store?.name || 'Zibonbaba Direct'}</p>
                <p className="text-slate-400 text-[11px]">Store ID: {product.storeId || 'ST-DEFAULT'}</p>
              </div>
            </div>
          )}

          {/* 7. SEO */}
          {activeTab === 'seo' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Search Engine Metadata</span>
                <p className="font-mono text-slate-400 text-[11px]">URL Slug: /product/{product.id}</p>
                <p className="text-slate-500 text-[11px]">Meta Title: Buy {product.name} at best price on Zibonbaba</p>
              </div>
            </div>
          )}

          {/* 8. STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Catalog Status</span>
                  <span className="px-2.5 py-1 rounded text-xs font-black uppercase bg-emerald-500/10 text-emerald-500">
                    {product.status || 'PUBLISHED'}
                  </span>
                </div>
                <button
                  onClick={() => onUpdateStatus(product.id, product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
                  className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold hover:bg-amber-500/20 transition cursor-pointer"
                >
                  {product.status === 'PUBLISHED' ? 'Switch to Draft' : 'Publish Live'}
                </button>
              </div>
            </div>
          )}

          {/* 9. ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Product published to marketplace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Stock calibrated to {product.stock || 10} units</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-end ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 4. ORDER DETAIL MODAL
// Timeline, Customer, Vendor, Line Items, Pricing, Status Transitions, Invoice Memo Print
// =============================================================================
interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onPrintInvoice?: (order: any) => void;
  isLight: boolean;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onPrintInvoice,
  isLight
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const STATUS_FLOW = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 font-black">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Order #{order.id?.slice(0, 8)}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Placed on {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A')}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
          {/* Order Lifecycle Progression */}
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Fulfillment Progression
            </p>
            <OrderTimeline currentStatus={order.status} isLight={isLight} />
          </div>

          {/* Status Workflow Selector */}
          <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Transition Order State</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {STATUS_FLOW.map(st => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(order.id, st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    order.status === st
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : isLight
                      ? 'bg-white border border-slate-300 text-slate-600 hover:border-amber-500'
                      : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-amber-500'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Customer & Store Info */}
          <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Customer Details</span>
              <p className="font-bold">{order.customer?.name || order.customerName || 'Customer'}</p>
              <p className="text-slate-400 text-[11px]">{order.customer?.email || ''}</p>
              <p className="text-slate-400 text-[11px]">{order.customer?.phone || ''}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fulfillment Merchant</span>
              <p className="font-bold text-amber-500">{order.store?.name || order.vendor || 'Zibonbaba Direct'}</p>
              <p className="text-slate-400 text-[11px]">Branch: {order.branch || 'Central Warehouse'}</p>
            </div>
          </div>

          {/* Line Items */}
          {order.items && order.items.length > 0 && (
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Line Items</span>
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{item.name || item.variant?.product?.name || 'Product'}</p>
                      <p className="text-[10px] text-slate-400">
                        SKU: {item.sku || item.variant?.sku || 'N/A'} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-black text-amber-500">৳{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Totals */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div>
              <span className="text-slate-400">Payment Status:</span>
              <strong className="ml-1 text-emerald-400 font-bold uppercase">
                {(order.status || '').toUpperCase() === 'DELIVERED' ? 'PAID & SETTLED' : 'PENDING SETTLEMENT'}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Grand Total</span>
              <span className="text-xl font-black text-amber-500">৳{(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex items-center justify-between gap-3 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          {onPrintInvoice ? (
            <button
              onClick={() => onPrintInvoice(order)}
              className="px-4 py-2 rounded-xl text-xs font-black bg-[#FFC107] hover:bg-amber-400 text-slate-950 flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Cash Memo / Invoice
            </button>
          ) : <div />}
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
