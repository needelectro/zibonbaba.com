'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product, Order } from '@/store/useStore';
import {
  TrendingUp, Package, ShoppingBag, Users, DollarSign, AlertTriangle, CheckCircle, BarChart2,
  Store, Building, Plus, RefreshCw, X, Lock, ShieldAlert, Settings, Download, Trash2, Edit, ArrowLeft,
  ChevronRight, KeyRound, Clock, Wallet, Bell, Sparkles, Check, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SellerTab = 'analytics' | 'products' | 'orders' | 'wallet' | 'staff' | 'settings';

export default function SellerPortalPage() {
  const router = useRouter();
  const { products, orders, addProduct, updateProduct, deleteProduct, updateOrderStatus, categories, isLoggedIn, role, logout, fetchProducts, fetchOrders } = useStore();
  const [activeTab, setActiveTab] = useState<SellerTab>('analytics');
  const [isMounted, setIsMounted] = useState(false);

  // Add product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdSKU, setNewProdSKU] = useState('');
  const [newProdStock, setNewProdStock] = useState('20');
  const [newProdCategory, setNewProdCategory] = useState('Electronics');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Product Edit Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Store & Wallet States
  const [storeInfo, setStoreInfo] = useState<{ id?: string; name?: string; description?: string; logo?: string; commissionRate?: number; isApproved?: boolean } | null>(null);
  const [storeNameInput, setStoreNameInput] = useState('Zibonbaba Direct Store');
  const [storeDescInput, setStoreDescInput] = useState('Authorized merchant selling consumer electronics, apparels, and groceries directly to customer accounts.');

  const [earnings, setEarnings] = useState(0);
  const [withdraws, setWithdraws] = useState<{ id: string; amount: number; status: string; date: string }[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Analytics States
  const [monthlyGMV, setMonthlyGMV] = useState<{ month: string; value: number }[]>([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Store Staff States
  const [staffList, setStaffList] = useState<{ id: string; name: string; role: string; status: string; permissions: string }[]>([]);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Sales Staff');
  const [newStaffEmail, setNewStaffEmail] = useState('');

  useEffect(() => {
    setIsMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      fetch('/api/seller/store', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.store) {
            setStoreInfo(data.store);
            setStoreNameInput(data.store.name || 'Zibonbaba Direct Store');
            if (data.store.description) setStoreDescInput(data.store.description);
          }
        })
        .catch(() => {});

      fetch('/api/seller/wallet', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.earnings !== undefined) {
            setEarnings(data.earnings);
          }
          if (data.withdrawals && Array.isArray(data.withdrawals)) {
            setWithdraws(data.withdrawals);
          }
        })
        .catch(() => {});

      setAnalyticsLoading(true);
      fetch('/api/seller/analytics', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.monthlyGMV && Array.isArray(data.monthlyGMV)) {
            setMonthlyGMV(data.monthlyGMV);
          }
          if (data.totalCustomers !== undefined) {
            setTotalCustomers(data.totalCustomers);
          }
        })
        .catch(() => {})
        .finally(() => setAnalyticsLoading(false));

      fetch('/api/seller/staff', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.staff && Array.isArray(data.staff) && data.staff.length > 0) {
            setStaffList(data.staff.map((s: any) => ({
              id: s.id,
              name: s.user?.profile?.fullName || s.user?.email || 'Staff Member',
              role: s.jobTitle || 'Staff',
              status: s.isActive ? 'ACTIVE' : 'INACTIVE',
              permissions: typeof s.permissions === 'string' ? JSON.parse(s.permissions).join(', ') : 'Inventory, Products'
            })));
          }
        })
        .catch(() => {});
    }
  }, []);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Login Required</h1>
          <p className="text-xs text-slate-400 mb-6">Please log in to your account to access the Seller Portal.</p>
          <Link href="/seller/login" className="bg-primary text-gray-950 font-black text-xs px-6 py-3 rounded-2xl block w-full text-center shadow-glow hover:bg-primary-accent transition-all">
            Proceed to Seller Login
          </Link>
        </div>
      </div>
    );
  }

  const normalizedRole = (role || '').trim().toLowerCase();
  const allowedRoles = ['vendor', 'staff', 'vendor_admin', 'vendor_staff', 'seller', 'superadmin', 'admin'];
  if (!allowedRoles.includes(normalizedRole)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Access Denied</h1>
          <p className="text-xs text-slate-400 mb-6">Strict Dashboard Isolation is active. You do not have permission to view the Seller Portal.</p>
          <button onClick={() => router.push('/')} className="bg-white/5 border border-white/5 text-slate-350 hover:text-white font-black text-xs px-6 py-3 rounded-2xl block w-full">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdSKU) return;
    await addProduct({
      id: 'prod-' + Math.random().toString(36).substr(2, 9),
      name: newProdName,
      price: parseFloat(newProdPrice),
      category: newProdCategory,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      sku: newProdSKU.toUpperCase(),
      stock: parseInt(newProdStock) || 10,
      vendor: storeInfo?.name || 'My Store',
      description: newProdDesc || 'No description provided.',
    });
    setNewProdName(''); setNewProdPrice(''); setNewProdSKU(''); setNewProdDesc('');
    setSuccessMsg('Product published to marketplace catalog!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price.toString());
    setEditStock(prod.stock.toString());
    setEditDesc(prod.description || '');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await updateProduct(editingProduct.id, {
      name: editName,
      price: parseFloat(editPrice),
      stock: parseInt(editStock),
      description: editDesc,
      category: editingProduct.category
    });
    setEditingProduct(null);
    setSuccessMsg('Product SKU updated successfully!');
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleDeleteProductItem = async (prodId: string) => {
    if (confirm('Are you sure you want to delete this product listing?')) {
      await deleteProduct(prodId);
      setSuccessMsg('Product listing removed.');
      setTimeout(() => setSuccessMsg(''), 3500);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setSuccessMsg(`Order ${orderId} status updated to ${newStatus}`);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handleRequestWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount > earnings) {
      alert('Invalid withdrawal amount');
      return;
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      try {
        const res = await fetch('/api/seller/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ amount, bankDetails: 'Primary Bank Account' })
        });
        if (res.ok) {
          setWithdraws([
            { id: 'w-' + Math.floor(Math.random()*900 + 100), amount, status: 'PENDING', date: new Date().toISOString().split('T')[0] },
            ...withdraws
          ]);
          setEarnings(prev => Math.max(0, prev - amount));
          setWithdrawAmount('');
          alert('Withdrawal payout request submitted!');
          return;
        }
      } catch (_) {}
    }

    setWithdraws([
      { id: 'w-' + Math.floor(Math.random()*900 + 100), amount, status: 'PENDING', date: new Date().toISOString().split('T')[0] },
      ...withdraws
    ]);
    setEarnings(prev => Math.max(0, prev - amount));
    setWithdrawAmount('');
    alert('Withdrawal request successfully logged.');
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token && newStaffEmail) {
      try {
        const res = await fetch('/api/seller/staff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            email: newStaffEmail,
            fullName: newStaffName,
            jobTitle: newStaffRole,
            permissions: ['view:products', 'view:orders', 'view:inventory']
          })
        });
        if (res.ok) {
          alert('Staff member invitation created.');
        }
      } catch (_) {}
    }

    setStaffList([...staffList, {
      id: 'stf-' + Math.floor(Math.random()*900 + 100),
      name: newStaffName,
      role: newStaffRole,
      status: 'ACTIVE',
      permissions: 'Inventory, Products'
    }]);
    setNewStaffName('');
    setNewStaffEmail('');
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null;
    if (token) {
      try {
        const res = await fetch('/api/seller/store', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: storeNameInput, description: storeDescInput })
        });
        if (res.ok) {
          alert('Store properties updated in backend database!');
          return;
        }
      } catch (_) {}
    }
    alert('Store variables updated!');
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockItems = products.filter(p => p.stock <= 10);

  const navTabs = [
    { id: 'analytics' as const, label: 'Store Analytics', icon: BarChart2 },
    { id: 'products' as const, label: 'Products Master', icon: Package },
    { id: 'orders' as const, label: 'Order Processing', icon: ShoppingBag },
    { id: 'wallet' as const, label: 'Store Wallet', icon: Wallet },
    { id: 'staff' as const, label: 'Manage Staff', icon: Users },
    { id: 'settings' as const, label: 'Store Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      <aside className="w-full md:w-64 bg-slate-950 border-r border-white/5 flex flex-col z-10 shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center font-black text-slate-950 shadow-md">
              S
            </div>
            <span className="font-extrabold text-xs tracking-wider uppercase text-white">
              Seller <span className="text-emerald-400">Portal</span>
            </span>
          </div>
          {(normalizedRole === 'superadmin' || normalizedRole === 'admin') && (
            <span className="bg-red-500/20 text-red-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-red-500/20 animate-pulse">
              Admin Mode
            </span>
          )}
        </div>

        <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                  isActive 
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-white shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-slate-950/60 space-y-2">
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/seller/login';
            }}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold py-2.5 rounded-xl transition-all border border-rose-500/20 cursor-pointer active:scale-98"
            title="Sign Out of Seller Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-8 overflow-y-auto z-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-white uppercase tracking-wider">{storeInfo?.name || 'Merchant Store Panel'}</h1>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase border ${
                storeInfo?.isApproved
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 animate-pulse'
              }`}>
                {storeInfo?.isApproved ? 'Verified Seller' : 'Pending Verification'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage catalog listings, process customer orders, evaluate inventory, and request payout withdrawals.</p>
          </div>
          <div className="flex items-center gap-3">
            {(normalizedRole === 'superadmin' || normalizedRole === 'admin') && (
              <Link href="/admin" className="bg-primary/20 hover:bg-primary/30 border border-primary/40 text-primary text-[10px] font-black px-4 py-2 rounded-xl transition-colors">
                Return to Admin Portal
              </Link>
            )}
            <button
              onClick={async () => {
                await logout();
                window.location.href = '/seller/login';
              }}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
              title="Log Out of System"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {storeInfo && !storeInfo.isApproved && (
          <div className="mb-6 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-3 text-yellow-300 text-xs animate-fade-in">
            <Clock className="w-5 h-5 shrink-0 mt-0.5 text-yellow-400" />
            <div>
              <h4 className="font-bold text-sm text-yellow-400 mb-1">Store Verification in Progress</h4>
              <p className="text-gray-300 leading-relaxed">
                Your store application is currently under review by Zibonbaba Platform Administrators. You can prepare your product catalog, staff roles, and inventory now. All products will automatically publish live to millions of buyers upon admin approval.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Store Earnings (Escrow)', value: `৳${earnings.toLocaleString()}`, desc: 'Settled store funds', icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Store Orders', value: orders.length, desc: 'Transactional volume', icon: ShoppingBag, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
                { label: 'Catalog Items', value: products.length, desc: 'Registered product SKUs', icon: Package, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                { label: 'Low Stock Alerts', value: lowStockItems.length, desc: 'Under 10 units threshold', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
              ].map((card, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl flex items-center justify-between shadow-xl">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</span>
                    <h4 className="text-2xl font-black text-white mt-2 tracking-tight">{card.value}</h4>
                    <span className="text-[9px] text-slate-500 mt-1 block leading-none">{card.desc}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl">
              <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest border-b border-white/5 pb-3.5 mb-5">
                Monthly Performance GMV (Last 6 Months)
              </h3>
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-44 text-slate-500 text-xs">Loading analytics data...</div>
              ) : monthlyGMV.length === 0 ? (
                <div className="flex items-center justify-center h-44 text-slate-500 text-xs">No sales data available yet.</div>
              ) : (
                <div className="flex items-end gap-4 h-44 pt-4">
                  {(() => {
                    const maxVal = Math.max(...monthlyGMV.map(d => d.value), 1);
                    return monthlyGMV.map((d, i) => {
                      const pct = (d.value / maxVal) * 100;
                      return (
                        <div key={i} className="flex-grow flex flex-col items-center gap-2 group">
                          <span className="text-[9px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            ৳{d.value >= 1000 ? `${(d.value/1000).toFixed(1)}k` : d.value.toLocaleString()}
                          </span>
                          <div
                            className={`w-full rounded-t-lg transition-all duration-300 ${
                              d.value > 0
                                ? 'bg-emerald-500/20 group-hover:bg-gradient-to-t group-hover:from-emerald-600 group-hover:to-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'bg-white/5'
                            }`}
                            style={{ height: `${Math.max(pct, 2)}%` }}
                          />
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase">{d.month}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {successMsg && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold">
                {successMsg}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest">Active SKU Inventory ({products.length})</h3>
                  <button onClick={() => fetchProducts()} className="text-emerald-400 text-xs flex items-center gap-1 font-bold hover:underline">
                    <RefreshCw className="w-3 h-3" /> Refresh
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold">
                        <th className="py-2.5 px-3">SKU</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3 text-center">Stock</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-slate-350">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-emerald-450">{p.sku}</td>
                          <td className="py-3 px-3 text-white font-extrabold">{p.name}</td>
                          <td className="py-3 px-3">৳{p.price.toLocaleString()}</td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] border ${
                              p.stock > 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg text-slate-400 transition"
                                title="Edit Product"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProductItem(p.id)}
                                className="p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest border-b border-white/5 pb-3">Register SKU Catalog</h3>
                <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs font-bold">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Product Name</label>
                    <input type="text" required value={newProdName} onChange={e => setNewProdName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Price (৳)</label>
                      <input type="number" required value={newProdPrice} onChange={e => setNewProdPrice(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white" />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">SKU Code</label>
                      <input type="text" required value={newProdSKU} onChange={e => setNewProdSKU(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Category</label>
                      <select value={newProdCategory} onChange={e => setNewProdCategory(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-white">
                        {categories.filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Initial Stock</label>
                      <input type="number" value={newProdStock} onChange={e => setNewProdStock(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Description</label>
                    <textarea rows={2} value={newProdDesc} onChange={e => setNewProdDesc(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white resize-none" placeholder="Product details..." />
                  </div>
                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black py-2.5 rounded-xl transition-all cursor-pointer">
                    Publish Product Item
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest">
                Order Dispatch Queue ({orders.length})
              </h3>
              <button onClick={() => fetchOrders()} className="text-emerald-400 text-xs flex items-center gap-1 font-bold hover:underline">
                <RefreshCw className="w-3 h-3" /> Sync Orders
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold">
                    <th className="py-2.5 px-3">Order Ref</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Total Value</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Update Lifecycle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-semibold text-slate-350">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-3 font-mono font-bold text-emerald-450">{o.id}</td>
                      <td className="py-3.5 px-3">{o.date}</td>
                      <td className="py-3.5 px-3 text-white">৳{o.total.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                          o.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                          o.status === 'CANCELLED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          'bg-amber-500/10 border-amber-500/20 text-[#FFC107]'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
                          className="bg-slate-900 border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-lg outline-none cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PROCESSING">PROCESSING</option>
                          <option value="DISPATCHED">DISPATCHED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                        No orders recorded for vendor store yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-gradient-to-tr from-emerald-500/20 to-teal-500/5 border border-white/5 p-6 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
              <div>
                <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-widest block mb-0.5">Verified Payout Earnings Escrow</span>
                <h3 className="text-3xl font-black text-white">৳{earnings.toLocaleString()} BDT</h3>
                <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Escrow logs represent completed transactional checkouts settled across system logistics. Withdrawals are processed daily directly to registered merchant bank profiles.</p>
              </div>
              
              <form onSubmit={handleRequestWithdraw} className="flex gap-2 max-w-sm pt-2">
                <input
                  type="number"
                  required
                  placeholder="Withdraw amount (৳)..."
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-5 rounded-xl transition-all cursor-pointer">
                  Request Payout
                </button>
              </form>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-3.5">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/5 pb-2">Recent Payout Registers</h4>
              <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
                {withdraws.map(w => (
                  <div key={w.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono text-[9px] text-emerald-400 block">{w.id}</span>
                      <span className="text-white font-extrabold mt-0.5 block">৳{w.amount.toLocaleString()}</span>
                    </div>
                    <span className={`text-[8.5px] font-black px-2 py-0.5 rounded border ${
                      w.status === 'APPROVED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-[#FFC107]'
                    }`}>
                      {w.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
              <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest border-b border-white/5 pb-3">Active Store Staff Roles</h3>
              <div className="space-y-3">
                {staffList.map(stf => (
                  <div key={stf.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] bg-white/5 text-slate-400 rounded px-1.5 py-0.25 border border-white/5">{stf.id}</span>
                        <h4 className="font-black text-white">{stf.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Role: {stf.role} | Access: <span className="text-slate-200">{stf.permissions}</span></p>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[8.5px] font-black px-2 py-0.5 rounded uppercase">
                      {stf.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest border-b border-white/5 pb-3">Invite Store Member</h3>
              <form onSubmit={handleAddStaff} className="space-y-3.5 text-xs font-bold">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Full Display Name</label>
                  <input type="text" required value={newStaffName} onChange={e => setNewStaffName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Staff Email Address</label>
                  <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} placeholder="staff@store.com" className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-white" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Job Designation</label>
                  <select value={newStaffRole} onChange={e => setNewStaffRole(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl p-2 text-white">
                    <option value="Store Manager">Store Manager</option>
                    <option value="Inventory Staff">Inventory Staff</option>
                    <option value="Sales Staff">Sales Staff</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                  Generate Invitation
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl max-w-xl space-y-5 animate-fade-in">
            <h3 className="text-xs font-black text-slate-350 uppercase tracking-widest border-b border-white/5 pb-3">
              Store Properties & Business Profile
            </h3>
            <form onSubmit={handleSaveStoreSettings} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Official Store Name</label>
                <input type="text" value={storeNameInput} onChange={e => setStoreNameInput(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-white" />
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Business Description</label>
                <textarea rows={3} value={storeDescInput} onChange={e => setStoreDescInput(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-white resize-none" />
              </div>
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                Save Store Properties
              </button>
            </form>
          </div>
        )}

        {editingProduct && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full relative space-y-4">
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Edit Product SKU: {editingProduct.sku}
              </h3>
              <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs font-bold">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Price (৳)</label>
                    <input
                      type="number"
                      required
                      value={editPrice}
                      onChange={e => setEditPrice(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={editStock}
                      onChange={e => setEditStock(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-white resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="flex-1 bg-white/5 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-2.5 rounded-xl"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
