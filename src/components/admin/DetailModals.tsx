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
  ExternalLink
} from 'lucide-react';

// =============================================================================
// 1. VENDOR / STORE DETAIL MODAL
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
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'kyc'>('overview');
  const [commissionInput, setCommissionInput] = useState<string>(vendor?.commissionRate?.toString() || '10');

  if (!isOpen || !vendor) return null;

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
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{vendor.name}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Store ID: {vendor.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex border-b text-xs font-bold px-5 ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-slate-950/20'}`}>
          {(['overview', 'financials', 'kyc'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 capitalize border-b-2 transition-all ${
                activeTab === tab
                  ? 'border-amber-500 text-amber-500 font-black'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Approval Status</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${vendor.isApproved ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                    <span className={`font-black text-xs ${vendor.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {vendor.isApproved ? 'VERIFIED & ACTIVE' : 'PENDING APPROVAL (KYC)'}
                    </span>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Commission</span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={commissionInput}
                      onChange={e => setCommissionInput(e.target.value)}
                      className={`w-20 px-2 py-1 rounded border text-xs font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}
                    />
                    <span className="font-bold">%</span>
                    <button
                      onClick={() => onUpdateCommission(vendor.id, parseFloat(commissionInput) || 10)}
                      className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px]"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <h4 className="font-bold uppercase text-[10px] text-slate-400">Store Owner Identity</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-slate-400">Name:</span> <strong className="ml-1">{vendor.owner?.name || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Email:</span> <strong className="ml-1">{vendor.owner?.email || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Phone:</span> <strong className="ml-1">{vendor.owner?.phone || 'N/A'}</strong></div>
                  <div><span className="text-slate-400">Account Status:</span> <strong className="ml-1 text-emerald-500">{vendor.owner?.status || 'ACTIVE'}</strong></div>
                </div>
              </div>

              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <h4 className="font-bold uppercase text-[10px] text-slate-400">Store Catalog Summary</h4>
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] text-slate-400">Listed Products:</span>
                    <p className="text-lg font-black text-amber-500">{vendor.productsCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Total Orders:</span>
                    <p className="text-lg font-black text-blue-400">{vendor.ordersCount || 0}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Gross Sales:</span>
                    <p className="text-lg font-black text-emerald-400">৳{(vendor.grossSales || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Total Gross Revenue</span>
                  <p className="text-xl font-black text-emerald-500 mt-1">৳{(vendor.grossSales || 0).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Platform Retained (Fee)</span>
                  <p className="text-xl font-black text-amber-500 mt-1">৳{Math.round(((vendor.grossSales || 0) * (vendor.commissionRate || 10)) / 100).toLocaleString()}</p>
                </div>
              </div>
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Merchant Wallet Balance</span>
                <p className="text-lg font-extrabold text-slate-100">৳{(vendor.owner?.walletBalance || 0).toLocaleString()}</p>
              </div>
            </div>
          )}

          {activeTab === 'kyc' && (
            <div className="space-y-3 text-xs">
              <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold">Trade License / Business Registration</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Document Verified</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="font-bold">National ID Card (NID)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">NID Matched</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
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
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
              vendor.isApproved
                ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-black'
            }`}
          >
            {vendor.isApproved ? 'Suspend / Revoke Store' : 'Approve Store KYC'}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 2. CUSTOMER DETAIL MODAL
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
  const [balanceInput, setBalanceInput] = useState<string>(customer?.walletBalance?.toString() || '0');

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">{customer.name || customer.email}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Customer Account Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div><span className="text-slate-400">Email:</span> <strong className="ml-1">{customer.email}</strong></div>
            <div><span className="text-slate-400">Phone:</span> <strong className="ml-1">{customer.phone || 'N/A'}</strong></div>
            <div><span className="text-slate-400">Role:</span> <strong className="ml-1 text-purple-400">{customer.role}</strong></div>
            <div><span className="text-slate-400">Status:</span> <strong className="ml-1 text-emerald-400">{customer.status}</strong></div>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-between ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Wallet Balance</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-black text-base text-amber-500">৳</span>
                <input
                  type="number"
                  value={balanceInput}
                  onChange={e => setBalanceInput(e.target.value)}
                  className={`w-28 px-2.5 py-1 rounded border text-xs font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}
                />
                <button
                  onClick={() => onAdjustBalance(customer.id, parseFloat(balanceInput) || 0)}
                  className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-black text-xs"
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

          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(customer.id, customer.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                customer.status === 'SUSPENDED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {customer.status === 'SUSPENDED' ? 'Activate Account' : 'Suspend Account'}
            </button>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 3. PRODUCT DETAIL MODAL
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
  const [editPrice, setEditPrice] = useState<string>(product?.price?.toString() || '0');
  const [editStock, setEditStock] = useState<string>(product?.stock?.toString() || '10');

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border transition-all ${
          isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className={`p-5 border-b flex items-center justify-between ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/60'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm line-clamp-1">{product.name}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>SKU: {product.sku || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className={`p-4 rounded-xl border grid grid-cols-2 gap-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <div><span className="text-slate-400">Category:</span> <strong className="ml-1">{product.category || 'N/A'}</strong></div>
            <div><span className="text-slate-400">Store / Seller:</span> <strong className="ml-1">{product.vendor || product.store?.name || 'Direct'}</strong></div>
            <div><span className="text-slate-400">Current Status:</span> <strong className="ml-1 text-emerald-400">{product.status || 'PUBLISHED'}</strong></div>
            <div><span className="text-slate-400">Base Price:</span> <strong className="ml-1 text-amber-500">৳{product.price}</strong></div>
          </div>

          <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Fast Price & Inventory Calibration</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Selling Price (৳)</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editStock}
                  onChange={e => setEditStock(e.target.value)}
                  className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold ${isLight ? 'bg-white border-slate-300' : 'bg-slate-800 border-slate-700'}`}
                />
              </div>
            </div>
            <button
              onClick={() => onSaveProduct(product.id, { price: parseFloat(editPrice) || product.price, stock: parseInt(editStock, 10) || product.stock })}
              className="w-full bg-[#FFC107] text-slate-950 font-black py-2 rounded-xl text-xs"
            >
              Save Product Calibration
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onUpdateStatus(product.id, product.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${
                product.status === 'PUBLISHED'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {product.status === 'PUBLISHED' ? 'Unpublish to Draft' : 'Approve & Publish Live'}
            </button>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// 4. ORDER DETAIL MODAL
// =============================================================================
interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  isLight: boolean;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Order #{order.id?.slice(0, 8)}</h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Placed on {order.date || order.createdAt ? new Date(order.date || order.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs max-h-[65vh] overflow-y-auto">
          {/* Status Workflow Selector */}
          <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Order Transition State</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {STATUS_FLOW.map(st => (
                <button
                  key={st}
                  onClick={() => onUpdateStatus(order.id, st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
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
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Customer</span>
              <p className="font-bold">{order.customer?.name || order.customer || 'Guest'}</p>
              <p className="text-slate-400 text-[11px]">{order.customer?.email || ''}</p>
              <p className="text-slate-400 text-[11px]">{order.customer?.phone || ''}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Fulfillment Store</span>
              <p className="font-bold text-amber-500">{order.store?.name || order.store || 'Zibonbaba Direct'}</p>
              <p className="text-slate-400 text-[11px]">Branch: {order.branch || 'Main Hub'}</p>
            </div>
          </div>

          {/* Items Table */}
          {order.items && order.items.length > 0 && (
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Line Items</span>
              <div className="divide-y divide-slate-800">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{item.name || item.variant?.product?.name || 'Product'}</p>
                      <p className="text-[10px] text-slate-400">SKU: {item.sku || item.variant?.sku || 'N/A'} • Qty: {item.quantity}</p>
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
              <strong className="ml-1 text-emerald-400 font-bold uppercase">PAID (ONLINE/COD)</strong>
            </div>
            <div className="text-right">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Grand Total</span>
              <span className="text-xl font-black text-amber-500">৳{(order.total || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t flex justify-end ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950'}`}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 hover:bg-slate-800">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
