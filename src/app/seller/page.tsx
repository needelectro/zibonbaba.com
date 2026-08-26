'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, Package, ShoppingBag, DollarSign, AlertTriangle, RefreshCw, X, Lock, ShieldAlert,
  Trash2, Edit, Clock, Wallet, Bell, Sparkles, Check, LogOut, Plus, ExternalLink, ArrowRight, Store, Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

type SellerTab = 'analytics' | 'products' | 'orders' | 'wallet' | 'staff' | 'settings';

interface SellerProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryId?: string;
  sku: string;
  stock: number;
  status: string;
  createdAt: string;
}

interface SellerOrder {
  id: string;
  date: string;
  customerName: string;
  customerPhone?: string;
  subTotal: number;
  total: number;
  platformFee: number;
  sellerPayout: number;
  status: string;
  source: string;
  items: {
    product: {
      id: string;
      name: string;
      price: number;
      sku: string;
    };
    quantity: number;
  }[];
}

interface StoreInfo {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  isApproved: boolean;
  commissionRate: number;
  createdAt?: string;
}

export default function SellerPortalPage() {
  const router = useRouter();
  const { isLoggedIn, role, logout } = useStore();
  const [activeTab, setActiveTab] = useState<SellerTab>('analytics');
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Isolated Seller States (Strictly scoped to authenticated store)
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [totalGrossSales, setTotalGrossSales] = useState(0);
  const [withdraws, setWithdraws] = useState<{ id: string; amount: number; status: string; date: string }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [monthlyGMV, setMonthlyGMV] = useState<{ month: string; value: number }[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string; status: string; permissions: string }[]>([]);

  // Add Product Form State
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdSKU, setNewProdSKU] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdCategory, setNewProdCategory] = useState('Electronics & Gadgets');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Store Settings Form State
  const [storeNameInput, setStoreNameInput] = useState('');
  const [storeDescInput, setStoreDescInput] = useState('');

  // Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Sales Staff');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  const getAuthToken = () => {
    return typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
  };

  // 1. Fetch Store Profile
  const fetchStoreProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/store', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.store) {
        setStoreInfo(data.store);
        setStoreNameInput(data.store.name || '');
        setStoreDescInput(data.store.description || '');
      }
    } catch (_) {}
  }, []);

  // 2. Fetch Isolated Products
  const fetchSellerProducts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setSellerProducts(data.products);
      }
    } catch (_) {}
  }, []);

  // 3. Fetch Isolated Orders
  const fetchSellerOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.orders)) {
        setSellerOrders(data.orders);
      }
    } catch (_) {}
  }, []);

  // 4. Fetch Isolated Wallet & Withdrawals
  const fetchSellerWallet = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/wallet', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        if (data.earnings !== undefined) setEarnings(data.earnings);
        if (data.grossSales !== undefined) setTotalGrossSales(data.grossSales);
        if (Array.isArray(data.withdrawals)) setWithdraws(data.withdrawals);
      }
    } catch (_) {}
  }, []);

  // 5. Fetch Isolated Analytics
  const fetchSellerAnalytics = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/analytics', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data.monthlyGMV)) setMonthlyGMV(data.monthlyGMV);
        if (data.totalCustomers !== undefined) setTotalCustomers(data.totalCustomers);
      }
    } catch (_) {}
  }, []);

  // 6. Fetch Staff Members
  const fetchSellerStaff = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/staff', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.staff)) {
        setStaffList(data.staff.map((s: any) => ({
          id: s.id,
          name: s.user?.profile?.fullName || s.user?.email || 'Staff Member',
          role: s.jobTitle || 'Staff',
          status: s.isActive ? 'ACTIVE' : 'INACTIVE',
          permissions: typeof s.permissions === 'string' ? JSON.parse(s.permissions).join(', ') : 'Inventory, Products'
        })));
      }
    } catch (_) {}
  }, []);

  // Initial Load
  useEffect(() => {
    setIsMounted(true);
    const token = getAuthToken();
    if (token) {
      setLoading(true);
      Promise.all([
        fetchStoreProfile(),
        fetchSellerProducts(),
        fetchSellerOrders(),
        fetchSellerWallet(),
        fetchSellerAnalytics(),
        fetchSellerStaff()
      ]).finally(() => setLoading(false));
    }
  }, [fetchStoreProfile, fetchSellerProducts, fetchSellerOrders, fetchSellerWallet, fetchSellerAnalytics, fetchSellerStaff]);

  if (!isMounted) return null;

  // Strict Role & Auth Guard
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />

        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center text-white backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-5 border border-amber-500/20 shadow-glow">
            <Store className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-bold text-primary mb-3">
            <Sparkles size={13} /> Seller Center
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-tight">Welcome to Seller Center</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Manage your store inventory, track customer orders, view analytics, and request fast payouts in your merchant dashboard.
          </p>
          <div className="space-y-3">
            <Link
              href="/seller/login"
              className="bg-primary text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full shadow-glow hover:bg-primary-accent transition-all duration-200"
            >
              <Lock className="w-4 h-4" />
              <span>Login to Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
            <Link
              href="/seller/register"
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Create Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </Link>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5">
              ← Return to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const normalizedRole = (role || '').trim().toLowerCase();
  const allowedRoles = ['vendor', 'staff', 'vendor_admin', 'vendor_staff', 'seller', 'superadmin', 'admin'];
  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center text-white backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-5 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2">Seller Access Required</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You are currently signed in with a Customer account. Please register your store or switch to your Seller account to access this portal.
          </p>
          <div className="space-y-3">
            <Link
              href="/seller/register"
              className="bg-primary text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full shadow-glow hover:bg-primary-accent transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Register as Seller</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
            <Link
              href="/seller/login"
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full border border-white/10 transition-all duration-200"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Login with Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-400" />
            </Link>
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-white pt-2 block w-full text-center transition-colors"
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice.trim()) {
      setErrorMsg('Product name and price are required.');
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    setIsSubmittingProd(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newProdName.trim(),
          price: parseFloat(newProdPrice),
          category: newProdCategory,
          sku: newProdSKU.trim() || undefined,
          stock: parseInt(newProdStock, 10) || 20,
          description: newProdDesc.trim() || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to add product.');
        return;
      }

      setNewProdName('');
      setNewProdPrice('');
      setNewProdSKU('');
      setNewProdDesc('');
      setSuccessMsg('Product SKU registered successfully in your store catalog!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchSellerProducts();
    } catch {
      setErrorMsg('Failed to connect to server. Please try again.');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Handle Open Edit Product Modal
  const handleOpenEditProduct = (prod: SellerProduct) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
    setEditDesc(prod.description || '');
  };

  // Handle Save Edit Product
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editName.trim(),
          price: parseFloat(editPrice),
          stock: parseInt(editStock, 10),
          description: editDesc.trim()
        })
      });
      if (res.ok) {
        setEditingProduct(null);
        setSuccessMsg('Product SKU updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3500);
        await fetchSellerProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update product.');
      }
    } catch (_) {
      alert('Network error while updating product.');
    }
  };

  // Handle Delete Product
  const handleDeleteProductItem = async (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product listing?')) return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/seller/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setSuccessMsg('Product listing removed.');
        setTimeout(() => setSuccessMsg(''), 3500);
        await fetchSellerProducts();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (_) {
      alert('Network error while deleting product.');
    }
  };

  // Handle Order Status Change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/seller/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId, status: newStatus })\n    });\n    if (res.ok) {\n      setSuccessMsg(`Order ${orderId} updated to ${newStatus}`);\n      setTimeout(() => setSuccessMsg(''), 3500);\n      await fetchSellerOrders();\n    } else {\n      const data = await res.json();\n      alert(data.error || 'Failed to update order status.');\n    }\n  } catch (_) {}\n};\n\n// Handle Payout Withdrawal Request\nconst handleRequestWithdraw = async (e: React.FormEvent) => {\n  e.preventDefault();\n  const amount = parseFloat(withdrawAmount);\n  if (!amount || amount <= 0 || amount > earnings) {\n    alert('Please enter a valid payout amount within your available balance.');\n    return;\n  }\n  const token = getAuthToken();\n  if (!token) return;\n\n  try {\n    const res = await fetch('/api/seller/wallet', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },\n      body: JSON.stringify({ amount, bankDetails: 'Primary Bank Account', payoutMethod: 'BANK_TRANSFER' })\n    });\n    const data = await res.json();\n    if (res.ok) {\n      setWithdrawAmount('');\n      alert('Withdrawal payout request submitted for review!');\n      await fetchSellerWallet();\n    } else {\n      alert(data.error || 'Failed to request payout.');\n    }\n  } catch (_) {\n    alert('Network error during payout request.');\n  }\n};\n\n// Handle Save Store Settings\nconst handleSaveStoreSettings = async (e: React.FormEvent) => {\n  e.preventDefault();\n  const token = getAuthToken();\n  if (!token) return;\n\n  try {\n    const res = await fetch('/api/seller/store', {\n      method: 'PUT',\n      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },\n      body: JSON.stringify({ name: storeNameInput.trim(), description: storeDescInput.trim() })\n    });\n    if (res.ok) {\n      alert('Store profile updated successfully!');\n      await fetchStoreProfile();\n    } else {\n      const data = await res.json();\n      alert(data.error || 'Failed to update store settings.');\n    }\n  } catch (_) {\n    alert('Network error while saving settings.');\n  }\n};\n\n// Handle Add Staff\nconst handleAddStaff = async (e: React.FormEvent) => {\n  e.preventDefault();\n  if (!newStaffName.trim() || !newStaffEmail.trim()) return;\n  const token = getAuthToken();\n  if (!token) return;\n\n  try {\n    const res = await fetch('/api/seller/staff', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },\n      body: JSON.stringify({\n        email: newStaffEmail.trim(),\n        fullName: newStaffName.trim(),\n        jobTitle: newStaffRole,\n        permissions: ['view:products', 'view:orders', 'view:inventory']\n      })\n    });\n    if (res.ok) {\n      alert('Staff member invitation created.');\n      setNewStaffName('');\n      setNewStaffEmail('');\n      await fetchSellerStaff();\n    } else {\n      const data = await res.json();\n      alert(data.error || 'Failed to add staff member.');\n    }\n  } catch (_) {}\n};\n\nconst lowStockItems = sellerProducts.filter(p => p.stock <= 10);\n\nreturn (\n  <div className=\"min-h-screen bg-gray-950 text-slate-100 flex flex-col md:flex-row antialiased\">\n    {/* SIDEBAR NAVIGATION */}\n    <aside className=\"w-full md:w-64 bg-gray-900 border-r border-white/10 p-5 flex flex-col justify-between shrink-0\">\n      <div className=\"space-y-6\">\n        <div className=\"flex items-center gap-3\">\n          <div className=\"w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-gray-950 text-xl shadow-glow\">\n            Z\n          </div>\n          <div>\n            <h2 className=\"font-black text-white text-base tracking-tight leading-none\">\n              Zibon<span className=\"text-primary\">baba</span>\n            </h2>\n            <span className=\"text-[10px] text-yellow-400 font-bold uppercase tracking-wider block mt-1\">\n              Seller Center\n            </span>\n          </div>\n        </div>\n\n        {/* Store Info Mini Badge */}\n        <div className=\"bg-white/5 border border-white/10 rounded-xl p-3\">\n          <div className=\"flex items-center justify-between\">\n            <span className=\"text-[10px] text-slate-400 font-bold uppercase\">Active Store</span>\n            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${storeInfo?.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>\n              {storeInfo?.isApproved ? 'VERIFIED' : 'PENDING'}\n            </span>\n          </div>\n          <p className=\"text-xs font-bold text-white mt-1 truncate\">{storeInfo?.name || 'My Seller Store'}</p>\n          {storeInfo?.id && (\n            <Link\n              href={`/store/${storeInfo.id}`}\n              target=\"_blank\"\n              className=\"text-[10px] text-primary hover:underline flex items-center gap-1 mt-1 font-semibold\"\n            >\n              View Public Store <ExternalLink size={10} />\n            </Link>\n          )}\n        </div>\n\n        {/* Navigation Links */}\n        <nav className=\"space-y-1 text-xs font-bold\">\n          {[\n            { id: 'analytics', label: 'Store Analytics', icon: TrendingUp },\n            { id: 'products', label: `Products (${sellerProducts.length})`, icon: Package },\n            { id: 'orders', label: `Orders (${sellerOrders.length})`, icon: ShoppingBag },\n            { id: 'wallet', label: 'Wallet & Payouts', icon: Wallet },\n            { id: 'staff', label: 'Staff Roles', icon: Users },\n            { id: 'settings', label: 'Store Settings', icon: Store }\n          ].map(tab => (\n            <button\n              key={tab.id}\n              onClick={() => setActiveTab(tab.id as SellerTab)}\n              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${\n                activeTab === tab.id\n                  ? 'bg-primary text-gray-950 font-black shadow-glow'\n                  : 'text-slate-400 hover:text-white hover:bg-white/5'\n              }`}\n            >\n              <tab.icon className=\"w-4 h-4 shrink-0\" />\n              <span>{tab.label}</span>\n            </button>\n          ))}\n        </nav>\n      </div>\n\n      {/* Footer Actions */}\n      <div className=\"space-y-2 pt-6 border-t border-white/10\">\n        <Link\n          href=\"/\"\n          className=\"flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors\"\n        >\n          <ArrowRight className=\"w-3.5 h-3.5 rotate-180\" /> Back to Marketplace\n        </Link>\n        <button\n          onClick={async () => {\n            await logout();\n            window.location.href = '/seller/login';\n          }}\n          className=\"w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer font-bold\"\n        >\n          <LogOut className=\"w-3.5 h-3.5\" /> Sign Out\n        </button>\n      </div>\n    </aside>\n\n    {/* MAIN CONTENT AREA */}\n    <main className=\"flex-1 p-6 lg:p-8 overflow-y-auto space-y-6\">\n      {/* Top Header */}\n      <header className=\"flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10\">\n        <div>\n          <h1 className=\"text-2xl font-black text-white tracking-tight\">\n            {activeTab === 'analytics' && 'Store Performance & Analytics'}\n            {activeTab === 'products' && 'Product Inventory Management'}\n            {activeTab === 'orders' && 'Order Processing Queue'}\n            {activeTab === 'wallet' && 'Seller Escrow Wallet'}\n            {activeTab === 'staff' && 'Store Staff & Roles'}\n            {activeTab === 'settings' && 'Store Configuration'}\n          </h1>\n          <p className=\"text-xs text-slate-400 mt-0.5\">\n            Store ID: <span className=\"font-mono text-primary\">{storeInfo?.id || 'Pending Store ID'}</span> | Commission: <span className=\"text-emerald-400 font-bold\">{storeInfo?.commissionRate || 8.5}%</span>\n          </p>\n        </div>\n\n        <div className=\"flex items-center gap-3\">\n          <button\n            onClick={() => {\n              fetchStoreProfile();\n              fetchSellerProducts();\n              fetchSellerOrders();\n              fetchSellerWallet();\n              fetchSellerAnalytics();\n            }}\n            className=\"p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold\"\n            title=\"Sync Store Data\"\n          >\n            <RefreshCw className=\"w-3.5 h-3.5\" />\n            <span>Refresh</span>\n          </button>\n        </div>\n      </header>\n\n      {/* Pending Verification Banner */}\n      {storeInfo && !storeInfo.isApproved && (\n        <div className=\"p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3 text-yellow-300 text-xs animate-fade-in\">\n          <Clock className=\"w-5 h-5 shrink-0 mt-0.5 text-yellow-400\" />\n          <div>\n            <h4 className=\"font-bold text-sm text-yellow-400 mb-1\">Store Application Under Review</h4>\n            <p className=\"text-gray-300 leading-relaxed\">\n              Welcome to Zibonbaba! Your store application is currently in <span className=\"text-yellow-400 font-bold\">Pending Admin Verification</span>. You can prepare your product catalog and store settings now. Your products will automatically publish live to millions of buyers once verified.\n            </p>\n          </div>\n        </div>\n      )}\n\n      {/* ANALYTICS TAB */}\n      {activeTab === 'analytics' && (\n        <div className=\"space-y-6 animate-fade-in\">\n          {/* KPI Cards */}\n          <div className=\"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4\">\n            <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl\">\n              <span className=\"text-[10px] font-bold text-slate-400 uppercase tracking-wider\">Available Balance</span>\n              <h4 className=\"text-2xl font-black text-white mt-1 text-emerald-400\">৳{earnings.toLocaleString()}</h4>\n              <span className=\"text-[9px] text-slate-500 mt-1 block\">Settled net escrow</span>\n            </div>\n            <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl\">\n              <span className=\"text-[10px] font-bold text-slate-400 uppercase tracking-wider\">Total Store Orders</span>\n              <h4 className=\"text-2xl font-black text-white mt-1 text-blue-400\">{sellerOrders.length}</h4>\n              <span className=\"text-[9px] text-slate-500 mt-1 block\">Lifecycle transactions</span>\n            </div>\n            <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl\">\n              <span className=\"text-[10px] font-bold text-slate-400 uppercase tracking-wider\">Catalog SKUs</span>\n              <h4 className=\"text-2xl font-black text-white mt-1 text-primary\">{sellerProducts.length}</h4>\n              <span className=\"text-[9px] text-slate-500 mt-1 block\">Registered items</span>\n            </div>\n            <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl\">\n              <span className=\"text-[10px] font-bold text-slate-400 uppercase tracking-wider\">Low Stock Alerts</span>\n              <h4 className=\"text-2xl font-black text-white mt-1 text-rose-400\">{lowStockItems.length}</h4>\n              <span className=\"text-[9px] text-slate-500 mt-1 block\">Items under 10 stock</span>\n            </div>\n          </div>\n\n          {/* Monthly Performance Chart */}\n          <div className=\"bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl\">\n            <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3 mb-4\">\n              Monthly Store GMV Performance\n            </h3>\n            {monthlyGMV.length === 0 ? (\n              <div className=\"flex flex-col items-center justify-center h-44 text-slate-500 text-xs\">\n                <TrendingUp className=\"w-8 h-8 text-slate-600 mb-2\" />\n                <p>No historical sales recorded yet. New sales will appear here automatically.</p>\n              </div>\n            ) : (\n              <div className=\"flex items-end gap-4 h-44 pt-4\">\n                {(() => {\n                  const maxVal = Math.max(...monthlyGMV.map(d => d.value), 1);\n                  return monthlyGMV.map((d, i) => {\n                    const pct = (d.value / maxVal) * 100;\n                    return (\n                      <div key={i} className=\"flex-grow flex flex-col items-center gap-2 group\">\n                        <span className=\"text-[9px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity\">\n                          ৳{d.value.toLocaleString()}\n                        </span>\n                        <div\n                          className=\"w-full rounded-t-lg bg-emerald-500/20 group-hover:bg-emerald-500/40 transition-all duration-300\"\n                          style={{ height: `${Math.max(pct, 4)}%` }}\n                        />\n                        <span className=\"text-[10px] font-extrabold text-slate-500 uppercase\">{d.month}</span>\n                      </div>\n                    );\n                  });\n                })()}\n              </div>\n            )}\n          </div>\n        </div>\n      )}\n\n      {/* PRODUCTS TAB */}\n      {activeTab === 'products' && (\n        <div className=\"space-y-6 animate-fade-in\">\n          {successMsg && (\n            <div className=\"p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl font-bold\">\n              {successMsg}\n            </div>\n          )}\n          {errorMsg && (\n            <div className=\"p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-bold\">\n              {errorMsg}\n            </div>\n          )}\n\n          <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6\">\n            {/* Product List */}\n            <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4\">\n              <div className=\"flex items-center justify-between border-b border-white/10 pb-3\">\n                <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest\">\n                  Your Store Products ({sellerProducts.length})\n                </h3>\n                <button onClick={fetchSellerProducts} className=\"text-primary text-xs flex items-center gap-1 font-bold hover:underline\">\n                  <RefreshCw className=\"w-3 h-3\" /> Refresh\n                </button>\n              </div>\n\n              {sellerProducts.length === 0 ? (\n                <div className=\"text-center py-12 space-y-3\">\n                  <Package className=\"w-10 h-10 text-slate-600 mx-auto\" />\n                  <p className=\"text-xs text-slate-400\">No products registered in this store yet.</p>\n                  <p className=\"text-[11px] text-slate-500\">Fill in the form on the right to register your first product SKU.</p>\n                </div>\n              ) : (\n                <div className=\"overflow-x-auto\">\n                  <table className=\"w-full text-left text-xs border-collapse\">\n                    <thead>\n                      <tr className=\"border-b border-white/10 bg-white/5 text-slate-400 font-bold\">\n                        <th className=\"py-2.5 px-3\">SKU</th>\n                        <th className=\"py-2.5 px-3\">Product Name</th>\n                        <th className=\"py-2.5 px-3\">Price</th>\n                        <th className=\"py-2.5 px-3 text-center\">Stock</th>\n                        <th className=\"py-2.5 px-3 text-right\">Actions</th>\n                      </tr>\n                    </thead>\n                    <tbody className=\"divide-y divide-white/5 font-semibold text-slate-300\">\n                      {sellerProducts.map(p => (\n                        <tr key={p.id} className=\"hover:bg-white/5 transition-colors\">\n                          <td className=\"py-3 px-3 font-mono font-bold text-primary\">{p.sku}</td>\n                          <td className=\"py-3 px-3 text-white font-bold\">{p.name}</td>\n                          <td className=\"py-3 px-3 font-bold\">৳{p.price.toLocaleString()}</td>\n                          <td className=\"py-3 px-3 text-center\">\n                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${\n                              p.stock > 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'\n                            }`}>\n                              {p.stock} units\n                            </span>\n                          </td>\n                          <td className=\"py-3 px-3 text-right\">\n                            <div className=\"flex items-center justify-end gap-2\">\n                              <button\n                                onClick={() => handleOpenEditProduct(p)}\n                                className=\"p-1.5 bg-white/5 hover:bg-primary/20 hover:text-primary rounded-lg text-slate-400 transition\"\n                                title=\"Edit Product\"\n                              >\n                                <Edit className=\"w-3.5 h-3.5\" />\n                              </button>\n                              <button\n                                onClick={() => handleDeleteProductItem(p.id)}\n                                className=\"p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition\"\n                                title=\"Delete Product\"\n                              >\n                                <Trash2 className=\"w-3.5 h-3.5\" />\n                              </button>\n                            </div>\n                          </td>\n                        </tr>\n                      ))}\n                    </tbody>\n                  </table>\n                </div>\n              )}\n            </div>\n\n            {/* Add Product Form */}\n            <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-4\">\n              <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3\">\n                Add New Product SKU\n              </h3>\n              <form onSubmit={handleAddProduct} className=\"space-y-3 text-xs font-bold\">\n                <div>\n                  <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Product Name *</label>\n                  <input\n                    type=\"text\"\n                    required\n                    placeholder=\"e.g. Wireless Noise Canceling Headphones\"\n                    value={newProdName}\n                    onChange={e => setNewProdName(e.target.value)}\n                    className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary\"\n                  />\n                </div>\n                <div className=\"grid grid-cols-2 gap-2.5\">\n                  <div>\n                    <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Price (৳) *</label>\n                    <input\n                      type=\"number\"\n                      required\n                      step=\"0.01\"\n                      placeholder=\"2500\"\n                      value={newProdPrice}\n                      onChange={e => setNewProdPrice(e.target.value)}\n                      className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary\"\n                    />\n                  </div>\n                  <div>\n                    <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">SKU Code</label>\n                    <input\n                      type=\"text\"\n                      placeholder=\"AUTO-GEN\"\n                      value={newProdSKU}\n                      onChange={e => setNewProdSKU(e.target.value)}\n                      className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary font-mono\"\n                    />\n                  </div>\n                </div>\n                <div className=\"grid grid-cols-2 gap-2.5\">\n                  <div>\n                    <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Category</label>\n                    <select\n                      value={newProdCategory}\n                      onChange={e => setNewProdCategory(e.target.value)}\n                      className=\"w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none\"\n                    >\n                      {['Electronics & Gadgets', 'Apparel & Fashion', 'Health & Beauty', 'Home & Kitchen', 'Groceries & Pantry', 'Books & Stationery', 'General Retail'].map(cat => (\n                        <option key={cat} value={cat}>{cat}</option>\n                      ))}\n                    </select>\n                  </div>\n                  <div>\n                    <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Initial Stock</label>\n                    <input\n                      type=\"number\"\n                      value={newProdStock}\n                      onChange={e => setNewProdStock(e.target.value)}\n                      className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none\"\n                    />\n                  </div>\n                </div>\n                <div>\n                  <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Description</label>\n                  <textarea\n                    rows={3}\n                    value={newProdDesc}\n                    onChange={e => setNewProdDesc(e.target.value)}\n                    placeholder=\"Product features, specifications, and warranty details...\"\n                    className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none\"\n                  />\n                </div>\n                <button\n                  type=\"submit\"\n                  disabled={isSubmittingProd}\n                  className=\"w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl transition-all shadow-glow cursor-pointer disabled:opacity-50\"\n                >\n                  {isSubmittingProd ? 'Publishing SKU...' : 'Publish Product to Store'}\n                </button>\n              </form>\n            </div>\n          </div>\n        </div>\n      )}\n\n      {/* ORDERS TAB */}\n      {activeTab === 'orders' && (\n        <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl animate-fade-in space-y-4\">\n          <div className=\"flex items-center justify-between border-b border-white/10 pb-3\">\n            <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest\">\n              Store Order Dispatch Queue ({sellerOrders.length})\n            </h3>\n            <button onClick={fetchSellerOrders} className=\"text-primary text-xs flex items-center gap-1 font-bold hover:underline\">\n              <RefreshCw className=\"w-3 h-3\" /> Sync Orders\n            </button>\n          </div>\n\n          {sellerOrders.length === 0 ? (\n            <div className=\"text-center py-12 space-y-2\">\n              <ShoppingBag className=\"w-10 h-10 text-slate-600 mx-auto\" />\n              <p className=\"text-xs text-slate-400\">No customer orders received for your store yet.</p>\n              <p className=\"text-[11px] text-slate-500\">Orders placed by customers for your products will appear here in real time.</p>\n            </div>\n          ) : (\n            <div className=\"overflow-x-auto\">\n              <table className=\"w-full text-left text-xs border-collapse\">\n                <thead>\n                  <tr className=\"border-b border-white/10 bg-white/5 text-slate-400 font-bold\">\n                    <th className=\"py-2.5 px-3\">Order Ref</th>\n                    <th className=\"py-2.5 px-3\">Customer</th>\n                    <th className=\"py-2.5 px-3\">Subtotal</th>\n                    <th className=\"py-2.5 px-3\">Payout (Net)</th>\n                    <th className=\"py-2.5 px-3 text-center\">Status</th>\n                    <th className=\"py-2.5 px-3 text-right\">Update Lifecycle</th>\n                  </tr>\n                </thead>\n                <tbody className=\"divide-y divide-white/5 font-semibold text-slate-300\">\n                  {sellerOrders.map(o => (\n                    <tr key={o.id} className=\"hover:bg-white/5 transition-colors\">\n                      <td className=\"py-3.5 px-3 font-mono font-bold text-primary\">{o.id}</td>\n                      <td className=\"py-3.5 px-3\">\n                        <p className=\"text-white font-bold\">{o.customerName}</p>\n                        {o.customerPhone && <p className=\"text-[10px] text-slate-500\">{o.customerPhone}</p>}\n                      </td>\n                      <td className=\"py-3.5 px-3 font-bold\">৳{o.subTotal.toLocaleString()}</td>\n                      <td className=\"py-3.5 px-3 font-bold text-emerald-400\">৳{o.sellerPayout.toLocaleString()}</td>\n                      <td className=\"py-3.5 px-3 text-center\">\n                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${\n                          o.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :\n                          o.status === 'CANCELLED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :\n                          'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'\n                        }`}>\n                          {o.status}\n                        </span>\n                      </td>\n                      <td className=\"py-3.5 px-3 text-right\">\n                        <select\n                          value={o.status}\n                          onChange={(e) => handleStatusChange(o.id, e.target.value)}\n                          className=\"bg-gray-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer\"\n                        >\n                          <option value=\"PENDING\">PENDING</option>\n                          <option value=\"PROCESSING\">PROCESSING</option>\n                          <option value=\"DISPATCHED\">DISPATCHED</option>\n                          <option value=\"SHIPPED\">SHIPPED</option>\n                          <option value=\"DELIVERED\">DELIVERED</option>\n                          <option value=\"CANCELLED\">CANCELLED</option>\n                        </select>\n                      </td>\n                    </tr>\n                  ))}\n                </tbody>\n              </table>\n            </div>\n          )}\n        </div>\n      )}\n\n      {/* WALLET TAB */}\n      {activeTab === 'wallet' && (\n        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in\">\n          <div className=\"bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-4\">\n            <div>\n              <span className=\"text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-1\">\n                Settled Escrow Balance\n              </span>\n              <h3 className=\"text-3xl font-black text-white\">৳{earnings.toLocaleString()} BDT</h3>\n              <p className=\"text-xs text-slate-400 mt-2 leading-relaxed\">\n                Gross Sales: ৳{totalGrossSales.toLocaleString()} | Platform Commission: {storeInfo?.commissionRate || 8.5}%. Withdrawals are transferred directly to your bank account after verification.\n              </p>\n            </div>\n\n            <form onSubmit={handleRequestWithdraw} className=\"flex gap-2 max-w-sm pt-2\">\n              <input\n                type=\"number\"\n                required\n                placeholder=\"Withdraw amount (৳)...\"\n                value={withdrawAmount}\n                onChange={e => setWithdrawAmount(e.target.value)}\n                className=\"bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-primary w-full\"\n              />\n              <button\n                type=\"submit\"\n                className=\"bg-primary hover:bg-primary-accent text-gray-950 font-black text-xs px-5 rounded-xl transition-all shadow-glow cursor-pointer whitespace-nowrap\"\n              >\n                Request Payout\n              </button>\n            </form>\n          </div>\n\n          {/* Withdrawal logs */}\n          <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-3.5\">\n            <h4 className=\"text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-2\">\n              Payout Requests History\n            </h4>\n            {withdraws.length === 0 ? (\n              <p className=\"text-xs text-slate-500 py-6 text-center\">No withdrawal requests recorded yet.</p>\n            ) : (\n              <div className=\"space-y-2.5 overflow-y-auto max-h-60 pr-1\">\n                {withdraws.map(w => (\n                  <div key={w.id} className=\"p-3 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center text-xs\">\n                    <div>\n                      <span className=\"font-mono text-[9px] text-primary block\">{w.id}</span>\n                      <span className=\"text-white font-bold mt-0.5 block\">৳{w.amount.toLocaleString()}</span>\n                    </div>\n                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${\n                      w.status === 'COMPLETED' || w.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'\n                    }`}>\n                      {w.status}\n                    </span>\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n        </div>\n      )}\n\n      {/* STAFF TAB */}\n      {activeTab === 'staff' && (\n        <div className=\"grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in\">\n          <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4\">\n            <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3\">\n              Active Store Staff Members ({staffList.length})\n            </h3>\n            {staffList.length === 0 ? (\n              <p className=\"text-xs text-slate-500 py-6 text-center\">No staff members invited yet.</p>\n            ) : (\n              <div className=\"space-y-2.5\">\n                {staffList.map(stf => (\n                  <div key={stf.id} className=\"p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-xs\">\n                    <div>\n                      <h4 className=\"font-black text-white\">{stf.name}</h4>\n                      <p className=\"text-[10px] text-slate-400 mt-0.5\">Role: {stf.role} | Permissions: {stf.permissions}</p>\n                    </div>\n                    <span className=\"bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded uppercase\">\n                      {stf.status}\n                    </span>\n                  </div>\n                ))}\n              </div>\n            )}\n          </div>\n\n          <div className=\"bg-white/5 border border-white/10 p-5 rounded-2xl shadow-xl space-y-4\">\n            <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3\">\n              Invite Staff Member\n            </h3>\n            <form onSubmit={handleAddStaff} className=\"space-y-3 text-xs font-bold\">\n              <div>\n                <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Staff Full Name</label>\n                <input\n                  type=\"text\"\n                  required\n                  value={newStaffName}\n                  onChange={e => setNewStaffName(e.target.value)}\n                  className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none\"\n                />\n              </div>\n              <div>\n                <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Staff Email Address</label>\n                <input\n                  type=\"email\"\n                  required\n                  value={newStaffEmail}\n                  onChange={e => setNewStaffEmail(e.target.value)}\n                  className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none\"\n                />\n              </div>\n              <div>\n                <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Designation</label>\n                <select\n                  value={newStaffRole}\n                  onChange={e => setNewStaffRole(e.target.value)}\n                  className=\"w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none\"\n                >\n                  <option value=\"Store Manager\">Store Manager</option>\n                  <option value=\"Inventory Staff\">Inventory Staff</option>\n                  <option value=\"Sales Staff\">Sales Staff</option>\n                </select>\n              </div>\n              <button\n                type=\"submit\"\n                className=\"w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl transition-all shadow-glow cursor-pointer\"\n              >\n                Generate Invitation\n              </button>\n            </form>\n          </div>\n        </div>\n      )}\n\n      {/* SETTINGS TAB */}\n      {activeTab === 'settings' && (\n        <div className=\"bg-white/5 border border-white/10 p-6 rounded-2xl shadow-xl max-w-xl space-y-4 animate-fade-in\">\n          <h3 className=\"text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/10 pb-3\">\n            Store Profile & Identity\n          </h3>\n          <form onSubmit={handleSaveStoreSettings} className=\"space-y-4 text-xs font-bold\">\n            <div>\n              <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Store Name *</label>\n              <input\n                type=\"text\"\n                required\n                value={storeNameInput}\n                onChange={e => setStoreNameInput(e.target.value)}\n                className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary\"\n              />\n            </div>\n            <div>\n              <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Store Description</label>\n              <textarea\n                rows={3}\n                value={storeDescInput}\n                onChange={e => setStoreDescInput(e.target.value)}\n                className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none\"\n              />\n            </div>\n            <button\n              type=\"submit\"\n              className=\"w-full bg-primary hover:bg-primary-accent text-gray-950 text-xs font-black py-3 rounded-xl transition-all shadow-glow cursor-pointer\"\n            >\n              Save Store Settings\n            </button>\n          </form>\n        </div>\n      )}\n\n      {/* EDIT PRODUCT MODAL */}\n      {editingProduct && (\n        <div className=\"fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4\">\n          <div className=\"bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-md w-full relative space-y-4\">\n            <button\n              onClick={() => setEditingProduct(null)}\n              className=\"absolute top-4 right-4 text-slate-400 hover:text-white\"\n            >\n              <X className=\"w-5 h-5\" />\n            </button>\n            <h3 className=\"text-sm font-black text-white uppercase tracking-wider\">\n              Edit SKU: {editingProduct.sku}\n            </h3>\n            <form onSubmit={handleSaveEditProduct} className=\"space-y-3 text-xs font-bold\">\n              <div>\n                <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Product Name</label>\n                <input\n                  type=\"text\"\n                  required\n                  value={editName}\n                  onChange={e => setEditName(e.target.value)}\n                  className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary\"\n                />\n              </div>\n              <div className=\"grid grid-cols-2 gap-2.5\">\n                <div>\n                  <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Price (৳)</label>\n                  <input\n                    type=\"number\"\n                    required\n                    step=\"0.01\"\n                    value={editPrice}\n                    onChange={e => setEditPrice(e.target.value)}\n                    className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary\"\n                  />\n                </div>\n                <div>\n                  <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Stock Units</label>\n                  <input\n                    type=\"number\"\n                    required\n                    value={editStock}\n                    onChange={e => setEditStock(e.target.value)}\n                    className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-primary\"\n                  />\n                </div>\n              </div>\n              <div>\n                <label className=\"block text-[10px] text-slate-400 uppercase mb-1\">Description</label>\n                <textarea\n                  rows={3}\n                  value={editDesc}\n                  onChange={e => setEditDesc(e.target.value)}\n                  className=\"w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none\"\n                />\n              </div>\n              <div className=\"flex gap-2.5 pt-2\">\n                <button\n                  type=\"button\"\n                  onClick={() => setEditingProduct(null)}\n                  className=\"flex-1 bg-white/5 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors\"\n                >\n                  Cancel\n                </button>\n                <button\n                  type=\"submit\"\n                  className=\"flex-1 bg-primary hover:bg-primary-accent text-gray-950 font-black py-2.5 rounded-xl transition-all shadow-glow\"\n                >\n                  Save Changes\n                </button>\n              </div>\n            </form>\n          </div>\n        </div>\n      )}\n    </main>\n  </div>\n);\n}\n