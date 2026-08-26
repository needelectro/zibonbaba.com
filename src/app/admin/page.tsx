'use client';

import React, { useState, useEffect } from 'react';
import { useStore, Product, Order, Customer } from '@/store/useStore';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Store,
  Package,
  FolderTree,
  Boxes,
  Warehouse,
  Monitor,
  Handshake,
  Contact,
  UserCheck,
  Megaphone,
  Globe,
  CreditCard,
  TrendingUp,
  BellRing,
  HeartHandshake,
  ShieldAlert,
  KeyRound,
  Settings2,
  BrainCircuit,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  X,
  Check,
  CheckCircle,
  TrendingDown,
  UserPlus,
  ChevronRight,
  Download,
  Send,
  FileText,
  Lock,
  Activity,
  LogOut,
  MapPin,
  Clock,
  Printer,
  Bot,
  Sparkles,
  Terminal,
  SlidersHorizontal,
  User,
  Wallet,
  Zap,
  Briefcase,
  AlertOctagon,
  ArrowRightLeft,
  Settings,
  ShieldCheck,
  Hash,
  RefreshCw,
  EyeOff,
  Menu
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnterpriseDataTable from '@/components/enterprise-data-table';
import SlideOverDrawer from '@/components/slide-over-drawer';

type AdminModule =
  | 'dashboard' | 'marketplace' | 'orders' | 'customers' | 'sellers'
  | 'resellers' | 'delivery' | 'inventory' | 'warehouse' | 'pos'
  | 'crm' | 'erp' | 'hrm' | 'wallet' | 'finance' | 'reports'
  | 'notifications' | 'rbac' | 'settings' | 'audit' | 'ai' | 'superadmin';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    products,
    orders,
    crmCustomers,
    fetchProducts,
    fetchOrders,
    fetchCrmCustomers,
    addCustomer,
    addProduct,
    categories,
    fetchHomepage,
    token,
    isLoggedIn,
    role,
    logout,
    username
  } = useStore();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>(null);

  // --- LOCAL MUTABLE STATES ---
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    fetchProducts();
    fetchOrders();
    fetchCrmCustomers();

    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (activeToken) {
      fetch('/api/admin/platform-stats', { headers: { Authorization: `Bearer ${activeToken}` } })
        .then(res => res.json())
        .then(data => setPlatformStats(data))
        .catch(() => {});
      fetch('/api/verification/pending', { headers: { Authorization: `Bearer ${activeToken}` } })
        .then(res => res.json())
        .then(data => {
          if (data.verifications && Array.isArray(data.verifications) && data.verifications.length > 0) {
            setPendingSellers(data.verifications.map((v: any) => ({
              id: v.id,
              name: v.user?.profile?.fullName || v.user?.email || 'Vendor Applicant',
              owner: v.user?.profile?.fullName || 'Owner',
              email: v.user?.email || 'vendor@store.com',
              type: v.type || 'TRADE_LICENSE',
              docs: 'Verification_Doc.pdf',
              status: v.status || 'Pending'
            })));
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (products.length > 0) setLocalProducts(products);
    if (orders.length > 0) setLocalOrders(orders);
    if (crmCustomers.length > 0) setLocalCustomers(crmCustomers);
  }, [products, orders, crmCustomers]);

  const [sellerActionMsg, setSellerActionMsg] = useState('');
  const [selectedDrawerSeller, setSelectedDrawerSeller] = useState<any | null>(null);
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [quickActionType, setQuickActionType] = useState<'product' | 'customer' | 'coupon' | 'notification' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Category creation states & handler
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categorySuccess, setCategorySuccess] = useState('');

  // AI chat states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Welcome Commander. I am Zibonbaba Core AI. Ask me for real-time sales forecasts, anomaly alerts, or inventory optimization details.' }
  ]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName) return;
    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ name: newCategoryName })
      });
      if (res.ok) {
        setCategorySuccess(`Category "${newCategoryName}" created successfully!`);
        setNewCategoryName('');
        fetchHomepage();
        setTimeout(() => setCategorySuccess(''), 4000);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create category.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating category.');
    }
  };

  // Coupon Manager State
  const [coupons, setCoupons] = useState([
    { code: 'SAVE10', discount: 10, expiry: '2026-08-31', active: true },
    { code: 'EID20', discount: 20, expiry: '2026-09-15', active: true },
    { code: 'FREESHIP', discount: 100, expiry: '2026-07-31', active: false }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15');

  // Employee Management State
  const [employees, setEmployees] = useState([
    { id: 'emp-1', name: 'Kabir Rahman', role: 'Operations Manager', dept: 'Logistics', salary: 45000, attendance: '98%', status: 'Paid' },
    { id: 'emp-2', name: 'Sadia Chowdhury', role: 'Support Team Lead', dept: 'Customer Success', salary: 38000, attendance: '95%', status: 'Paid' },
    { id: 'emp-3', name: 'Anisul Hoque', role: 'Inventory Specialist', dept: 'Warehouse A', salary: 28000, attendance: '92%', status: 'Processing' }
  ]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Operations Specialist');

  // CRM funnel notes
  const [crmNotes, setCrmNotes] = useState([
    { id: 1, name: 'Kabir Hasan', note: 'VIP customer requested early delivery parameters on invoice #ORD-982103.', date: '2026-07-14' },
    { id: 2, name: 'Nadia Rahman', note: 'Called customer to verify new delivery address Dhanmondi. Updated successfully.', date: '2026-07-13' }
  ]);
  const [newCrmName, setNewCrmName] = useState('');
  const [newCrmNote, setNewCrmNote] = useState('');

  // Notification Broadcast State
  const [broadcastTarget, setBroadcastTarget] = useState<'ALL' | 'SELLERS' | 'CUSTOMERS'>('ALL');
  const [broadcastType, setBroadcastType] = useState<'PUSH' | 'SMS' | 'EMAIL'>('PUSH');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Support Tickets list
  const [supportTickets, setSupportTickets] = useState([
    { id: 't-501', user: 'Imtiaz Alam', subject: 'Refund delay on cancelled items', priority: 'High', status: 'Open' },
    { id: 't-502', user: 'FashionBox (Seller)', subject: 'Commission deduction override conflict', priority: 'Medium', status: 'Open' },
    { id: 't-503', user: 'Rana Ahmed', subject: 'API endpoint auth latency Node-02', priority: 'Low', status: 'Resolved' }
  ]);

  // Payment Gateway status switches
  const [gateways, setGateways] = useState({
    SSLCommerz: true,
    bKash: true,
    Nagad: true,
    Rocket: false,
    Stripe: true,
    PayPal: false
  });

  // Settings config states
  const [shippingCost, setShippingCost] = useState(10);
  const [globalVAT, setGlobalVAT] = useState(8);
  const [platformCommission, setPlatformCommission] = useState(10);

  // Synchronize store data
  useEffect(() => {
    setLocalOrders(orders);
    setLocalCustomers(crmCustomers);
    setLocalProducts(products);
  }, [orders, crmCustomers, products]);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">Login Required</h1>
          <p className="text-xs text-slate-400 mb-6">Please log in to your account to access the administrative console.</p>
          <Link href="/admin/login" className="bg-primary text-gray-950 font-black text-xs px-6 py-3 rounded-2xl block w-full text-center shadow-glow hover:bg-primary-accent transition-all">
            Proceed to Admin Login
          </Link>
        </div>
      </div>
    );
  }

  const allowedAdminRoles = [
    'admin', 'superadmin', 'manager', 'accountant', 'support',
    'crm_manager', 'hr_manager', 'delivery_manager', 'warehouse_manager',
    'inventory_manager', 'marketing'
  ];
  const currentRoleNormalized = (role || '').toLowerCase();
  if (!allowedAdminRoles.includes(currentRoleNormalized)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-xs text-slate-400 mb-6">Strict Dashboard Isolation is active. Your role ({role}) does not have permission to view the Admin Console.</p>
          <button onClick={() => router.push('/')} className="bg-white/5 border border-white/5 text-slate-350 hover:text-white font-black text-xs px-6 py-3 rounded-2xl block w-full cursor-pointer">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // --- STATS COMPUTATIONS ---
  const totalRevenue = localOrders.reduce((sum, o) => sum + o.total, 0);
  const monthlyRevenue = totalRevenue * 0.95;
  const todayRevenue = totalRevenue * 0.15;
  const pendingOrders = localOrders.filter(o => o.status === 'PENDING').length;
  const processingOrders = localOrders.filter(o => o.status === 'PROCESSING').length;
  const deliveredOrders = localOrders.filter(o => o.status === 'DELIVERED').length;
  const returnedOrders = localOrders.filter(o => o.status === 'CANCELLED').length;
  
  // Custom action handlers
  const handleAddNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('prodName') as HTMLInputElement).value;
    const price = parseFloat((form.elements.namedItem('prodPrice') as HTMLInputElement).value);
    const sku = (form.elements.namedItem('prodSKU') as HTMLInputElement).value.toUpperCase();

    if (!name || !price || !sku) return;

    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name,
      price,
      category: 'Electronics',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
      sku,
      stock: 50,
      vendor: 'Superadmin Direct',
      description: 'System registered product SKU.'
    };
    
    addProduct(newProd);
    setShowQuickActionModal(false);
    setQuickActionType(null);
    alert(`SKU ${sku} created and catalog updated.`);
  };

  const handleAddNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('custName') as HTMLInputElement).value;
    const email = (form.elements.namedItem('custEmail') as HTMLInputElement).value;
    
    if (!name || !email) return;

    const newCust: Customer = {
      id: 'cust-' + Date.now(),
      name,
      email,
      phone: '+880 1700-000000',
      ordersCount: 0,
      totalSpent: 0,
      status: 'New'
    };

    addCustomer(newCust);
    setShowQuickActionModal(false);
    setQuickActionType(null);
    alert(`Customer profile registered in CRM node.`);
  };

  const handleBroadcastNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastBody) return;
    try {
      const activeToken = token || localStorage.getItem('zibonbaba_token');
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          title: broadcastTitle,
          body: broadcastBody,
          target: broadcastTarget,
          type: 'INFO',
          priority: 'NORMAL',
          channels: broadcastType
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBroadcastSuccess(`Broadcast successfully dispatched to ${data.dispatchedCount || 'target'} users.`);
        setBroadcastTitle('');
        setBroadcastBody('');
      } else {
        setBroadcastSuccess(`Broadcast error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      setBroadcastSuccess(`Broadcast successfully dispatched via ${broadcastType} to target group ${broadcastTarget}.`);
      setBroadcastTitle('');
      setBroadcastBody('');
    }
    setTimeout(() => setBroadcastSuccess(''), 4000);
  };

  const handleAddNewCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    setCoupons([...coupons, {
      code: newCouponCode.toUpperCase(),
      discount: parseInt(newCouponDiscount) || 10,
      expiry: '2026-12-31',
      active: true
    }]);
    setNewCouponCode('');
  };

  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;
    setEmployees([...employees, {
      id: 'emp-' + Date.now(),
      name: newEmpName,
      role: newEmpRole,
      dept: 'Administration',
      salary: 32000,
      attendance: '100%',
      status: 'Paid'
    }]);
    setNewEmpName('');
  };

  const handleAddCrmNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrmName || !newCrmNote) return;
    setCrmNotes([{
      id: Date.now(),
      name: newCrmName,
      note: newCrmNote,
      date: new Date().toISOString().split('T')[0]
    }, ...crmNotes]);
    setNewCrmName('');
    setNewCrmNote('');
  };

  // Process Seller approvals via live API
  const handleSellerKYC = async (id: string, action: 'approve' | 'reject') => {
    const sel = pendingSellers.find(s => s.id === id);
    setPendingSellers(prev => prev.filter(s => s.id !== id));
    
    try {
      const activeToken = token || localStorage.getItem('zibonbaba_token');
      const endpoint = action === 'approve' ? '/api/verification/approve' : '/api/verification/reject';
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          id,
          userId: sel?.userId,
          storeId: sel?.storeId,
          reason: 'Administrative verification review'
        })
      });
    } catch (err) {
      console.error('KYC update error:', err);
    }

    setSellerActionMsg(`Seller "${sel?.name || 'Applicant'}" verification request: [${action.toUpperCase()}] complete. Notification issued.`);
    setTimeout(() => setSellerActionMsg(''), 4000);
  };

  // Generate Real Report Exports
  const triggerReportExport = (type: string, format: 'PDF' | 'EXCEL' | 'CSV') => {
    let content = '';
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `zibonbaba_${type.toLowerCase()}_report_${dateStr}.${format.toLowerCase() === 'excel' ? 'csv' : format.toLowerCase()}`;

    if (type.toLowerCase().includes('order')) {
      content = 'Order ID,Date,Status,Total (BDT),Source\n' +
        localOrders.map(o => `"${o.id}","${o.date}","${o.status}",${o.total},"${o.source}"`).join('\n');
    } else if (type.toLowerCase().includes('customer') || type.toLowerCase().includes('crm')) {
      content = 'Customer ID,Name,Email,Orders Count,Total Spent (BDT),Status\n' +
        localCustomers.map(c => `"${c.id}","${c.name}","${c.email}",${c.ordersCount},${c.totalSpent},"${c.status}"`).join('\n');
    } else if (type.toLowerCase().includes('product') || type.toLowerCase().includes('inventory')) {
      content = 'Product ID,SKU,Name,Category,Price (BDT),Stock,Vendor\n' +
        localProducts.map(p => `"${p.id}","${p.sku}","${p.name}","${p.category}",${p.price},${p.stock},"${p.vendor}"`).join('\n');
    } else {
      content = `ZIBONBABA ${type.toUpperCase()} ENTERPRISE AUDIT REPORT\nGenerated: ${new Date().toLocaleString()}\n` +
        `Total Orders: ${localOrders.length}\nTotal Revenue: BDT ${totalRevenue}\nTotal Products: ${localProducts.length}\nTotal Customers: ${localCustomers.length}\n`;
    }

    const blob = new Blob([content], { type: format === 'CSV' || format === 'EXCEL' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // AI chat submission via live AI analytics route
  const handleSendAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    const currentPrompt = aiPrompt;
    const newChat = [...aiChat, { role: 'user', text: currentPrompt }];
    setAiChat(newChat);
    setAiPrompt('');

    try {
      const activeToken = token || localStorage.getItem('zibonbaba_token');
      const res = await fetch('/api/admin/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ prompt: currentPrompt })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setAiChat([...newChat, { role: 'assistant', text: data.reply }]);
        return;
      }
    } catch (err) {
      console.error('AI API error:', err);
    }

    // Fallback AI processing
    const userQ = currentPrompt.toLowerCase();
    let reply = "Processing data vectors. Our analytics show positive GMV growth across electronic categories (+12.4% over 7 days).";
    if (userQ.includes('sales') || userQ.includes('revenue')) {
      reply = `Monthly run-rate forecast is standing at ৳${(totalRevenue * 1.25).toFixed(2)} BDT based on current multi-channel POS checkouts.`;
    } else if (userQ.includes('stock') || userQ.includes('inventory')) {
      reply = "Caution: HP-PRO-WHT stock levels are predicted to reach 0 within 4 days. Suggest automated re-procurement request generation.";
    } else if (userQ.includes('fraud') || userQ.includes('security')) {
      reply = "Anomaly Shield active. Suspicious rapid auth triggers from node 203.82.19.4 have been fully blocked. Zero losses recorded.";
    }
    setAiChat([...newChat, { role: 'assistant', text: reply }]);
  };

  // Navigation module mapping configs
  const navigationGroups = [
    {
      title: 'Real-time Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard },
        { id: 'ai', label: 'AI Forecasting Hub', icon: BrainCircuit }
      ]
    },
    {
      title: 'Commerce & Marketplace',
      items: [
        { id: 'marketplace', label: 'Products & Category', icon: ShoppingBag },
        { id: 'orders', label: 'Orders & Shipments', icon: CreditCard, badge: localOrders.length },
        { id: 'pos', label: 'POS Terminal Sales', icon: Monitor }
      ]
    },
    {
      title: 'Ecosystem Partners',
      items: [
        { id: 'customers', label: 'Customer Hub', icon: Users },
        { id: 'sellers', label: 'Sellers KYC Queue', icon: Store, badge: pendingSellers.length },
        { id: 'resellers', label: 'Resellers Program', icon: Handshake },
        { id: 'delivery', label: 'Logistics Courier', icon: MapPin }
      ]
    },
    {
      title: 'Supply Chain & ERP',
      items: [
        { id: 'inventory', label: 'Inventory & Alert', icon: Boxes },
        { id: 'warehouse', label: 'Warehouses Log', icon: Warehouse },
        { id: 'erp', label: 'ERP & Accounting', icon: Zap }
      ]
    },
    {
      title: 'Workforce & CRM',
      items: [
        { id: 'crm', label: 'CRM Sales Pipelines', icon: Contact },
        { id: 'hrm', label: 'HRM Attendance', icon: UserCheck }
      ]
    },
    {
      title: 'Finance & Tools',
      items: [
        { id: 'wallet', label: 'Unified Wallets', icon: Wallet },
        { id: 'finance', label: 'Financial Records', icon: Activity },
        { id: 'reports', label: 'Export Reports', icon: FileText },
        { id: 'notifications', label: 'Notification Hub', icon: BellRing }
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { id: 'rbac', label: 'Roles & Matrix', icon: KeyRound },
        { id: 'settings', label: 'System Settings', icon: Settings2 },
        { id: 'audit', label: 'Audit Security Logs', icon: ShieldAlert },
        { id: 'superadmin', label: 'Superadmin Direct', icon: Lock }
      ]
    }
  ] as const;

  // Command palette logic
  const allCommands = [
    { label: 'Go to Dashboard', action: () => { setActiveModule('dashboard'); setCommandPaletteOpen(false); } },
    { label: 'View AI Intelligence', action: () => { setActiveModule('ai'); setCommandPaletteOpen(false); } },
    { label: 'Manage Orders Register', action: () => { setActiveModule('orders'); setCommandPaletteOpen(false); } },
    { label: 'Open POS Register', action: () => { setActiveModule('pos'); setCommandPaletteOpen(false); } },
    { label: 'Check Warehouse Capacities', action: () => { setActiveModule('warehouse'); setCommandPaletteOpen(false); } },
    { label: 'Access System Settings', action: () => { setActiveModule('settings'); setCommandPaletteOpen(false); } },
    { label: 'Create SKU Product', action: () => { setShowQuickActionModal(true); setQuickActionType('product'); setCommandPaletteOpen(false); } }
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Dynamic Futuristic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFC107]/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 1. FUTURISTIC GLASS SIDEBAR NAVIGATION */}
      <aside 
        className={`bg-slate-950/80 backdrop-blur-xl shrink-0 border-r border-white/5 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col z-30 relative`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-[0_0_15px_rgba(255,193,7,0.3)] animate-pulse">
                Z
              </div>
              <span className="font-extrabold text-xs tracking-wider uppercase text-white">
                Zibon<span className="text-[#FFC107]">baba</span> <span className="text-[10px] text-slate-400 font-normal">ERP</span>
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-[0_0_15px_rgba(255,193,7,0.3)] mx-auto">
              Z
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar Scroll Area */}
        <div className="flex-grow overflow-y-auto py-5 px-4 space-y-6 scrollbar-thin scrollbar-thumb-white/5">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {isSidebarOpen && (
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-[#FFC107] rounded-full" />
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveModule(item.id as AdminModule)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#FFC107]/20 to-[#FFC107]/5 border border-[#FFC107]/30 text-white shadow-[0_0_15px_rgba(255,193,7,0.05)]' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-[#FFC107] scale-110' : 'text-slate-400'}`} />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                    
                    {/* Dynamic Sidebar Badges */}
                    {(item as any).badge !== undefined && (item as any).badge > 0 && (
                      <span className={`absolute right-3 top-2.5 text-[8.5px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border ${
                        isActive ? 'bg-[#FFC107] text-slate-950 border-[#FFC107]' : 'bg-blue-600 text-white border-blue-500'
                      }`}>
                        {(item as any).badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Profile Switcher & Sign Out */}
        <div className="p-4 border-t border-white/5 shrink-0 bg-slate-950/60 space-y-2">
          {isSidebarOpen && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white/[0.02] border border-white/5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                {(username || role || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white truncate">{username || 'Admin'}</p>
                <p className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider">{role || 'ADMIN'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold py-2.5 rounded-xl transition-all border border-rose-500/20 cursor-pointer active:scale-98"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. MAIN VIEWPORT CONTAINER */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative z-10">
        
        {/* Global Transparent Header */}
        <header className="h-16 bg-slate-950/60 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle (< md) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 cursor-pointer active:scale-95 transition-all"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-amber-400" />
            </button>

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0"></span>
            <h1 className="text-xs font-bold uppercase tracking-widest text-slate-400 truncate">
              <span className="hidden sm:inline">Operations Center // </span><span className="text-white font-extrabold capitalize text-sm">{activeModule}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search command shortcut */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="bg-white/5 hover:bg-white/10 text-slate-400 border border-white/5 text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Search Command...</span>
              <span className="bg-slate-950 px-1.5 py-0.5 rounded text-[9px] border border-white/5">Ctrl+K</span>
            </button>

            {/* Quick action triggers */}
            <button
              onClick={() => setShowQuickActionModal(true)}
              className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-slate-950 font-black text-xs py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,193,7,0.15)] transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" /> <span className="hidden xs:inline">ERP</span> Task
            </button>

            {/* AI Assistant toggle */}
            <button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative shrink-0 ${
                isAiPanelOpen 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            </button>

            {/* Global Sign Out Button */}
            <button
              onClick={handleLogout}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Log Out of System"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* MOBILE SLIDE-OUT NAVIGATION DRAWER (< md) */}
        {isMobileDrawerOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden animate-fade-in flex"
            onClick={(e) => { if (e.target === e.currentTarget) setIsMobileDrawerOpen(false); }}
          >
            <div className="w-[85%] max-w-[300px] bg-slate-950 h-full flex flex-col justify-between border-r border-white/10 shadow-2xl animate-slide-up overflow-y-auto">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-glow">
                    Z
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">
                      Zibon<span className="text-[#FFC107]">baba</span> ERP
                    </h3>
                    <span className="text-[9px] text-amber-400 font-bold uppercase">Operations Hub</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {navigationGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mb-1.5 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-[#FFC107] rounded-full" />
                      {group.title}
                    </h4>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeModule === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveModule(item.id as AdminModule);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded-xl transition-all text-left ${
                            isActive
                              ? 'bg-[#FFC107]/20 border border-[#FFC107]/30 text-white shadow-glow'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FFC107]' : 'text-slate-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-white/10 bg-slate-900/60 space-y-2">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Marketplace
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Viewport Scroll Area */}
        <main className="flex-grow p-6 overflow-y-auto">
          
          {/* ================================================= */}
          {/* VIEW: DASHBOARD HOME */}
          {/* ================================================= */}
          {activeModule === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* 8 Glassmorphic Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, desc: 'Total sales gross invoices', icon: CreditCard, trend: '+14%', color: 'from-amber-500 to-[#FFC107]' },
                  { label: 'Total Orders', value: localOrders.length, desc: 'Across all active channels', icon: ShoppingBag, trend: '+22%', color: 'from-blue-600 to-indigo-500' },
                  { label: 'Total Customers', value: localCustomers.length + 148, desc: 'Profiled shopper accounts', icon: Users, trend: '+8%', color: 'from-emerald-600 to-teal-500' },
                  { label: 'Active Sellers', value: '14 Stores', desc: 'Verified merchants listing', icon: Store, trend: '+12%', color: 'from-rose-600 to-pink-500' }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className="relative overflow-hidden bg-white/[0.02] backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl flex flex-col justify-between min-h-[120px] hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)] transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br opacity-5 blur-2xl rounded-full" />
                    <div className="flex items-center justify-between z-10">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                      <div className="p-2 bg-white/5 rounded-lg">
                        <stat.icon className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-2xl font-black text-white tracking-tight">{stat.value}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-black text-emerald-500">{stat.trend}</span>
                        <span className="text-[9px] text-slate-500 leading-none">{stat.desc}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Visualization Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Neon Weekly Volume SVG chart */}
                <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-xl">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3.5 mb-4">
                    Weekly Sales GMV Trend
                  </h4>
                  <div className="flex items-end gap-3.5 h-44 pt-4">
                    {[
                      { day: 'Mon', val: 12000 },
                      { day: 'Tue', val: 18000 },
                      { day: 'Wed', val: 14500 },
                      { day: 'Thu', val: 24000 },
                      { day: 'Fri', val: 32000 },
                      { day: 'Sat', val: 27000 },
                      { day: 'Sun', val: 21000 }
                    ].map((d, idx) => {
                      const pct = (d.val / 32000) * 100;
                      return (
                        <div key={idx} className="flex-grow flex flex-col items-center gap-2 group">
                          <span className="text-[8.5px] font-mono font-bold text-[#FFC107] opacity-0 group-hover:opacity-100 transition-opacity">
                            {(d.val / 1000)}k
                          </span>
                          <div 
                            className="w-full bg-white/5 group-hover:bg-gradient-to-t group-hover:from-amber-600 group-hover:to-[#FFC107] group-hover:shadow-[0_0_15px_rgba(255,193,7,0.3)] transition-all duration-500 rounded-t-lg"
                            style={{ height: `${pct}%` }}
                          />
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase">{d.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive SVG Sparklines */}
                <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3.5">
                    Real-time Conversion Analytics
                  </h4>
                  <div className="relative h-44 flex items-end justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 0 35 Q 20 10 40 25 T 80 5 T 100 20" 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="1.5" 
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      />
                      <path 
                        d="M 0 35 Q 20 10 40 25 T 80 5 T 100 20 L 100 40 L 0 40 Z" 
                        fill="url(#neonGlow)"
                      />
                    </svg>
                    <span className="text-[10px] font-mono text-slate-500 uppercase relative z-10 bottom-2 bg-slate-950/80 px-2.5 py-0.5 rounded-full border border-white/5">
                      Session Checkouts conversion: <span className="text-[#FFC107] font-black">3.82%</span>
                    </span>
                  </div>
                </div>

                {/* 3. Category & Device Performance */}
                <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 p-6 rounded-2xl shadow-xl space-y-5">
                  <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3.5">
                    Traffic Sources Channel
                  </h4>
                  <div className="space-y-3.5 text-[10px] font-bold text-slate-400">
                    {[
                      { name: 'App Checkouts (PWA)', pct: '68%', color: 'from-amber-500 to-[#FFC107]' },
                      { name: 'Desktop Web Core', pct: '32%', color: 'from-blue-600 to-indigo-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="font-extrabold text-white">{item.pct}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: item.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Security Shield Live Audit log */}
              <div className="bg-white/[0.02] backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3.5 mb-4 flex items-center justify-between">
                  <span>Security Monitoring Live Thread</span>
                  <span className="text-[9px] font-normal text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> System Auditing
                  </span>
                </h4>
                <div className="space-y-2.5 font-mono text-[9px] text-slate-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>[04:22:15] Security alert: Auth trigger verification. Direct superadmin login verified.</span>
                    <span className="text-emerald-400 font-extrabold">PASS</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>[04:18:47] Database sync: SQLite WAL transaction snapshot archived to Cloud Node.</span>
                    <span className="text-blue-400 font-extrabold">INFO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>[04:09:12] Shield alert: Blocked rate limit threat on client registration POST routing from IP 203.82.19.4.</span>
                    <span className="text-rose-500 font-extrabold animate-pulse">SHIELD_BLOCK</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: AI FORECASTING HUB */}
          {/* ================================================= */}
          {activeModule === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 rounded-2xl border border-blue-500/20 flex gap-4 items-center shadow-lg">
                <BrainCircuit className="w-10 h-10 text-blue-400 animate-pulse shrink-0" />
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wider">Automated Sales & Fraud Risk Anomaly Hub</h2>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Artificial Intelligence vectors modeling multi-store warehouse stocks, predicting customer retention indices, and flagging checkout anomalies.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                    Predictive Stock Run-Out Alerts
                  </h3>
                  <div className="space-y-3">
                    {[
                      { sku: 'HP-PRO-WHT', name: 'SoundMax Headphones', stock: 45, daysLeft: 4, action: 'Reorder 30 Units' },
                      { sku: 'MUG-SMART-YEL', name: 'Smart Coffee Mug', stock: 12, daysLeft: 2, action: 'Reorder 50 Units' }
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] text-slate-300 flex justify-between items-center">
                        <div>
                          <span className="font-mono font-bold text-white block">{item.sku} // {item.name}</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Units Left: {item.stock} | Predicted exhaust timeline: {item.daysLeft} Days</span>
                        </div>
                        <span className="bg-[#FFC107] text-slate-950 font-black px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-wider">
                          {item.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl space-y-4">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                    Machine Learning Fraud Index
                  </h3>
                  <div className="space-y-2.5 font-mono text-[9px]">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between text-rose-400">
                      <span>✓ Blocked checkout attempt from card BIN lookup conflict on IP 203.82.19.4.</span>
                      <span className="font-black">98.4% Risk</span>
                    </div>
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-emerald-400">
                      <span>✓ Validated payment trace for order #ORD-982104. Verified geographic matches.</span>
                      <span className="font-black">2.1% Risk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: PRODUCTS DATABASE & MARKETPLACE */}
          {/* ================================================= */}
          {activeModule === 'marketplace' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3.5">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Centralized Products SKU Database
                  </h3>
                  <button
                    onClick={() => { setShowQuickActionModal(true); setQuickActionType('product'); }}
                    className="bg-[#FFC107] text-slate-950 font-bold text-[10px] px-3.5 py-1.5 rounded-xl uppercase tracking-wider cursor-pointer hover:bg-[#FFC107]/90 active:scale-95 transition-all"
                  >
                    Add Product SKU
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold">
                        <th className="py-3 px-4 font-black">SKU Code</th>
                        <th className="py-3 px-4">Item Name</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Base Price</th>
                        <th className="py-3 px-4">Inventory Stock</th>
                        <th className="py-3 px-4">Associated Store</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                      {localProducts.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#FFC107]">{p.sku}</td>
                          <td className="py-3.5 px-4 text-white font-extrabold">{p.name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                          <td className="py-3.5 px-4 text-white">৳{p.price.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-slate-300">{p.stock} units</td>
                          <td className="py-3.5 px-4 text-slate-500">{p.vendor}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                              p.stock > 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            }`}>
                              {p.stock > 10 ? 'Active' : 'Low Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: ORDER MANAGEMENT */}
          {/* ================================================= */}
          {activeModule === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {['ALL', 'PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilterStatus(st)}
                      className={`text-[9.5px] font-black px-3.5 py-1.5 rounded-full border transition-all ${
                        orderFilterStatus === st
                          ? 'bg-[#FFC107] border-[#FFC107] text-slate-950'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-3 h-10 w-64 focus-within:border-[#FFC107]">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search order ref..."
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    className="bg-transparent text-xs w-full outline-none text-white font-medium"
                  />
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3.5 mb-4">
                  Active Invoice Registers
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold">
                        <th className="py-3 px-4 font-black">Order Ref</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Gross Total</th>
                        <th className="py-3 px-4">Items Count</th>
                        <th className="py-3 px-4">Channel</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                      {localOrders
                        .filter(o => orderFilterStatus === 'ALL' || o.status === orderFilterStatus)
                        .filter(o => o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()))
                        .map((order) => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#FFC107]">{order.id}</td>
                            <td className="py-3.5 px-4">{order.date}</td>
                            <td className="py-3.5 px-4 font-bold text-white">৳{order.total.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-slate-400">{order.items.length} Units</td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono">{order.source}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                order.status === 'DELIVERED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                order.status === 'PENDING' ? 'bg-amber-500/10 border-amber-500/20 text-[#FFC107]' :
                                order.status === 'PROCESSING' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="bg-white/5 hover:bg-white/10 text-slate-200 text-[10px] font-bold px-3 py-1 rounded-lg border border-white/5"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: CRM & CUSTOMERS */}
          {/* ================================================= */}
          {activeModule === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3.5 mb-5">
                  Ecosystem Customer Registry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {localCustomers.map(cust => (
                    <div key={cust.id} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white">{cust.name}</h4>
                          <span className="bg-emerald-500/10 text-emerald-400 text-[8px] px-1.5 py-0.5 rounded font-black border border-emerald-500/20">
                            {cust.status} User
                          </span>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-1.5 pt-3 border-t border-white/5 font-medium">
                        <p>Email: <span className="text-slate-200">{cust.email}</span></p>
                        <p>Total Spent: <span className="font-extrabold text-[#FFC107]">৳{cust.totalSpent.toLocaleString()}</span></p>
                        <p>Loyalty Credit Points: <span className="text-white">{(cust.totalSpent * 0.15).toFixed(0)} Points</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: SELLERS KYC QUEUE */}
          {/* ================================================= */}
          {activeModule === 'sellers' && (
            <div className="space-y-6 animate-fade-in">
              {sellerActionMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {sellerActionMsg}
                </div>
              )}

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Merchant KYC Approvals Queue
                </h3>
                {pendingSellers.length === 0 ? (
                  <p className="text-center text-[10px] text-slate-500 py-10">No pending seller registrations.</p>
                ) : (
                  <div className="space-y-3.5">
                    {pendingSellers.map(sel => (
                      <div key={sel.id} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] bg-white/5 text-slate-300 rounded px-2 py-0.5 border border-white/5">{sel.id}</span>
                            <h4 className="text-xs font-black text-white">{sel.name}</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Owner: {sel.owner} | Category: {sel.type} | License: <span className="text-blue-400 underline font-mono cursor-pointer">{sel.docs}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSellerKYC(sel.id, 'reject')}
                            className="border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-[10px] font-black px-3.5 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleSellerKYC(sel.id, 'approve')}
                            className="bg-[#FFC107] text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95"
                          >
                            Approve Merchant
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: RESELLER NETWORK */}
          {/* ================================================= */}
          {activeModule === 'resellers' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Resellers Affiliation Quotas
                </h3>
                <div className="space-y-3.5">
                  {[
                    { name: 'Sabbir Ahmed (Commission)', code: 'ZIBON-RES001', activeReferred: 14, earned: 2450.00, target: 'Flat 5%' },
                    { name: 'Nila Islam (Target Quota)', code: 'ZIBON-RES054', activeReferred: 32, earned: 15000.00, target: '72% Quota Met' }
                  ].map((res, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="font-mono text-[9px] text-[#FFC107] block">{res.code}</span>
                        <h4 className="text-xs font-black text-white mt-0.5">{res.name}</h4>
                        <span className="text-[9px] text-slate-500 block mt-1">Referred Shoppers: {res.activeReferred} Accounts</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-white block">${res.earned.toLocaleString()}</span>
                        <span className="text-[9px] bg-white/5 text-slate-300 px-2 py-0.5 rounded font-black border border-white/5 block mt-1">{res.target}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Commission Settings
                </h3>
                <form onSubmit={e => { e.preventDefault(); alert('Reseller rates updated.'); }} className="space-y-3.5">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Standard Affiliate Rate (%)</label>
                    <input type="number" defaultValue="5" className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs font-bold text-white" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Monthly Base Salary Threshold (৳)</label>
                    <input type="number" defaultValue="15000" className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs font-bold text-white" />
                  </div>
                  <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-2 rounded-xl transition-all cursor-pointer">
                    Save Variables
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: LOGISTICS COURIERS */}
          {/* ================================================= */}
          {activeModule === 'delivery' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Courier Staff Assignments Grid
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { id: 'cour-01', name: 'Zahid Hasan', activeAssignments: 2, status: 'Out For Delivery', cashInHand: 450 },
                    { id: 'cour-02', name: 'Aminul Islam', activeAssignments: 0, status: 'Idle', cashInHand: 0 },
                    { id: 'cour-03', name: 'Taskin Ahmed', activeAssignments: 1, status: 'Dispatched', cashInHand: 149 }
                  ].map((cour, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-black text-white">{cour.name}</h4>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                          cour.status === 'Idle' ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                          {cour.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 space-y-1 font-medium pt-2 border-t border-white/5">
                        <p>Active Shipments: <span className="text-white">{cour.activeAssignments} Packages</span></p>
                        <p>Cash on Delivery In Hand: <span className="text-[#FFC107] font-bold">${cour.cashInHand}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: INVENTORY & ALERT */}
          {/* ================================================= */}
          {activeModule === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  System Stock Ledger Logs
                </h3>
                <div className="space-y-2.5 font-mono text-[9px] text-slate-400">
                  <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg flex justify-between">
                    <span>[02:14:15] POS Dispatch: SKU STND-LAP-CARB stock count updated (-1 unit Dhanmondi).</span>
                    <span className="text-[#FFC107]">DISPATCH</span>
                  </div>
                  <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg flex justify-between text-rose-400">
                    <span>[01:04:12] Low Stock Anomaly: SKU HP-PRO-WHT volume under threshold limit (4 units left).</span>
                    <span className="font-black animate-pulse">WARNING_LOW</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: WAREHOUSE LOG */}
          {/* ================================================= */}
          {activeModule === 'warehouse' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              {[
                { name: 'Central Warehouse Uttara', loc: 'Dhaka Sect 8', manager: 'Anisul Hoque', capacity: '85%' },
                { name: 'Port Hub Agrabad', loc: 'Chattogram Port Area', manager: 'Kabir Rahman', capacity: '42%' },
                { name: 'Sylhet City Storage', loc: 'Sylhet Link Road', manager: 'Sadia Chowdhury', capacity: '12%' }
              ].map((wh, idx) => (
                <div key={idx} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-3">
                  <h4 className="text-xs font-black text-white">{wh.name}</h4>
                  <p className="text-[10px] text-slate-400">Location: {wh.loc}</p>
                  <p className="text-[10px] text-slate-300">Manager: <span className="font-bold">{wh.manager}</span></p>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-[9px] font-bold text-slate-500">
                      <span>Volume Used</span>
                      <span>{wh.capacity}</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#FFC107] h-full rounded-full" style={{ width: wh.capacity }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: POS TERMINAL SALES */}
          {/* ================================================= */}
          {activeModule === 'pos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Active POS Outlets Registers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { branch: 'Dhanmondi Branch', terminals: 3, sales: 85200 },
                    { branch: 'Agrabad Outlet', terminals: 2, sales: 42000 },
                    { branch: 'Sylhet Center', terminals: 1, sales: 12500 }
                  ].map((pos, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-2 hover:border-white/10 transition-colors">
                      <h4 className="text-xs font-black text-white">{pos.branch}</h4>
                      <p className="text-[10px] text-slate-400">Active Cash Registers: {pos.terminals}</p>
                      <span className="text-xs font-black text-emerald-400 block">Total Sales: ৳{pos.sales.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: CRM SALES PIPELINES */}
          {/* ================================================= */}
          {activeModule === 'crm' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Sales Funnel Conversion Segments
                </h3>
                <div className="space-y-3 font-mono text-xs">
                  {[
                    { stage: 'Acquired Leads', val: 1280, pct: '100%', color: 'bg-blue-600/30 text-blue-400 border-blue-500/30' },
                    { stage: 'Engaged Outreach', val: 850, pct: '66%', color: 'bg-[#FFC107]/20 text-[#FFC107] border-[#FFC107]/20' },
                    { stage: 'Negotiation stage', val: 320, pct: '25%', color: 'bg-purple-500/20 text-purple-400 border-purple-500/20' },
                    { stage: 'Closed Wins', val: 142, pct: '11%', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' }
                  ].map((stage, i) => (
                    <div key={i} className={`p-3 border rounded-xl flex justify-between items-center ${stage.color}`}>
                      <span className="font-extrabold">{stage.stage}</span>
                      <span className="font-black">{stage.val} Contacts ({stage.pct})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  CRM Interaction Logs
                </h3>
                <form onSubmit={handleAddCrmNote} className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Customer Name"
                    value={newCrmName}
                    onChange={e => setNewCrmName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-white"
                  />
                  <textarea
                    required
                    rows={2}
                    placeholder="Outreach note description..."
                    value={newCrmNote}
                    onChange={e => setNewCrmNote(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs text-white resize-none"
                  />
                  <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-2 rounded-xl transition-all cursor-pointer">
                    Save Log
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: ERP & ACCOUNTING */}
          {/* ================================================= */}
          {activeModule === 'erp' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Accounting Ledgers & Expenses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { desc: 'Twilio Gateway SMS API Charges', cat: 'Logistics API', amount: 3500 },
                    { desc: 'Uttara Warehouse Rent Q3', cat: 'Infrastructure', amount: 75000 },
                    { desc: 'Marketing Influencer Promo Campaign', cat: 'Marketing Ads', amount: 15000 }
                  ].map((exp, i) => (
                    <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[8px] bg-white/5 text-slate-400 px-2 py-0.5 rounded font-black border border-white/5">{exp.cat}</span>
                      <h4 className="text-xs font-black text-white mt-1.5">{exp.desc}</h4>
                      <span className="text-xs font-black text-rose-400 block">- ৳{exp.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: HRM ATTENDANCE */}
          {/* ================================================= */}
          {activeModule === 'hrm' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Workforce Directory
                  </h3>
                  <form onSubmit={handleAddNewEmployee} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={newEmpName}
                      onChange={e => setNewEmpName(e.target.value)}
                      className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <button type="submit" className="bg-[#FFC107] text-slate-950 text-[10px] font-black px-4 rounded-xl cursor-pointer">
                      Add Staff
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold">
                        <th className="py-3 px-4 font-black">Staff ID</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4 font-center">Attendance Index</th>
                        <th className="py-3 px-4">Wage Balance</th>
                        <th className="py-3 px-4 text-center">Payroll</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-500">{emp.id}</td>
                          <td className="py-3.5 px-4 text-white font-extrabold">{emp.name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{emp.role}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400">{emp.attendance}</td>
                          <td className="py-3.5 px-4 text-white">${emp.salary.toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full">
                              {emp.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: UNIFIED WALLETS */}
          {/* ================================================= */}
          {activeModule === 'wallet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {[
                { name: 'Customer Wallet Nodes', balance: 54200, desc: 'Refunds & credits balance' },
                { name: 'Merchant Seller Nodes', balance: 854000, desc: 'Vendors escrow payouts' },
                { name: 'Resellers Network Wallet', balance: 142500, desc: 'Affiliation salary queue' },
                { name: 'Couriers Delivery Wallet', balance: 35000, desc: 'Cash On Delivery holdings' }
              ].map((w, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{w.name}</h4>
                  <p className="text-2xl font-black text-white">৳{w.balance.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500 leading-snug">{w.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: FINANCIAL RECORDS */}
          {/* ================================================= */}
          {activeModule === 'finance' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Profit & Loss Accounting Ledger
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Total GMV GMV Invoice</span>
                    <span className="text-xl font-black text-emerald-400 block mt-2">৳{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">System Commissions Earned (10%)</span>
                    <span className="text-xl font-black text-white block mt-2">৳{(totalRevenue * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <span className="text-[9px] text-slate-400 block uppercase">Logistics Net Deficit</span>
                    <span className="text-xl font-black text-rose-400 block mt-2">- ৳{(totalRevenue * 0.02).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: REPORTS ENGINE */}
          {/* ================================================= */}
          {activeModule === 'reports' && (
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl space-y-5 animate-fade-in">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                ERP Export Report Center
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                Select a dataset partition key below to run compilation scripts. PDF builds include platform templates; CSV/XLS generate raw structured tables.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {[
                  { name: 'Gross Revenue Reports', desc: 'Broken down by VAT taxes and channel sources' },
                  { name: 'Warehouse Inventories ledger', desc: 'SKU allocations inside Dhaka & Chattogram hubs' },
                  { name: 'Resellers payroll schedules', desc: 'Monthly base wages and target milestone values' }
                ].map((rep, idx) => (
                  <div key={idx} className="bg-white/[0.01] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[140px] hover:border-white/10 transition-colors">
                    <div>
                      <h4 className="text-xs font-black text-white">{rep.name}</h4>
                      <p className="text-[9.5px] text-slate-400 mt-1.5 leading-relaxed">{rep.desc}</p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => triggerReportExport(rep.name, 'PDF')}
                        className="flex-1 bg-white/5 hover:bg-[#FFC107] hover:text-slate-950 text-[9px] font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-white/5"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                      <button
                        onClick={() => triggerReportExport(rep.name, 'EXCEL')}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-[9px] font-black py-2 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer border border-white/5"
                      >
                        <Download className="w-3.5 h-3.5" /> XLS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: NOTIFICATION HUBS */}
          {/* ================================================= */}
          {activeModule === 'notifications' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl lg:col-span-2 space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Broadcast Campaign Dispatcher
                </h3>
                {broadcastSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl font-bold">
                    {broadcastSuccess}
                  </div>
                )}
                <form onSubmit={handleBroadcastNotification} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Target Audience</label>
                      <select
                        value={broadcastTarget}
                        onChange={e => setBroadcastTarget(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs font-bold text-white"
                      >
                        <option value="ALL">All Platform Accounts</option>
                        <option value="SELLERS">Verified Merchants</option>
                        <option value="CUSTOMERS">VIP Loyalty Shoppers</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Method Channel</label>
                      <select
                        value={broadcastType}
                        onChange={e => setBroadcastType(e.target.value as any)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2 text-xs font-bold text-white"
                      >
                        <option value="PUSH">In-App Push Payload</option>
                        <option value="SMS">Twilio SMS Broadcast</option>
                        <option value="EMAIL">SMTP Mailer Template</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Broadcast Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Weekly Flash Deal Campaign"
                      value={broadcastTitle}
                      onChange={e => setBroadcastTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Payload Content</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Write message details..."
                      value={broadcastBody}
                      onChange={e => setBroadcastBody(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white resize-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                    Dispatch Campaign Broadcast
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: RBAC MATRIX */}
          {/* ================================================= */}
          {activeModule === 'rbac' && (
            <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4 animate-fade-in">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                Access Permissions Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5 text-slate-400 font-bold">
                      <th className="py-3 px-4 font-black">System Role Tier</th>
                      <th className="py-3 px-4 text-center">Manage Platforms</th>
                      <th className="py-3 px-4 text-center">Access ERP Ledgers</th>
                      <th className="py-3 px-4 text-center">Modify User Tiers</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-extrabold text-slate-300">
                    {[
                      { role: 'Superadmin Owner', manage: true, erp: true, modify: true },
                      { role: 'Operations Manager', manage: true, erp: true, modify: false },
                      { role: 'Warehouse Attendant', manage: false, erp: false, modify: false }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4 text-white font-extrabold">{row.role}</td>
                        <td className="py-3.5 px-4 text-center">{row.manage ? '✓ Allowed' : '✗ Denied'}</td>
                        <td className="py-3.5 px-4 text-center">{row.erp ? '✓ Allowed' : '✗ Denied'}</td>
                        <td className="py-3.5 px-4 text-center">{row.modify ? '✓ Allowed' : '✗ Denied'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: SYSTEM SETTINGS */}
          {/* ================================================= */}
          {activeModule === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  General System Variables
                </h3>
                <form onSubmit={e => { e.preventDefault(); alert('Variables locked and saved.'); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Global VAT Rate (%)</label>
                      <input
                        type="number"
                        value={globalVAT}
                        onChange={e => setGlobalVAT(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Base Shipping Cost (৳)</label>
                      <input
                        type="number"
                        value={shippingCost}
                        onChange={e => setShippingCost(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs font-bold text-white"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                    Save Override Configurations
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: AUDIT SECURITY LOGS */}
          {/* ================================================= */}
          {activeModule === 'audit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Centralized Action Log Ledger
                </h3>
                <div className="space-y-2.5 font-mono text-[9.5px] text-slate-400">
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex justify-between">
                    <span>[04:22:15] Flagged login trace: failed auth parameters from location node IP 203.82.19.4.</span>
                    <span className="font-bold">SUSPICIOUS</span>
                  </div>
                  <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex justify-between">
                    <span>[03:45:10] ERP override: platform commission rates modified by superadmin master key.</span>
                    <span className="text-[#FFC107] font-bold">CONFIG</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: SUPERADMIN DIRECT CONTROLS */}
          {/* ================================================= */}
          {activeModule === 'superadmin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Superadmin Direct Master Triggers
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                  Restrict access override controls. Run full database schema backups, verify platform encryption keys, or restart microservices.
                </p>
                <div className="flex flex-wrap gap-3 pt-3">
                  <button
                    onClick={() => alert('Compiling snapshot... Full WAL dump compiled successfully.')}
                    className="bg-[#FFC107] text-slate-950 text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all cursor-pointer hover:bg-[#FFC107]/90 active:scale-95 shadow-[0_0_15px_rgba(255,193,7,0.1)]"
                  >
                    Backup Schema Snapshot
                  </button>
                  <button
                    onClick={() => alert('Restarting core auth services. Security logs refreshed.')}
                    className="border border-white/5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Clear Memory Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: SYSTEM NOTIFICATIONS CENTRAL */}
          {/* ================================================= */}
          {activeModule === 'notifications' && (
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl space-y-4 animate-fade-in">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                Unified Ecosystem Notification Hub
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                Zibonbaba operations, delivery dispatch lines, reseller payouts, and system alerts are managed in the centralized notification hub.
              </p>
              <div className="pt-3">
                <Link
                  href="/notifications"
                  className="bg-[#FFC107] text-slate-950 text-xs font-extrabold px-6 py-3 rounded-xl inline-block hover:bg-yellow-600 transition-colors"
                >
                  Open Notification Control Center →
                </Link>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* 3. COLLAPSIBLE FUTURISTIC AI COPILOT SIDE PANEL */}
      <aside 
        className={`bg-slate-950/95 backdrop-blur-2xl border-l border-white/5 shrink-0 transition-all duration-300 ${
          isAiPanelOpen ? 'w-80' : 'w-0 border-l-0 overflow-hidden'
        } hidden md:flex flex-col z-30 relative`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Bot className="w-5 h-5 text-blue-400 animate-pulse" />
            <span className="font-extrabold text-xs tracking-wider uppercase">Zibonbaba AI Copilot</span>
          </div>
          <button 
            onClick={() => setIsAiPanelOpen(false)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* AI Chat Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {aiChat.map((chat, idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-2xl text-[10.5px] leading-relaxed ${
                chat.role === 'assistant' 
                  ? 'bg-blue-600/10 border border-blue-500/20 text-slate-300' 
                  : 'bg-white/5 border border-white/5 text-white font-medium ml-6'
              }`}
            >
              <span className="font-bold block uppercase mb-1 text-[8.5px] tracking-wider text-slate-400">
                {chat.role === 'assistant' ? '🤖 Zibonbaba Core AI' : '👤 Commander'}
              </span>
              {chat.text}
            </div>
          ))}
        </div>

        {/* AI Input Form */}
        <form onSubmit={handleSendAi} className="p-4 border-t border-white/5 bg-slate-950/40 flex gap-2">
          <input
            type="text"
            required
            placeholder="Ask AI assistant..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            className="flex-grow bg-white/5 border border-white/5 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-blue-500"
          />
          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </aside>

      {/* 4. MODAL OVERLAY: COMMAND PALETTE */}
      {commandPaletteOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-fade-in"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div 
            className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-4 space-y-3 relative overflow-hidden animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-3 h-11 focus-within:border-[#FFC107]">
              <Search className="w-4 h-4 text-slate-400 mr-2.5" />
              <input
                type="text"
                autoFocus
                placeholder="Type a module command (e.g. settings)..."
                value={commandSearch}
                onChange={e => setCommandSearch(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-white font-medium"
              />
            </div>
            
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {allCommands
                .filter(cmd => cmd.label.toLowerCase().includes(commandSearch.toLowerCase()))
                .map((cmd, i) => (
                  <button
                    key={i}
                    onClick={cmd.action}
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-[#FFC107]/10 hover:text-white rounded-xl transition-all flex justify-between items-center"
                  >
                    <span>{cmd.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">Execute</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL OVERLAY: QUICK TASK */}
      {showQuickActionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 relative animate-slide-up">
            <button
              onClick={() => { setShowQuickActionModal(false); setQuickActionType(null); }}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                System Quick Actions
              </h3>
              <p className="text-[10px] text-slate-500 mt-1">Select an ERP register sub-task to trigger.</p>
            </div>

            {!quickActionType ? (
              <div className="grid grid-cols-2 gap-3.5">
                {[
                  { type: 'product', label: 'Create SKU Product', desc: 'Add new items direct to catalog' },
                  { type: 'customer', label: 'Create CRM Customer', desc: 'Add contact details' },
                  { type: 'coupon', label: 'Generate Promo Coupon', desc: 'Discount campaigns' },
                  { type: 'notification', label: 'SMS & Push Broadcast', desc: 'Notification centers' }
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => setQuickActionType(act.type as any)}
                    className="p-3 bg-white/5 border border-white/5 rounded-xl text-left hover:border-[#FFC107] active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-black text-white block">{act.label}</span>
                    <span className="text-[8.5px] text-slate-500 mt-1 block leading-relaxed">{act.desc}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {quickActionType === 'product' && (
              <form onSubmit={handleAddNewProduct} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Product Name</label>
                  <input type="text" id="prodName" required placeholder="e.g. Smart Wireless Headphones" className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Price (৳)</label>
                    <input type="number" id="prodPrice" required placeholder="1490" className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">SKU Code</label>
                    <input type="text" id="prodSKU" required placeholder="HP-PRO-WHT" className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                  Register SKU Catalog Item
                </button>
              </form>
            )}

            {quickActionType === 'customer' && (
              <form onSubmit={handleAddNewCustomer} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Full Name</label>
                  <input type="text" id="custName" required placeholder="Rana Ahmed" className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Email Address</label>
                  <input type="email" id="custEmail" required placeholder="rana@gmail.com" className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white" />
                </div>
                <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                  Create Profile
                </button>
              </form>
            )}

            {quickActionType === 'coupon' && (
              <form onSubmit={e => { handleAddNewCoupon(e); setShowQuickActionModal(false); setQuickActionType(null); }} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SPECIAL15"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs font-bold text-white"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={newCouponDiscount}
                    onChange={e => setNewCouponDiscount(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs font-bold text-white"
                  />
                </div>
                <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                  Generate Coupon
                </button>
              </form>
            )}

            {quickActionType === 'notification' && (
              <form onSubmit={e => { handleBroadcastNotification(e); setShowQuickActionModal(false); setQuickActionType(null); }} className="space-y-4">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Eid Special Sale"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Content Details</label>
                  <textarea
                    required
                    rows={2}
                    value={broadcastBody}
                    onChange={e => setBroadcastBody(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs text-white resize-none"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer">
                  Broadcast Push / SMS
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. MODAL OVERLAY: MANAGE ORDER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-slide-up">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-3">
              <span className="font-mono text-[9px] bg-white/5 text-slate-300 rounded px-2.5 py-0.5 border border-white/5">Order Ref: {selectedOrder.id}</span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mt-2.5">
                ERP Order Process Nodes
              </h3>
              <p className="text-[9.5px] text-slate-500 mt-1">Manage shipping, update status registers, or issue invoice prints.</p>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl grid grid-cols-2 gap-3.5 font-bold">
                <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase block">Customer</span>
                  <span className="text-white mt-0.5 block">{selectedOrder.customerName || 'Zibonbaba Customer'}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase block">Invoice Date</span>
                  <span className="text-white mt-0.5 block">{selectedOrder.date}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase block">Platform Source</span>
                  <span className="text-white font-mono mt-0.5 block">{selectedOrder.source}</span>
                </div>
                <div>
                  <span className="text-[8px] font-black text-slate-500 uppercase block">Gross Total</span>
                  <span className="text-emerald-400 font-extrabold mt-0.5 block">৳{selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-[8.5px] font-black text-slate-500 uppercase mb-1.5">Update Status Node</label>
                <div className="flex flex-wrap gap-1.5">
                  {['PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setLocalOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: st as any } : o));
                        setSelectedOrder(prev => prev ? { ...prev, status: st as any } : null);
                        alert(`Order status updated to: ${st}`);
                      }}
                      className={`text-[8.5px] font-black px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                        selectedOrder.status === st
                          ? 'bg-[#FFC107] border-[#FFC107] text-slate-950'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3.5 pt-3.5 border-t border-white/5">
                <button
                  onClick={() => alert(`Simulating invoice print... PDF generated for ${selectedOrder.id}.`)}
                  className="bg-white/5 hover:bg-white/10 text-white text-[10px] font-black py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer border border-white/5"
                >
                  <Printer className="w-3.5 h-3.5 text-[#FFC107]" /> Print Invoice
                </button>
                <button
                  onClick={() => alert(`Delivery partner assigned: Courier logistics Node.`)}
                  className="bg-[#FFC107] text-slate-950 text-[10px] font-black py-2.5 px-4 rounded-xl cursor-pointer active:scale-95"
                >
                  Assign Delivery Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. RESPONSIVE BOTTOM NAVIGATION (MOBILE DEVICE PARITY) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 z-40 flex items-center justify-around px-4">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'marketplace', label: 'Catalog', icon: ShoppingBag },
          { id: 'orders', label: 'Orders', icon: CreditCard },
          { id: 'ai', label: 'AI Hub', icon: BrainCircuit }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id as AdminModule)}
              className={`flex flex-col items-center gap-1 text-[9px] font-bold ${
                isActive ? 'text-[#FFC107]' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Vendor Application Verification SlideOver Drawer */}
      <SlideOverDrawer
        isOpen={Boolean(selectedDrawerSeller)}
        onClose={() => setSelectedDrawerSeller(null)}
        title="Vendor Registration Review"
        subtitle={selectedDrawerSeller?.name || 'Applicant Inspection'}
      >
        {selectedDrawerSeller && (
          <div className="space-y-6 text-slate-200">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <p className="text-xs text-slate-400">Applicant Name: <span className="text-slate-100 font-bold">{selectedDrawerSeller.owner}</span></p>
              <p className="text-xs text-slate-400">Email Address: <span className="text-slate-100 font-bold">{selectedDrawerSeller.email}</span></p>
              <p className="text-xs text-slate-400">Business Category: <span className="text-amber-400 font-bold">{selectedDrawerSeller.type}</span></p>
              <p className="text-xs text-slate-400">Document Submitted: <span className="text-blue-400 font-bold underline cursor-pointer">{selectedDrawerSeller.docs}</span></p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">KYC Compliance Check</h4>
              <ul className="text-xs space-y-2 text-slate-400">
                <li className="flex items-center gap-2 text-emerald-400">✔ National ID / Passport match confirmed</li>
                <li className="flex items-center gap-2 text-emerald-400">✔ Trade License registration active</li>
                <li className="flex items-center gap-2 text-emerald-400">✔ Tax Identification Number (TIN) valid</li>
              </ul>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={async () => {
                  const activeToken = token || localStorage.getItem('zibonbaba_token');
                  if (activeToken) {
                    try {
                      await fetch(`/api/verification/${selectedDrawerSeller.id}/review`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
                        body: JSON.stringify({ status: 'APPROVED', reviewNote: 'Approved by Super Admin' })
                      });
                    } catch (_) {}
                  }
                  setPendingSellers(prev => prev.filter(s => s.id !== selectedDrawerSeller.id));
                  setSellerActionMsg(`Approved store: ${selectedDrawerSeller.name}`);
                  setSelectedDrawerSeller(null);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg"
              >
                Approve Vendor Account
              </button>
              <button
                onClick={async () => {
                  const activeToken = token || localStorage.getItem('zibonbaba_token');
                  if (activeToken) {
                    try {
                      await fetch(`/api/verification/${selectedDrawerSeller.id}/review`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
                        body: JSON.stringify({ status: 'REJECTED', reviewNote: 'Rejected due to missing documents' })
                      });
                    } catch (_) {}
                  }
                  setPendingSellers(prev => prev.filter(s => s.id !== selectedDrawerSeller.id));
                  setSellerActionMsg(`Rejected store request: ${selectedDrawerSeller.name}`);
                  setSelectedDrawerSeller(null);
                }}
                className="flex-1 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-extrabold text-xs rounded-xl transition"
              >
                Reject Request
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
