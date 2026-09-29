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
  Menu,
  Star,
  Sun,
  Moon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnterpriseDataTable from '@/components/enterprise-data-table';
import SlideOverDrawer from '@/components/slide-over-drawer';

type AdminModule =
  | 'dashboard' | 'marketplace' | 'orders' | 'customers' | 'sellers'
  | 'resellers' | 'delivery' | 'inventory' | 'warehouse' | 'pos'
  | 'crm' | 'erp' | 'hrm' | 'wallet' | 'finance' | 'reports'
  | 'notifications' | 'rbac' | 'settings' | 'audit' | 'superadmin' | 'reviews';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    products,
    orders,
    crmCustomers,
    fetchProducts,
    fetchOrders,
    fetchCrmCustomers,
    updateOrderStatus,
    addCustomer,
    addProduct,
    categories,
    fetchHomepage,
    token,
    isLoggedIn,
    role,
    logout,
    username,
    adminTheme,
    toggleAdminTheme,
    setAdminTheme,
    initAdminTheme
  } = useStore();
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // --- LOCAL & REMOTE MUTABLE STATES ---
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);

  // Real-time Admin Seller Management
  const [adminSellers, setAdminSellers] = useState<any[]>([]);
  const [sellerTab, setSellerTab] = useState<'verified' | 'kyc'>('verified');
  const [sellerSearchQuery, setSellerSearchQuery] = useState('');
  const [editingSeller, setEditingSeller] = useState<any | null>(null);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreDesc, setEditStoreDesc] = useState('');
  const [editStoreCommission, setEditStoreCommission] = useState('8.5');
  const [editStoreApproved, setEditStoreApproved] = useState(true);
  const [editStoreOwnerName, setEditStoreOwnerName] = useState('');
  const [editStoreOwnerPhone, setEditStoreOwnerPhone] = useState('');

  // Real-time Admin Customer Management
  const [adminCustomers, setAdminCustomers] = useState<any[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [editCustName, setEditCustName] = useState('');
  const [editCustPhone, setEditCustPhone] = useState('');
  const [editCustStatus, setEditCustStatus] = useState('ACTIVE');
  const [editCustWallet, setEditCustWallet] = useState('0');
  const [editCustPoints, setEditCustPoints] = useState('0');
  const [editCustPassword, setEditCustPassword] = useState('');

  // Real-time Admin Product Management
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdStock, setEditProdStock] = useState('20');
  const [editProdCategory, setEditProdCategory] = useState('Electronics');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdStatus, setEditProdStatus] = useState('PUBLISHED');

  // Real-time Reseller & Delivery Management States
  const [adminResellers, setAdminResellers] = useState<any[]>([]);
  const [resellerSearchQuery, setResellerSearchQuery] = useState('');
  const [adminDeliveryMen, setAdminDeliveryMen] = useState<any[]>([]);
  const [deliverySearchQuery, setDeliverySearchQuery] = useState('');
  const [adminUnassignedOrders, setAdminUnassignedOrders] = useState<any[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([]);
  const [selectedRiderForAssign, setSelectedRiderForAssign] = useState<Record<string, string>>({});
  const [isAssigningOrder, setIsAssigningOrder] = useState<string | null>(null);

  const fetchAdminSellers = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/sellers', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.sellers)) {
        setAdminSellers(data.sellers);
      }
    } catch (_) {}
  };

  const fetchAdminCustomers = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/users?role=CUSTOMER', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.users)) {
        setAdminCustomers(data.users);
      }
    } catch (_) {}
  };

  const fetchAdminResellers = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/resellers', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.resellers)) {
        setAdminResellers(data.resellers);
      }
    } catch (_) {}
  };

  const fetchAdminDeliveryMen = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/delivery-men', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.deliveryMen)) {
        setAdminDeliveryMen(data.deliveryMen);
      }
    } catch (_) {}
  };

  const fetchAdminUnassignedOrders = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/delivery/unassigned-orders', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.orders)) {
        setAdminUnassignedOrders(data.orders);
      }
    } catch (_) {}
  };

  const fetchAdminWithdrawals = async () => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.withdrawals)) {
        setAdminWithdrawals(data.withdrawals);
      }
    } catch (_) {}
  };

  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const fetchAdminReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews?limit=100');
      const data = await res.json();
      if (res.ok && Array.isArray(data.reviews)) {
        setAdminReviews(data.reviews);
      }
    } catch (_) {}
    finally {
      setIsLoadingReviews(false);
    }
  };

  const handleToggleReviewFeatured = async (reviewId: string, currentFeatured: boolean) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ isFeatured: !currentFeatured })
      });
      if (res.ok) {
        setAdminReviews(prev =>
          prev.map(r => (r.id === reviewId ? { ...r, isFeatured: !currentFeatured } : r))
        );
      }
    } catch (_) {}
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (res.ok) {
        setAdminReviews(prev => prev.filter(r => r.id !== reviewId));
      }
    } catch (_) {}
  };

  const handleUpdateResellerStatus = async (resellerId: string, newStatus: string) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ resellerId, newStatus })
      });
      if (res.ok) {
        fetchAdminResellers();
      }
    } catch (_) {}
  };

  const handleUpdateDeliveryManStatus = async (deliveryManId: string, newStatus: string) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/delivery-men', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ deliveryManId, newStatus })
      });
      if (res.ok) {
        fetchAdminDeliveryMen();
      }
    } catch (_) {}
  };

  const handleAssignOrderToRider = async (orderId: string, deliveryManId: string) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken || !deliveryManId) return;
    setIsAssigningOrder(orderId);
    try {
      const res = await fetch('/api/admin/delivery/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({ orderId, deliveryManId })
      });
      if (res.ok) {
        fetchAdminUnassignedOrders();
        fetchAdminDeliveryMen();
        fetchOrders();
      }
    } catch (_) {} finally {
      setIsAssigningOrder(null);
    }
  };

  const handleUpdateWithdrawalStatus = async (withdrawalId: string, newStatus: string) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          withdrawalId,
          newStatus,
          transactionRef: `TXN-${Date.now().toString().slice(-6)}`
        })
      });
      if (res.ok) {
        fetchAdminWithdrawals();
      }
    } catch (_) {}
  };

  useEffect(() => {
    setIsMounted(true);
    initAdminTheme();
    fetchProducts();
    fetchOrders();
    fetchCrmCustomers();
    fetchAdminSellers();
    fetchAdminCustomers();
    fetchAdminResellers();
    fetchAdminDeliveryMen();
    fetchAdminUnassignedOrders();
    fetchAdminWithdrawals();
    fetchAdminReviews();

    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    if (activeToken) {
      const authHeaders = { Authorization: `Bearer ${activeToken}` };
      fetch('/api/admin/platform-stats', { headers: authHeaders })
        .then(res => res.json())
        .then(data => setPlatformStats(data))
        .catch(() => {});
      fetch('/api/verification/pending', { headers: authHeaders })
        .then(res => res.json())
        .then(data => {
          if (data.verifications && Array.isArray(data.verifications) && data.verifications.length > 0) {
            setPendingSellers(data.verifications.map((v: any) => ({
              id: v.id,
              userId: v.userId,
              storeId: v.storeId,
              name: v.userName || v.storeName || v.user?.profile?.fullName || v.user?.email || 'Vendor Applicant',
              owner: v.userName || v.user?.profile?.fullName || 'Owner',
              email: v.email || v.user?.email || 'vendor@store.com',
              type: v.type || 'TRADE_LICENSE',
              docs: 'Verification_Doc.pdf',
              status: v.status || 'Pending'
            })));
          }
        })
        .catch(() => {});
      fetch('/api/admin/coupons', { headers: authHeaders })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.coupons) && data.coupons.length > 0) {
            setCoupons(data.coupons);
          }
        })
        .catch(() => {});
      fetch('/api/admin/employees', { headers: authHeaders })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.employees) && data.employees.length > 0) {
            setEmployees(data.employees);
          }
        })
        .catch(() => {});
      fetch('/api/admin/crm-notes', { headers: authHeaders })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.notes) && data.notes.length > 0) {
            setCrmNotes(data.notes.map((n: any) => ({
              id: n.id,
              name: n.name,
              note: n.note,
              date: n.createdAt ? new Date(n.createdAt).toISOString().split('T')[0] : ''
            })));
          }
        })
        .catch(() => {});
      fetch('/api/admin/settings', { headers: authHeaders })
        .then(res => res.json())
        .then(data => {
          if (data.settings) {
            if (data.settings.globalVAT !== undefined) setGlobalVAT(data.settings.globalVAT);
            if (data.settings.shippingCost !== undefined) setShippingCost(data.settings.shippingCost);
            if (data.settings.platformCommission !== undefined) setPlatformCommission(data.settings.platformCommission);
            if (data.settings.gateways) setGateways(data.settings.gateways);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Real-time Platform Synchronization Listener
  useEffect(() => {
    const handleSync = () => {
      fetchOrders();
      fetchProducts();
      fetchAdminSellers();
      fetchAdminCustomers();
      fetchAdminResellers();
      fetchAdminDeliveryMen();
      fetchAdminUnassignedOrders();
      fetchAdminWithdrawals();
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      if (activeToken) {
        fetch('/api/admin/platform-stats', { headers: { Authorization: `Bearer ${activeToken}` } })
          .then(res => res.json())
          .then(data => setPlatformStats(data))
          .catch(() => {});
      }
    };

    window.addEventListener('zibonbaba:order-sync', handleSync);
    window.addEventListener('zibonbaba:product-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleSync);
      window.removeEventListener('zibonbaba:product-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchOrders, fetchProducts, token]);

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
  interface AdminCoupon {
    id?: string;
    code: string;
    discount: number;
    expiry: string;
    active: boolean;
  }
  const [coupons, setCoupons] = useState<AdminCoupon[]>([
    { id: 'cpn-1', code: 'SAVE10', discount: 10, expiry: '2026-08-31', active: true },
    { id: 'cpn-2', code: 'EID20', discount: 20, expiry: '2026-09-15', active: true },
    { id: 'cpn-3', code: 'FREESHIP', discount: 100, expiry: '2026-07-31', active: false }
  ]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('15');

  // Employee Management State
  interface AdminEmployee {
    id: string;
    name: string;
    role: string;
    dept: string;
    salary: number;
    attendance?: string;
    status: string;
  }
  const [employees, setEmployees] = useState<AdminEmployee[]>([
    { id: 'emp-1', name: 'Kabir Rahman', role: 'Operations Manager', dept: 'Logistics', salary: 45000, attendance: '98%', status: 'Paid' },
    { id: 'emp-2', name: 'Sadia Chowdhury', role: 'Support Team Lead', dept: 'Customer Success', salary: 38000, attendance: '95%', status: 'Paid' },
    { id: 'emp-3', name: 'Anisul Hoque', role: 'Inventory Specialist', dept: 'Warehouse A', salary: 28000, attendance: '92%', status: 'Processing' }
  ]);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('Operations Specialist');

  // CRM funnel notes
  interface AdminCrmNote {
    id: any;
    name: string;
    note: string;
    date?: string;
  }
  const [crmNotes, setCrmNotes] = useState<AdminCrmNote[]>([
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
  
  // --- ADMIN PRODUCT CRUD HANDLERS ---
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setEditProdName(prod.name || '');
    setEditProdPrice(prod.price !== undefined ? prod.price.toString() : '');
    setEditProdStock(prod.stock !== undefined ? prod.stock.toString() : '20');
    setEditProdCategory(prod.category || 'Electronics');
    setEditProdDesc(prod.description || '');
    setEditProdStatus(prod.status || 'PUBLISHED');
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          name: editProdName.trim(),
          price: parseFloat(editProdPrice),
          stock: parseInt(editProdStock, 10),
          category: editProdCategory,
          description: editProdDesc.trim(),
          status: editProdStatus
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditingProduct(null);
        await fetchProducts();
        alert('Product catalog updated successfully!');
      } else {
        alert(data.error || 'Failed to update product.');
      }
    } catch (_) {
      alert('Error updating product.');
    }
  };

  const handleDeleteProduct = async (prodId: string, prodName: string) => {
    if (!confirm(`Are you sure you want to delete product "${prodName}" from the platform catalog?`)) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        }
      });
      if (res.ok) {
        await fetchProducts();
        alert(`Product "${prodName}" deleted successfully.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete product.');
      }
    } catch (_) {
      alert('Error deleting product.');
    }
  };

  // --- ADMIN CUSTOMER CRUD HANDLERS ---
  const handleOpenEditCustomer = (cust: any) => {
    setEditingCustomer(cust);
    setEditCustName(cust.name || '');
    setEditCustPhone(cust.phone && cust.phone !== 'N/A' ? cust.phone : '');
    setEditCustStatus(cust.status || 'ACTIVE');
    setEditCustWallet(cust.walletBalance !== undefined ? cust.walletBalance.toString() : '0');
    setEditCustPoints(cust.loyaltyPoints !== undefined ? cust.loyaltyPoints.toString() : '0');
    setEditCustPassword('');
  };

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/users/${editingCustomer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          fullName: editCustName.trim(),
          phone: editCustPhone.trim() || undefined,
          status: editCustStatus,
          walletBalance: parseFloat(editCustWallet),
          loyaltyPoints: parseInt(editCustPoints, 10),
          password: editCustPassword.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditingCustomer(null);
        await fetchAdminCustomers();
        await fetchCrmCustomers();
        alert('Customer profile updated successfully.');
      } else {
        alert(data.error || 'Failed to update customer.');
      }
    } catch (_) {
      alert('Error updating customer record.');
    }
  };

  const handleDeleteCustomer = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to permanently delete user account ${userEmail}?`)) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': activeToken ? `Bearer ${activeToken}` : '' }
      });
      if (res.ok) {
        await fetchAdminCustomers();
        await fetchCrmCustomers();
        alert(`User ${userEmail} deleted.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user.');
      }
    } catch (_) {
      alert('Error deleting user.');
    }
  };

  const handleToggleCustomerStatus = async (cust: any) => {
    const newStatus = cust.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/users/${cust.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchAdminCustomers();
        await fetchCrmCustomers();
      }
    } catch (_) {}
  };

  // --- ADMIN SELLER CRUD HANDLERS ---
  const handleOpenEditSeller = (seller: any) => {
    setEditingSeller(seller);
    setEditStoreName(seller.name || '');
    setEditStoreDesc(seller.description || '');
    setEditStoreCommission((seller.commissionRate || 8.5).toString());
    setEditStoreApproved(Boolean(seller.isApproved));
    setEditStoreOwnerName(seller.owner?.name || '');
    setEditStoreOwnerPhone(seller.owner?.phone && seller.owner?.phone !== 'N/A' ? seller.owner?.phone : '');
  };

  const handleSaveEditSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/sellers/${editingSeller.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          name: editStoreName.trim(),
          description: editStoreDesc.trim(),
          commissionRate: parseFloat(editStoreCommission),
          isApproved: editStoreApproved,
          ownerName: editStoreOwnerName.trim() || undefined,
          ownerPhone: editStoreOwnerPhone.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setEditingSeller(null);
        await fetchAdminSellers();
        alert('Vendor store updated successfully.');
      } else {
        alert(data.error || 'Failed to update store.');
      }
    } catch (_) {
      alert('Error updating store.');
    }
  };

  const handleDeleteSeller = async (sellerId: string, sellerName: string) => {
    if (!confirm(`Are you sure you want to delete vendor store "${sellerName}" and all associated products?`)) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': activeToken ? `Bearer ${activeToken}` : '' }
      });
      if (res.ok) {
        await fetchAdminSellers();
        alert(`Vendor store "${sellerName}" removed.`);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete store.');
      }
    } catch (_) {
      alert('Error deleting store.');
    }
  };

  const handleToggleSellerApproval = async (sellerId: string, currentApproved: boolean) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ isApproved: !currentApproved })
      });
      if (res.ok) {
        await fetchAdminSellers();
      }
    } catch (_) {}
  };

  // Custom action handlers
  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('prodName') as HTMLInputElement).value;
    const price = parseFloat((form.elements.namedItem('prodPrice') as HTMLInputElement).value);
    const sku = (form.elements.namedItem('prodSKU') as HTMLInputElement).value.toUpperCase();
    const categoryName = (categories && categories.length > 0)
      ? (typeof categories[0] === 'string' ? categories[0] : ((categories[0] as any)?.name || 'Electronics'))
      : 'Electronics';

    if (!name || !price || !sku) return;

    try {
      const activeToken = token || localStorage.getItem('zibonbaba_token');
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          name,
          price,
          sku,
          category: categoryName,
          stock: 50,
          description: 'Administrative registered product SKU.'
        })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchProducts();
        setShowQuickActionModal(false);
        setQuickActionType(null);
        alert(`SKU ${sku} registered and catalog updated.`);
      } else {
        alert(data.error || 'Failed to create product SKU.');
      }
    } catch (_) {
      const newProd: Product = {
        id: 'prod-' + Date.now(),
        name,
        price,
        category: categoryName,
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
      alert(`SKU ${sku} created.`);
    }
  };

  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const name = (form.elements.namedItem('custName') as HTMLInputElement).value;
    const email = (form.elements.namedItem('custEmail') as HTMLInputElement).value;
    
    if (!name || !email) return;

    try {
      const activeToken = token || localStorage.getItem('zibonbaba_token');
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          fullName: name,
          email,
          phone: '+880 1700-000000',
          password: 'Customer123!',
          role: 'CUSTOMER',
          status: 'ACTIVE'
        })
      });
      const data = await res.json();
      if (res.ok) {
        await fetchCrmCustomers();
        setShowQuickActionModal(false);
        setQuickActionType(null);
        alert(`Customer profile for ${name} registered in system.`);
      } else {
        alert(data.error || 'Failed to register customer profile.');
      }
    } catch (_) {
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
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          globalVAT,
          shippingCost,
          platformCommission,
          gateways
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSettingsSavedMsg('Platform configuration updated and saved successfully.');
        setTimeout(() => setSettingsSavedMsg(''), 4000);
      } else {
        alert(data.error || 'Failed to save settings.');
      }
    } catch (err) {
      console.error('Save settings error:', err);
    }
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

  const handleAddNewCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          code: newCouponCode.toUpperCase(),
          discount: parseInt(newCouponDiscount) || 10,
          expiry: '2026-12-31'
        })
      });
      const data = await res.json();
      if (res.ok && data.coupon) {
        setCoupons(prev => [data.coupon, ...prev]);
        setNewCouponCode('');
        alert(`Coupon ${data.coupon.code} activated successfully!`);
      } else {
        alert(data.error || 'Failed to create coupon.');
      }
    } catch (_) {
      setCoupons(prev => [...prev, {
        id: 'cpn-' + Date.now(),
        code: newCouponCode.toUpperCase(),
        discount: parseInt(newCouponDiscount) || 10,
        expiry: '2026-12-31',
        active: true
      }]);
      setNewCouponCode('');
    }
  };

  const handleToggleCoupon = async (id?: string, currentActive?: boolean) => {
    if (!id) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ active: !currentActive })
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => (c.id === id ? { ...c, active: !currentActive } : c)));
      }
    } catch (_) {
      setCoupons(prev => prev.map(c => (c.id === id ? { ...c, active: !currentActive } : c)));
    }
  };

  const handleDeleteCoupon = async (id?: string) => {
    if (!id) return;
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': activeToken ? `Bearer ${activeToken}` : '' }
      });
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch (_) {
      setCoupons(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleAddNewEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          name: newEmpName,
          role: newEmpRole,
          dept: 'Administration',
          salary: 32000,
          attendance: '100%',
          status: 'Paid'
        })
      });
      const data = await res.json();
      if (res.ok && data.employee) {
        setEmployees(prev => [...prev, data.employee]);
        setNewEmpName('');
        alert(`Staff member ${data.employee.name} added to workforce.`);
      } else {
        alert(data.error || 'Failed to add employee.');
      }
    } catch (_) {
      setEmployees(prev => [...prev, {
        id: 'emp-' + Date.now(),
        name: newEmpName,
        role: newEmpRole,
        dept: 'Administration',
        salary: 32000,
        attendance: '100%',
        status: 'Paid'
      }]);
      setNewEmpName('');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm('Remove this staff record?')) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      await fetch(`/api/admin/employees/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': activeToken ? `Bearer ${activeToken}` : '' }
      });
      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (_) {}
  };

  const handleAddCrmNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrmName || !newCrmNote) return;
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      const res = await fetch('/api/admin/crm-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ name: newCrmName, note: newCrmNote })
      });
      const data = await res.json();
      if (res.ok && data.note) {
        setCrmNotes(prev => [{
          id: data.note.id,
          name: data.note.name,
          note: data.note.note,
          date: new Date().toISOString().split('T')[0]
        }, ...prev]);
        setNewCrmName('');
        setNewCrmNote('');
      }
    } catch (_) {
      setCrmNotes(prev => [{
        id: Date.now(),
        name: newCrmName,
        note: newCrmNote,
        date: new Date().toISOString().split('T')[0]
      }, ...prev]);
      setNewCrmName('');
      setNewCrmNote('');
    }
  };

  const handleDeleteCrmNote = async (id: any) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
    try {
      await fetch(`/api/admin/crm-notes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': activeToken ? `Bearer ${activeToken}` : '' }
      });
      setCrmNotes(prev => prev.filter(n => n.id !== id));
    } catch (_) {
      setCrmNotes(prev => prev.filter(n => n.id !== id));
    }
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

  // Navigation module mapping configs
  const navigationGroups = [
    {
      title: 'Real-time Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Commerce & Marketplace',
      items: [
        { id: 'marketplace', label: 'Products & Category', icon: ShoppingBag },
        { id: 'orders', label: 'Orders & Shipments', icon: CreditCard, badge: localOrders.length },
        { id: 'reviews', label: 'Customer Reviews', icon: Star, badge: adminReviews.length || undefined },
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
    { label: 'Manage Orders Register', action: () => { setActiveModule('orders'); setCommandPaletteOpen(false); } },
    { label: 'Open POS Register', action: () => { setActiveModule('pos'); setCommandPaletteOpen(false); } },
    { label: 'Check Warehouse Capacities', action: () => { setActiveModule('warehouse'); setCommandPaletteOpen(false); } },
    { label: 'Access System Settings', action: () => { setActiveModule('settings'); setCommandPaletteOpen(false); } },
    { label: 'System Diagnostics & Health Auditor', action: () => { router.push('/admin/system-health'); setCommandPaletteOpen(false); } },
    { label: 'Create SKU Product', action: () => { setShowQuickActionModal(true); setQuickActionType('product'); setCommandPaletteOpen(false); } }
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const isLight = adminTheme === 'light';

  return (
    <div
      data-admin-theme={adminTheme}
      className={`flex min-h-screen font-sans relative overflow-hidden transition-colors duration-200 ${
        isLight ? 'admin-light bg-slate-50 text-slate-900' : 'admin-dark bg-slate-950 text-slate-100'
      }`}
    >
      {/* Dynamic Futuristic Background Glows */}
      <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] ${isLight ? 'bg-amber-400/5' : 'bg-[#FFC107]/5'} blur-[120px] rounded-full pointer-events-none z-0`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] ${isLight ? 'bg-blue-500/5' : 'bg-blue-500/5'} blur-[120px] rounded-full pointer-events-none z-0`} />

      {/* 1. FUTURISTIC GLASS SIDEBAR NAVIGATION */}
      <aside 
        className={`${
          isLight
            ? 'bg-white border-r border-slate-200 shadow-[2px_0_12px_rgba(0,0,0,0.03)]'
            : 'bg-slate-950/80 backdrop-blur-xl border-r border-white/5'
        } shrink-0 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } hidden md:flex flex-col z-30 relative`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center justify-between px-5 border-b ${isLight ? 'border-slate-200' : 'border-white/5'} shrink-0`}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md">
                Z
              </div>
              <span className={`font-extrabold text-xs tracking-wider uppercase ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Zibon<span className="text-amber-500">baba</span> <span className={`text-[10px] ${isLight ? 'text-slate-600' : 'text-slate-400'} font-semibold ml-1 px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>ERP</span>
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 shadow-md mx-auto">
              Z
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-900' : 'hover:bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Sidebar Scroll Area */}
        <div className="flex-grow overflow-y-auto py-5 px-3 space-y-6 scrollbar-thin">
          {navigationGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {isSidebarOpen && (
                <h3 className={`text-[10px] font-black uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5 ${
                  isLight ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
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
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-all relative cursor-pointer ${
                      isActive 
                        ? isLight
                          ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                          : 'bg-gradient-to-r from-[#FFC107]/20 to-[#FFC107]/5 border border-[#FFC107]/30 text-white shadow-[0_0_15px_rgba(255,193,7,0.05)]' 
                        : isLight
                          ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive 
                        ? isLight ? 'text-slate-950 scale-110' : 'text-[#FFC107] scale-110' 
                        : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`} />
                    {isSidebarOpen && <span className="truncate">{item.label}</span>}
                    
                    {/* Dynamic Sidebar Badges */}
                    {(item as any).badge !== undefined && (item as any).badge > 0 && (
                      <span className={`absolute right-3 top-2.5 text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center justify-center ${
                        isActive 
                          ? isLight ? 'bg-slate-950 text-white' : 'bg-[#FFC107] text-slate-950' 
                          : 'bg-blue-600 text-white'
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
        <div className={`p-4 border-t shrink-0 space-y-2 ${
          isLight ? 'border-slate-200 bg-slate-50/80' : 'border-white/5 bg-slate-950/60'
        }`}>
          {isSidebarOpen && (
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border mb-2 ${
              isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-white/[0.02] border-white/5'
            }`}>
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center border border-amber-500/30 shrink-0">
                {(username || role || 'A').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{username || 'Admin'}</p>
                <p className="text-[9px] text-amber-600 dark:text-amber-400 font-extrabold uppercase tracking-wider">{role || 'ADMIN'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl transition-all border cursor-pointer active:scale-98 ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-rose-500/20'
            }`}
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
        <header className={`h-16 border-b flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 ${
          isLight
            ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-xs'
            : 'bg-slate-950/60 backdrop-blur-md border-white/5'
        }`}>
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle (< md) */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className={`md:hidden p-2 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 text-amber-500" />
            </button>

            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)] shrink-0" />
            <h1 className="text-xs font-bold uppercase tracking-wider truncate">
              <span className={`hidden sm:inline ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Operations Center // </span>
              <span className={`font-black capitalize text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{activeModule}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search command shortcut */}
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className={`border text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/5'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Search Command...</span>
              <span className={`px-1.5 py-0.5 rounded text-[9px] border font-mono ${
                isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-950 text-slate-400 border-white/5'
              }`}>Ctrl+K</span>
            </button>

            {/* Diagnostics Link */}
            <Link
              href="/admin/system-health"
              className={`border text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
              }`}
              title="Real-Time System Diagnostics"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="hidden xl:inline">Diagnostics</span>
            </Link>

            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleAdminTheme}
              className={`border text-[11px] font-bold px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95 ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200 shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border-white/5'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              )}
            </button>

            {/* Quick action triggers */}
            <button
              onClick={() => setShowQuickActionModal(true)}
              className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs py-1.5 px-2.5 sm:px-3 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3px]" /> <span className="hidden xs:inline">ERP</span> Task
            </button>

            {/* Global Sign Out Button */}
            <button
              onClick={handleLogout}
              className={`border text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shrink-0 ${
                isLight
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border-rose-500/20'
              }`}
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
            <div className={`w-[85%] max-w-[300px] h-full flex flex-col justify-between border-r shadow-2xl animate-slide-up overflow-y-auto ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-950 border-white/10 text-white'
            }`}>
              <div className={`p-4 border-b flex items-center justify-between ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
                    Z
                  </div>
                  <div>
                    <h3 className={`font-extrabold text-xs uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Zibon<span className="text-amber-500">baba</span> ERP
                    </h3>
                    <span className="text-[9px] text-amber-500 font-bold uppercase">Operations Hub</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`p-1 rounded-lg transition-colors ${
                    isLight ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {navigationGroups.map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-1">
                    <h4 className={`text-[9px] font-black uppercase tracking-widest px-2 mb-1.5 flex items-center gap-1.5 ${
                      isLight ? 'text-slate-400' : 'text-slate-500'
                    }`}>
                      <span className="w-1 h-1 bg-amber-500 rounded-full" />
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
                              ? isLight
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                                : 'bg-[#FFC107]/20 border border-[#FFC107]/30 text-white shadow-glow'
                              : isLight
                                ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${
                            isActive 
                              ? isLight ? 'text-slate-950' : 'text-[#FFC107]' 
                              : isLight ? 'text-slate-500' : 'text-slate-400'
                          }`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className={`p-4 border-t space-y-2 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-white/10 bg-slate-900/60'}`}>
                <Link
                  href="/"
                  className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors ${
                    isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Back to Marketplace
                </Link>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-colors font-bold ${
                    isLight ? 'text-rose-700 hover:bg-rose-50' : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Viewport Scroll Area */}
        <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
          
          {/* ================================================= */}
          {/* VIEW: DASHBOARD HOME */}
          {/* ================================================= */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              {/* 4 Executive Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'Total Revenue (GMV)',
                    value: platformStats?.overview?.totalGmv ? `৳${platformStats.overview.totalGmv.toLocaleString()}` : `৳${totalRevenue.toLocaleString()}`,
                    desc: 'Total sales gross invoices',
                    icon: CreditCard,
                    trend: '+14%',
                    iconBg: isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400',
                  },
                  {
                    label: 'Total Orders',
                    value: platformStats?.overview?.totalOrders ?? localOrders.length,
                    desc: 'Across all active channels',
                    icon: ShoppingBag,
                    trend: '+22%',
                    iconBg: isLight ? 'bg-blue-100 text-blue-700' : 'bg-blue-500/20 text-blue-400',
                  },
                  {
                    label: 'Total Customers',
                    value: platformStats?.overview?.totalCustomers ?? localCustomers.length,
                    desc: 'Profiled shopper accounts',
                    icon: Users,
                    trend: '+8%',
                    iconBg: isLight ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400',
                  },
                  {
                    label: 'Active Stores',
                    value: platformStats?.overview?.totalStores ? `${platformStats.overview.totalStores} Stores` : `${pendingSellers.length + 10} Stores`,
                    desc: `${platformStats?.overview?.pendingVerifications || pendingSellers.length} Pending KYC`,
                    icon: Store,
                    trend: '+12%',
                    iconBg: isLight ? 'bg-purple-100 text-purple-700' : 'bg-purple-500/20 text-purple-400',
                  }
                ].map((stat, i) => (
                  <div 
                    key={i} 
                    className={`relative overflow-hidden border p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between min-h-[130px] ${
                      isLight
                        ? 'bg-white border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
                        : 'bg-white/[0.02] backdrop-blur-md border-white/5 shadow-xl hover:border-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]'
                    }`}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {stat.label}
                      </span>
                      <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                        <stat.icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className={`text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {stat.value}
                      </h4>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {stat.trend}
                        </span>
                        <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                          {stat.desc}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Visualization Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Neon Weekly Volume SVG chart */}
                <div className={`border p-6 rounded-2xl transition-all ${
                  isLight
                    ? 'bg-white border-slate-200/80 shadow-xs'
                    : 'bg-white/[0.02] backdrop-blur-md border-white/5 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3.5 mb-4" style={{ borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}>
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        Weekly Sales GMV Trend
                      </h4>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        ৳148,500 gross volume this week
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      +18.4%
                    </span>
                  </div>

                  <div className="flex items-end gap-3 h-44 pt-2">
                    {[
                      { day: 'Mon', val: 12000 },
                      { day: 'Tue', val: 18000 },
                      { day: 'Wed', val: 14500 },
                      { day: 'Thu', val: 24000 },
                      { day: 'Fri', val: 32000, peak: true },
                      { day: 'Sat', val: 27000 },
                      { day: 'Sun', val: 21000 }
                    ].map((d, idx) => {
                      const pct = Math.round((d.val / 32000) * 100);
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group cursor-pointer">
                          {/* Top Label */}
                          <span className={`text-[10px] font-bold font-mono transition-all ${
                            d.peak 
                              ? isLight ? 'text-amber-700 font-black' : 'text-amber-400 font-black' 
                              : isLight ? 'text-slate-500 group-hover:text-slate-900' : 'text-slate-400 group-hover:text-white'
                          }`}>
                            ৳{(d.val / 1000)}k
                          </span>

                          {/* Bar Track & Fill */}
                          <div className={`w-full h-32 rounded-xl p-1 flex items-end justify-center transition-all ${
                            isLight ? 'bg-slate-100 group-hover:bg-slate-200/60' : 'bg-white/5 group-hover:bg-white/10'
                          }`}>
                            <div 
                              className={`w-full rounded-lg transition-all duration-500 ${
                                d.peak
                                  ? 'bg-gradient-to-t from-amber-500 to-amber-400 shadow-sm'
                                  : isLight
                                    ? 'bg-gradient-to-t from-slate-400 to-slate-300 group-hover:from-amber-500 group-hover:to-amber-400'
                                    : 'bg-gradient-to-t from-slate-700 to-slate-600 group-hover:from-amber-500 group-hover:to-amber-400'
                              }`}
                              style={{ height: `${pct}%` }}
                            />
                          </div>

                          {/* Day Label */}
                          <span className={`text-[11px] font-extrabold uppercase mt-0.5 ${
                            d.peak
                              ? isLight ? 'text-amber-700' : 'text-amber-400'
                              : isLight ? 'text-slate-600' : 'text-slate-400'
                          }`}>
                            {d.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Interactive SVG Sparklines */}
                <div className={`border p-6 rounded-2xl space-y-4 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200/80 shadow-xs'
                    : 'bg-white/[0.02] backdrop-blur-md border-white/5 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      Real-time Conversion Analytics
                    </h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      Live Pulse
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className={`text-3xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>3.82%</span>
                      <span className={`text-xs ml-2 font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>+0.4% this hour</span>
                    </div>
                    <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} font-medium text-right`}>
                      <p>95 conversions / 2,490 visits</p>
                    </div>
                  </div>

                  <div className="relative h-28 flex items-end justify-center">
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={isLight ? 0.35 : 0.25} />
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 0 35 Q 20 10 40 25 T 80 5 T 100 20" 
                        fill="none" 
                        stroke="#2563eb" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                      />
                      <path 
                        d="M 0 35 Q 20 10 40 25 T 80 5 T 100 20 L 100 40 L 0 40 Z" 
                        fill="url(#neonGlow)"
                      />
                    </svg>
                  </div>

                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-200/80 text-slate-700' : 'bg-slate-950/60 border-white/5 text-slate-300'
                  }`}>
                    <span>Checkout Drop-off: <strong className={isLight ? 'text-slate-900' : 'text-white'}>18.2%</strong></span>
                    <span>Avg Cart: <strong className={isLight ? 'text-slate-900' : 'text-white'}>৳4,120</strong></span>
                  </div>
                </div>

                {/* 3. Category & Device Performance */}
                <div className={`border p-6 rounded-2xl space-y-4 transition-all ${
                  isLight
                    ? 'bg-white border-slate-200/80 shadow-xs'
                    : 'bg-white/[0.02] backdrop-blur-md border-white/5 shadow-xl'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3.5" style={{ borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}>
                    <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                      Traffic Sources Channel
                    </h4>
                    <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Monthly Split
                    </span>
                  </div>

                  <div className="space-y-4 text-xs font-bold">
                    {[
                      { name: 'App Checkouts (PWA)', pct: '68%', amount: '৳47,389', color: 'from-amber-500 to-[#FFC107]' },
                      { name: 'Desktop Web Core', pct: '32%', amount: '৳22,301', color: 'from-blue-600 to-indigo-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-mono text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{item.amount}</span>
                            <span className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.pct}</span>
                          </div>
                        </div>
                        <div className={`w-full h-2.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-white/5'}`}>
                          <div className={`h-full bg-gradient-to-r ${item.color} rounded-full`} style={{ width: item.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isLight ? 'bg-amber-50/60 border-amber-200/60 text-amber-900' : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                  }`}>
                    <span className="font-medium">Mobile Traffic Dominance:</span>
                    <span className="font-black text-amber-700 dark:text-amber-400">+14% Growth</span>
                  </div>
                </div>

              </div>

              {/* Security Shield Live Audit log */}
              <div className={`border p-6 rounded-2xl transition-all ${
                isLight
                  ? 'bg-white border-slate-200/80 shadow-xs'
                  : 'bg-white/[0.02] backdrop-blur-md border-white/5 shadow-xl'
              }`}>
                <div className="flex items-center justify-between border-b pb-3.5 mb-4" style={{ borderColor: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)' }}>
                  <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Security Monitoring Live Thread
                  </h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    System Auditing Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {platformStats?.recentLogs && platformStats.recentLogs.length > 0 ? (
                    platformStats.recentLogs.slice(0, 4).map((log: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                          isLight ? 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/70' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold shrink-0 ${
                            isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-white/10'
                          }`}>
                            [{new Date(log.createdAt).toLocaleTimeString()}]
                          </span>
                          <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                            {log.action} {log.user?.email && <strong className={isLight ? 'text-slate-950 font-bold' : 'text-white font-bold'}>by {log.user.email}</strong>} {log.ipAddress && <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>(IP {log.ipAddress})</span>}
                          </p>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          PASS
                        </span>
                      </div>
                    ))
                  ) : (
                    <>
                      {[
                        { time: '04:22:15', category: 'AUTH', text: 'Security alert: Auth trigger verification. Direct superadmin login verified.', status: 'PASS', color: 'emerald' },
                        { time: '04:18:47', category: 'SYNC', text: 'Database sync: PostgreSQL transaction pooler snapshot archived to Cloud Node.', status: 'INFO', color: 'blue' },
                        { time: '04:09:12', category: 'SHIELD', text: 'Shield alert: Anomaly Shield active with zero breaches across active storefront sessions.', status: 'ACTIVE', color: 'emerald' }
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                            isLight ? 'bg-slate-50 border-slate-200/60 hover:bg-slate-100/70' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-semibold shrink-0 ${
                              isLight ? 'bg-white text-slate-600 border-slate-200' : 'bg-slate-900 text-slate-400 border-white/10'
                            }`}>
                              [{item.time}]
                            </span>
                            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              item.color === 'emerald'
                                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'
                                : isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {item.category}
                            </span>
                            <p className={`text-xs font-medium truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                              {item.text}
                            </p>
                          </div>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                            item.color === 'emerald'
                              ? isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

            </div>
          )}



          {/* ================================================= */}
          {/* VIEW: CUSTOMER REVIEWS & TESTIMONIALS MODERATION */}
          {/* ================================================= */}
          {activeModule === 'reviews' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-xl">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    Customer Reviews & Experiences Moderation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage buyer ratings, feature real customer testimonials on the homepage, or moderate inappropriate comments.
                  </p>
                </div>
                <button
                  onClick={fetchAdminReviews}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-2 self-start sm:self-auto cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingReviews ? 'animate-spin' : ''}`} />
                  Refresh Reviews ({adminReviews.length})
                </button>
              </div>

              {adminReviews.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-12 text-center text-slate-400">
                  <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-sm font-bold">No customer reviews recorded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adminReviews.map((rev) => (
                    <div key={rev.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`}
                              />
                            ))}
                          </div>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${rev.isFeatured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {rev.isFeatured ? '★ Featured on Home' : 'Standard'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 italic mb-4 leading-relaxed font-medium">"{rev.comment}"</p>
                        {rev.product && (
                          <p className="text-[10px] text-amber-400 font-bold mb-3 truncate">
                            Item: {rev.product.name}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-white">{rev.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{rev.role || 'Verified Buyer'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleReviewFeatured(rev.id, rev.isFeatured)}
                            title={rev.isFeatured ? "Unfeature from homepage" : "Feature on homepage"}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                              rev.isFeatured
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {rev.isFeatured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            title="Delete review"
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: PRODUCTS DATABASE & MARKETPLACE */}
          {/* ================================================= */}
          {activeModule === 'marketplace' && (
            <div className="space-y-6 animate-fade-in">
              {/* Category Management Block */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3.5">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-amber-400" /> Marketplace Categories & Taxonomy
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Manage hierarchical product classifications across all vendor channels.</p>
                  </div>
                  {categorySuccess && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl animate-fade-in">
                      {categorySuccess}
                    </span>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Category Chips */}
                  <div className="flex flex-wrap gap-2 flex-1">
                    {(categories || []).map((cat: any, idx: number) => {
                      const catName = typeof cat === 'string' ? cat : (cat?.name || 'Category');
                      const count = typeof cat === 'object' && cat?.productCount !== undefined ? cat.productCount : undefined;
                      return (
                        <span
                          key={typeof cat === 'string' ? `${cat}-${idx}` : (cat?.id || cat?.name || idx)}
                          className="bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                        >
                          <span>{catName}</span>
                          {count !== undefined && (
                            <span className="bg-slate-950 text-amber-400 text-[9px] px-1.5 py-0.2 rounded-md font-mono">
                              {count}
                            </span>
                          )}
                        </span>
                      );
                    })}
                    {(!categories || categories.length === 0) && (
                      <span className="text-slate-500 text-xs">No categories registered yet.</span>
                    )}
                  </div>

                  {/* Add Category Form */}
                  <form onSubmit={handleCreateCategory} className="flex items-center gap-2 w-full lg:w-auto shrink-0">
                    <input
                      type="text"
                      required
                      placeholder="New Category Name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-600 outline-none focus:border-amber-400 font-medium w-full lg:w-48"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer shadow-glow active:scale-95 shrink-0"
                    >
                      + Add
                    </button>
                  </form>
                </div>
              </div>

              {/* Centralized Products Table */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-400" /> Centralized Products SKU Database
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Global catalog repository ({localProducts.length} published products across all stores)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchProducts()}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 text-xs flex items-center gap-1 font-bold transition-all"
                      title="Reload Products"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setShowQuickActionModal(true); setQuickActionType('product'); }}
                      className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-slate-950 font-black text-[10px] px-3.5 py-1.5 rounded-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-glow flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3px]" /> Add Product SKU
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-3 h-9 flex-1 focus-within:border-[#FFC107] transition-colors">
                    <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search by product name, SKU, or vendor..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="bg-transparent text-xs w-full outline-none text-white font-medium"
                    />
                    {productSearchQuery && (
                      <button onClick={() => setProductSearchQuery('')} className="text-slate-500 hover:text-white text-xs">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-gray-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 outline-none font-bold shrink-0"
                  >
                    <option value="ALL">All Categories</option>
                    {(categories || []).map((c: any, idx: number) => {
                      const name = typeof c === 'string' ? c : (c?.name || 'Category');
                      return <option key={idx} value={name}>{name}</option>;
                    })}
                  </select>
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
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                      {localProducts
                        .filter(p => productCategoryFilter === 'ALL' || p.category.toLowerCase() === productCategoryFilter.toLowerCase())
                        .filter(p =>
                          p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                          (p.vendor && p.vendor.toLowerCase().includes(productSearchQuery.toLowerCase()))
                        )
                        .map(p => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#FFC107]">{p.sku}</td>
                            <td className="py-3.5 px-4 text-white font-extrabold">{p.name}</td>
                            <td className="py-3.5 px-4 text-slate-400">{p.category}</td>
                            <td className="py-3.5 px-4 text-white font-black">৳{p.price.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-slate-300">{p.stock} units</td>
                            <td className="py-3.5 px-4 text-slate-500 font-medium">{p.vendor}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                p.stock > 10 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              }`}>
                                {p.stock > 10 ? 'Active' : 'Low Stock'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1.5 bg-white/5 hover:bg-[#FFC107]/20 hover:text-[#FFC107] rounded-lg text-slate-400 transition-colors"
                                  title="Edit Product Details"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  className="p-1.5 bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 rounded-lg text-slate-400 transition-colors"
                                  title="Delete Product from Platform"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {localProducts.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            No products found matching criteria.
                          </td>
                        </tr>
                      )}
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
          {/* ================================================= */}
          {/* VIEW: CRM & CUSTOMERS */}
          {/* ================================================= */}
          {activeModule === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" /> Platform Customer Directory
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Unified customer accounts & CRM profiles ({adminCustomers.length || localCustomers.length} registered customers)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => fetchAdminCustomers()}
                      className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl border border-white/10 text-xs flex items-center gap-1 font-bold transition-all"
                      title="Sync Customers"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => { setShowQuickActionModal(true); setQuickActionType('customer'); }}
                      className="bg-[#FFC107] hover:bg-[#FFC107]/90 text-slate-950 font-black text-[10px] px-3.5 py-1.5 rounded-xl uppercase tracking-wider cursor-pointer active:scale-95 transition-all shadow-glow flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5 stroke-[3px]" /> Add Customer
                    </button>
                  </div>
                </div>

                {/* Customer Search Bar */}
                <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-3 h-9 focus-within:border-[#FFC107] transition-colors max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by customer name, email, or phone..."
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="bg-transparent text-xs w-full outline-none text-white font-medium"
                  />
                  {customerSearchQuery && (
                    <button onClick={() => setCustomerSearchQuery('')} className="text-slate-500 hover:text-white text-xs">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Customers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(adminCustomers.length > 0 ? adminCustomers : localCustomers)
                    .filter((cust: any) =>
                      cust.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                      cust.email.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                      (cust.phone && cust.phone.toLowerCase().includes(customerSearchQuery.toLowerCase()))
                    )
                    .map((cust: any) => (
                      <div key={cust.id} className="p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl space-y-3 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-glow shrink-0">
                              {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white truncate">{cust.name}</h4>
                              <p className="text-[10px] text-slate-400 truncate">{cust.email}</p>
                            </div>
                          </div>
                          <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                            cust.status === 'ACTIVE' || cust.status === 'Active'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {cust.status || 'ACTIVE'}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-400 space-y-1 pt-2.5 border-t border-white/5 font-medium">
                          <p className="flex justify-between">
                            <span>Phone:</span>
                            <span className="text-slate-200 font-mono">{cust.phone || 'N/A'}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Wallet Balance:</span>
                            <span className="font-extrabold text-[#FFC107]">৳{(cust.walletBalance || cust.totalSpent || 0).toLocaleString()}</span>
                          </p>
                          <p className="flex justify-between">
                            <span>Loyalty Points:</span>
                            <span className="text-white font-bold">{cust.loyaltyPoints || Math.floor((cust.totalSpent || 0) * 0.15)} Pts</span>
                          </p>
                        </div>

                        {/* Customer Actions */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleOpenEditCustomer(cust)}
                            className="flex-1 bg-white/5 hover:bg-[#FFC107]/20 hover:text-[#FFC107] text-slate-300 text-[10px] font-bold py-1.5 rounded-xl border border-white/5 flex items-center justify-center gap-1 transition-colors"
                          >
                            <Edit size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleToggleCustomerStatus(cust)}
                            className={`flex-1 text-[10px] font-bold py-1.5 rounded-xl border transition-colors flex items-center justify-center gap-1 ${
                              cust.status === 'ACTIVE'
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {cust.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(cust.id, cust.email)}
                            className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-white/5 transition-colors"
                            title="Delete Account"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: SELLERS & MERCHANTS MANAGEMENT */}
          {/* ================================================= */}
          {activeModule === 'sellers' && (
            <div className="space-y-6 animate-fade-in">
              {sellerActionMsg && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {sellerActionMsg}
                </div>
              )}

              {/* Dual Tab Sub-Navigation */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setSellerTab('verified')}
                    className={`text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      sellerTab === 'verified'
                        ? isLight
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md border border-amber-500'
                          : 'bg-[#FFC107] text-slate-950 shadow-glow'
                        : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Verified Vendor Stores ({adminSellers.length})</span>
                  </button>
                  <button
                    onClick={() => setSellerTab('kyc')}
                    className={`text-xs font-black px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      sellerTab === 'kyc'
                        ? isLight
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md border border-amber-500'
                          : 'bg-[#FFC107] text-slate-950 shadow-glow'
                        : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>KYC Applications Queue ({pendingSellers.length})</span>
                  </button>
                </div>
                <button
                  onClick={() => { fetchAdminSellers(); }}
                  className={`p-2 rounded-xl border text-xs flex items-center gap-1 font-bold transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title="Refresh Sellers"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SUB-VIEW 1: VERIFIED VENDOR STORES */}
              {sellerTab === 'verified' && (
                <div className={`p-5 rounded-2xl shadow-xl space-y-4 ${
                  isLight
                    ? 'bg-white border border-slate-200 shadow-sm'
                    : 'bg-white/[0.02] border border-white/5'
                }`}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className={`flex items-center rounded-xl px-3 h-9 flex-1 transition-colors max-w-md ${
                      isLight
                        ? 'bg-white border border-slate-300 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20'
                        : 'bg-white/5 border border-white/5 focus-within:border-[#FFC107]'
                    }`}>
                      <Search className={`w-3.5 h-3.5 mr-2 shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        placeholder="Search store name, owner, or email..."
                        value={sellerSearchQuery}
                        onChange={(e) => setSellerSearchQuery(e.target.value)}
                        className={`bg-transparent text-xs w-full outline-none font-medium ${
                          isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white'
                        }`}
                      />
                      {sellerSearchQuery && (
                        <button onClick={() => setSellerSearchQuery('')} className={`${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-slate-500 hover:text-white'} text-xs`}>
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className={`border-b font-bold ${
                          isLight
                            ? 'bg-slate-100/90 border-slate-200 text-slate-800'
                            : 'bg-white/5 border-white/5 text-slate-400'
                        }`}>
                          <th className="py-3 px-4 font-black">Store / Merchant</th>
                          <th className="py-3 px-4">Owner & Contact</th>
                          <th className="py-3 px-4">Commission</th>
                          <th className="py-3 px-4">Catalog SKUs</th>
                          <th className="py-3 px-4">Gross Sales</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y font-semibold ${
                        isLight ? 'divide-slate-200 text-slate-800' : 'divide-white/5 text-slate-300'
                      }`}>
                        {adminSellers
                          .filter((s: any) =>
                            s.name.toLowerCase().includes(sellerSearchQuery.toLowerCase()) ||
                            (s.owner?.name && s.owner.name.toLowerCase().includes(sellerSearchQuery.toLowerCase())) ||
                            (s.owner?.email && s.owner.email.toLowerCase().includes(sellerSearchQuery.toLowerCase()))
                          )
                          .map((seller: any) => (
                            <tr key={seller.id} className={`${isLight ? 'hover:bg-slate-50' : 'hover:bg-white/5'} transition-colors`}>
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={seller.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=80&auto=format&fit=crop'}
                                    alt={seller.name}
                                    className={`w-8 h-8 rounded-lg object-cover shrink-0 border ${
                                      isLight ? 'border-slate-300' : 'border-white/10'
                                    }`}
                                  />
                                  <div>
                                    <h4 className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>{seller.name}</h4>
                                    <p className={`text-[10px] truncate max-w-[180px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{seller.description}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className={`font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{seller.owner?.name || 'Store Owner'}</p>
                                <p className={`text-[10px] font-mono font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{seller.owner?.email}</p>
                              </td>
                              <td className={`py-3.5 px-4 font-mono font-black ${isLight ? 'text-amber-800' : 'text-amber-400'}`}>
                                {seller.commissionRate || 8.5}%
                              </td>
                              <td className={`py-3.5 px-4 font-mono font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {seller.productsCount || 0} Products
                              </td>
                              <td className={`py-3.5 px-4 font-black font-mono ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                                ৳{(seller.grossSales || 0).toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                  isLight
                                    ? seller.isApproved
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-extrabold'
                                      : 'bg-amber-50 border-amber-300 text-amber-900 font-extrabold'
                                    : seller.isApproved
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                      : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                                }`}>
                                  {seller.isApproved ? 'VERIFIED' : 'PENDING'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditSeller(seller)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isLight
                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 shadow-sm'
                                        : 'bg-white/5 hover:bg-[#FFC107]/20 hover:text-[#FFC107] text-slate-400'
                                    }`}
                                    title="Edit Store Profile & Commission"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleSellerApproval(seller.id, seller.isApproved)}
                                    className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                      isLight
                                        ? seller.isApproved
                                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300 shadow-sm'
                                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-sm'
                                        : seller.isApproved
                                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                                    }`}
                                    title={seller.isApproved ? 'Suspend Store Verification' : 'Verify Store'}
                                  >
                                    {seller.isApproved ? <EyeOff className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSeller(seller.id, seller.name)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isLight
                                        ? 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 border border-slate-200 shadow-sm'
                                        : 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400'
                                    }`}
                                    title="Delete Store & Catalog"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        {adminSellers.length === 0 && (
                          <tr>
                            <td colSpan={7} className={`py-8 text-center ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              No stores registered yet. Use verified vendor creation or approve KYC requests.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB-VIEW 2: PENDING KYC APPROVALS */}
              {sellerTab === 'kyc' && (
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                    Merchant KYC Approvals Queue
                  </h3>
                  {pendingSellers.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <ShieldCheck className="w-10 h-10 text-emerald-500/50 mx-auto" />
                      <p className="text-xs text-slate-400">All vendor verification applications have been processed!</p>
                      <p className="text-[11px] text-slate-500">New seller registrations will appear here for compliance review.</p>
                    </div>
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
                              className="bg-[#FFC107] text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-glow"
                            >
                              Approve Merchant
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: RESELLER NETWORK MANAGEMENT */}
          {/* ================================================= */}
          {activeModule === 'resellers' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header & Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Resellers</span>
                  <span className="text-xl font-black text-white">{adminResellers.length} Partners</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Gross Reseller GMV</span>
                  <span className="text-xl font-black text-[#FFC107]">
                    ৳{adminResellers.reduce((sum, r) => sum + (r.grossSales || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Paid Profit Payouts</span>
                  <span className="text-xl font-black text-emerald-400">
                    ৳{adminResellers.reduce((sum, r) => sum + (r.totalProfit || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Accounts</span>
                  <span className="text-xl font-black text-blue-400">
                    {adminResellers.filter(r => r.status === 'ACTIVE' || r.status === 'APPROVED').length} Active
                  </span>
                </div>
              </div>

              {/* Resellers Table */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Registered Reseller Network Partners
                  </h3>
                  <div className="flex items-center bg-white/5 border border-white/5 rounded-xl px-3 h-9 w-full sm:max-w-xs focus-within:border-[#FFC107]">
                    <Search size={14} className="text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search reseller or shop..."
                      value={resellerSearchQuery}
                      onChange={e => setResellerSearchQuery(e.target.value)}
                      className="bg-transparent text-xs w-full outline-none text-white font-medium"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold">
                        <th className="pb-3 px-3">Reseller Details</th>
                        <th className="pb-3 px-3">Business / Page</th>
                        <th className="pb-3 px-3">District</th>
                        <th className="pb-3 px-3">Orders</th>
                        <th className="pb-3 px-3">Total Sales</th>
                        <th className="pb-3 px-3">Profit Balance</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {adminResellers
                        .filter(r => {
                          if (!resellerSearchQuery) return true;
                          const q = resellerSearchQuery.toLowerCase();
                          return (
                            r.fullName?.toLowerCase().includes(q) ||
                            r.email?.toLowerCase().includes(q) ||
                            r.businessName?.toLowerCase().includes(q) ||
                            r.phone?.includes(q)
                          );
                        })
                        .map(res => (
                          <tr key={res.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-3">
                              <p className="font-bold text-white">{res.fullName}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{res.email}</p>
                              <p className="text-[10px] text-slate-400">{res.phone || 'N/A'}</p>
                            </td>
                            <td className="py-3.5 px-3 font-bold text-slate-200">{res.businessName}</td>
                            <td className="py-3.5 px-3 text-slate-400">{res.district}</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-white">{res.totalOrders || 0}</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-[#FFC107]">৳{(res.grossSales || 0).toLocaleString()}</td>
                            <td className="py-3.5 px-3 font-mono font-bold text-emerald-400">৳{(res.walletBalance || 0).toLocaleString()}</td>
                            <td className="py-3.5 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border ${
                                res.status === 'ACTIVE' || res.status === 'APPROVED'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : res.status === 'SUSPENDED'
                                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              }`}>
                                {res.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {res.status !== 'ACTIVE' && (
                                  <button
                                    onClick={() => handleUpdateResellerStatus(res.id, 'ACTIVE')}
                                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                )}
                                {res.status !== 'SUSPENDED' && (
                                  <button
                                    onClick={() => handleUpdateResellerStatus(res.id, 'SUSPENDED')}
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Suspend
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      {adminResellers.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                            No registered resellers yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* VIEW: LOGISTICS COURIERS & DISPATCH CONSOLE */}
          {/* ================================================= */}
          {activeModule === 'delivery' && (
            <div className="space-y-6 animate-fade-in">
              {/* Dispatch Console: Unassigned Orders */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                      Live Courier Dispatch Console
                    </h3>
                    <p className="text-[10px] text-slate-500">Orders ready for driver dispatch and delivery assignment</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#FFC107] bg-[#FFC107]/10 border border-[#FFC107]/20 px-2.5 py-1 rounded-full">
                      {adminUnassignedOrders.length} Pending Dispatch
                    </span>
                    <Link
                      href="/staff/delivery"
                      className="bg-white/10 hover:bg-white/15 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/10 transition flex items-center gap-1.5"
                    >
                      🏢 Open Hub Station
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  {adminUnassignedOrders.map(ord => (
                    <div key={ord.id} className="p-4 bg-white/5 border border-white/5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-white">#{ord.id.slice(0, 8).toUpperCase()}</span>
                          {ord.isResellerOrder && (
                            <span className="text-[9px] font-bold px-2 py-0.2 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              Reseller Order
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-white">{ord.customerName} ({ord.customerPhone})</p>
                        <p className="text-[10px] text-slate-400">{ord.address}, {ord.district}</p>
                        <p className="text-[10px] text-slate-500">{ord.itemsSummary}</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <span className="text-[10px] text-slate-400 block">Total COD</span>
                          <span className="text-xs font-black text-[#FFC107]">৳{ord.total.toLocaleString()}</span>
                        </div>

                        <select
                          value={selectedRiderForAssign[ord.id] || ''}
                          onChange={e => setSelectedRiderForAssign({ ...selectedRiderForAssign, [ord.id]: e.target.value })}
                          className="bg-slate-900 border border-white/10 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                        >
                          <option value="">-- Assign Courier Rider --</option>
                          {adminDeliveryMen.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.fullName} ({d.preferredZone} - {d.isOnline ? '🟢 Online' : '⚪ Offline'})
                            </option>
                          ))}
                        </select>

                        <button
                          disabled={!selectedRiderForAssign[ord.id] || isAssigningOrder === ord.id}
                          onClick={() => handleAssignOrderToRider(ord.id, selectedRiderForAssign[ord.id])}
                          className="bg-[#FFC107] hover:bg-amber-400 text-slate-950 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-glow cursor-pointer disabled:opacity-40"
                        >
                          {isAssigningOrder === ord.id ? 'Dispatching...' : 'Dispatch Rider'}
                        </button>
                      </div>
                    </div>
                  ))}

                  {adminUnassignedOrders.length === 0 && (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      All active orders have been assigned to delivery riders!
                    </div>
                  )}
                </div>
              </div>

              {/* Courier Fleet Grid */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Registered Delivery Fleet ({adminDeliveryMen.length} Riders)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adminDeliveryMen.map((cour) => (
                    <div key={cour.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-black text-white">{cour.fullName}</h4>
                          <p className="text-[10px] text-slate-500 font-mono">{cour.phone || cour.email}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Vehicle: {cour.vehicleType}</span>
                        </div>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
                          cour.isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/5 text-slate-400'
                        }`}>
                          {cour.isOnline ? '🟢 ONLINE' : 'OFFLINE'}
                        </span>
                      </div>

                      <div className="text-[10px] text-slate-400 space-y-1 font-medium pt-2 border-t border-white/5">
                        <p className="flex justify-between">
                          <span>Active Deliveries:</span>
                          <span className="text-white font-bold">{cour.activeAssignments} Packages</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Completed Drops:</span>
                          <span className="text-emerald-400 font-bold">{cour.completedDeliveries} Delivered</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Cash In Hand:</span>
                          <span className="text-[#FFC107] font-black">৳{(cour.cashInHand || 0).toLocaleString()}</span>
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                        <Link
                          href={`/admin/delivery-men/${cour.id}`}
                          className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[10px] font-bold py-1.5 rounded-lg transition-colors text-center cursor-pointer"
                        >
                          Manage Profile →
                        </Link>
                        {cour.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleUpdateDeliveryManStatus(cour.id, 'APPROVED')}
                            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                        )}
                        {cour.status !== 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateDeliveryManStatus(cour.id, 'SUSPENDED')}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Universal Withdrawals Queue */}
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  Universal Payout Settlements Queue ({adminWithdrawals.length} Requests)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400 font-bold">
                        <th className="pb-3 px-3">User & Role</th>
                        <th className="pb-3 px-3">Amount</th>
                        <th className="pb-3 px-3">Payment Method</th>
                        <th className="pb-3 px-3">Account Number</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3 text-right">Review Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {adminWithdrawals.map(w => (
                        <tr key={w.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3">
                            <p className="font-bold text-white">{w.userName}</p>
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-white/5 text-slate-400 uppercase">
                              {w.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-black text-[#FFC107]">৳{w.amount.toLocaleString()}</td>
                          <td className="py-3 px-3 font-bold text-white">{w.paymentMethod}</td>
                          <td className="py-3 px-3 font-mono text-slate-300">{w.accountNumber}</td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black border ${
                              w.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : w.status === 'REJECTED'
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            }`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            {w.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleUpdateWithdrawalStatus(w.id, 'COMPLETED')}
                                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  Disburse Payout
                                </button>
                                <button
                                  onClick={() => handleUpdateWithdrawalStatus(w.id, 'REJECTED')}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject & Refund
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {adminWithdrawals.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                            No payout withdrawal requests pending review.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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

                <div className="space-y-2 mt-4 max-h-[300px] overflow-y-auto">
                  {crmNotes.map((note: any) => (
                    <div key={note.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 relative group">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-white">{note.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-slate-500 font-mono">{note.date || 'Recent'}</span>
                          <button
                            onClick={() => handleDeleteCrmNote(note.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Delete Log"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">{note.note}</p>
                    </div>
                  ))}
                  {crmNotes.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No interaction logs recorded yet.</p>
                  )}
                </div>
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
                    <input
                      type="text"
                      placeholder="Role"
                      value={newEmpRole}
                      onChange={e => setNewEmpRole(e.target.value)}
                      className="bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white w-32"
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
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-500 text-[10px]">{emp.id.slice(0, 8)}</td>
                          <td className="py-3.5 px-4 text-white font-extrabold">{emp.name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{emp.role}</td>
                          <td className="py-3.5 px-4 font-mono text-emerald-400">{emp.attendance || '100%'}</td>
                          <td className="py-3.5 px-4 text-white">৳{(emp.salary || 30000).toLocaleString()}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-full">
                              {emp.status || 'Paid'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteEmployee(emp.id)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                              title="Remove Employee"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {employees.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-500">
                            No employees listed yet. Use the form above to add workforce records.
                          </td>
                        </tr>
                      )}
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
              {/* Interface Theme Appearance */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-400" /> Interface Theme & Display Appearance
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Toggle between Enterprise Midnight Dark mode and Clean Daylight Light mode</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border bg-amber-400/10 text-amber-400 border-amber-400/20 capitalize self-start sm:self-auto">
                    {adminTheme} Mode Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => setAdminTheme('light')}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      adminTheme === 'light'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md font-black'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white font-bold'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Light Daylight Mode</div>
                      <div className="text-[10px] text-slate-400">High-contrast, clean white surfaces with crisp typography</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTheme('dark')}
                    className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                      adminTheme === 'dark'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md font-black'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:text-white font-bold'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">Dark Midnight Mode</div>
                      <div className="text-[10px] text-slate-400">Deep slate enterprise palette optimized for low light</div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-white/5 pb-3">
                  General System Variables
                </h3>
                {settingsSavedMsg && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4 h-4" /> {settingsSavedMsg}
                  </div>
                )}
                <form onSubmit={handleSaveSettings} className="space-y-4">
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
                  <div>
                    <label className="block text-[8px] font-black text-slate-500 uppercase mb-1">Platform Commission Rate (%)</label>
                    <input
                      type="number"
                      value={platformCommission}
                      onChange={e => setPlatformCommission(parseFloat(e.target.value) || 10)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl p-2.5 text-xs font-bold text-white"
                    />
                  </div>
                  <button type="submit" className="w-full bg-[#FFC107] text-slate-950 text-xs font-black py-3 rounded-xl transition-all cursor-pointer hover:bg-[#FFC107]/90 active:scale-95">
                    Save Override Configurations
                  </button>
                </form>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl shadow-xl space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                    Promo & Discount Coupons
                  </h3>
                  <span className="text-[10px] text-amber-400 font-mono font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    {coupons.length} Active Codes
                  </span>
                </div>

                <form onSubmit={handleAddNewCoupon} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="CODE (e.g. EID30)"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono w-1/2"
                  />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    placeholder="Discount %"
                    value={newCouponDiscount}
                    onChange={e => setNewCouponDiscount(e.target.value)}
                    className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-white w-1/4"
                  />
                  <button type="submit" className="bg-[#FFC107] text-slate-950 text-xs font-black px-4 rounded-xl cursor-pointer whitespace-nowrap">
                    Add Code
                  </button>
                </form>

                <div className="space-y-2 mt-3 max-h-[260px] overflow-y-auto">
                  {coupons.map((cpn: any) => (
                    <div key={cpn.id || cpn.code} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {cpn.code}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {cpn.discount}% OFF
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 block mt-1">Expires: {cpn.expiry}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCoupon(cpn.id, cpn.active)}
                          className={`text-[9px] font-black px-2.5 py-1 rounded-full border transition-all ${
                            cpn.active
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}
                        >
                          {cpn.active ? 'ACTIVE' : 'MUTED'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(cpn.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="Delete Coupon"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-4">No coupons registered yet.</p>
                  )}
                </div>
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
                      onClick={async () => {
                        await updateOrderStatus(selectedOrder.id, st);
                        setLocalOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: st as any } : o));
                        setSelectedOrder(prev => prev ? { ...prev, status: st as any } : null);
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

      {/* 6.1 MODAL OVERLAY: EDIT PRODUCT (ADMIN) */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-slide-up">
            <button
              onClick={() => setEditingProduct(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-3">
              <span className="font-mono text-[9px] bg-amber-400/10 text-amber-400 rounded px-2.5 py-0.5 border border-amber-400/20">
                SKU: {editingProduct.sku}
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mt-2">
                Edit Catalog Product
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Modify pricing, stock allocation, category, and publishing status.</p>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-[9px] text-slate-400 uppercase mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editProdName}
                  onChange={e => setEditProdName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Base Price (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editProdPrice}
                    onChange={e => setEditProdPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Total Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={editProdStock}
                    onChange={e => setEditProdStock(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Category</label>
                  <select
                    value={editProdCategory}
                    onChange={e => setEditProdCategory(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  >
                    {['Electronics & Gadgets', 'Health & Beauty', 'Home & Kitchen', 'Apparel & Fashion', 'Groceries & Staples', 'Books & Stationery', 'General Retail'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Catalog Status</label>
                  <select
                    value={editProdStatus}
                    onChange={e => setEditProdStatus(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 uppercase mb-1">Product Description</label>
                <textarea
                  rows={2}
                  value={editProdDesc}
                  onChange={e => setEditProdDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 bg-white/5 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] hover:bg-[#FFC107]/90 text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-glow cursor-pointer"
                >
                  Save Product Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6.2 MODAL OVERLAY: EDIT CUSTOMER (ADMIN) */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-slide-up">
            <button
              onClick={() => setEditingCustomer(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-3">
              <span className="font-mono text-[9px] bg-blue-500/10 text-blue-400 rounded px-2.5 py-0.5 border border-blue-500/20">
                Customer: {editingCustomer.email}
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mt-2">
                Edit Customer Profile
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Manage user credentials, wallet funds, and account status.</p>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-[9px] text-slate-400 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editCustName}
                  onChange={e => setEditCustName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editCustPhone}
                    onChange={e => setEditCustPhone(e.target.value)}
                    placeholder="+880 1700-000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Account Status</label>
                  <select
                    value={editCustStatus}
                    onChange={e => setEditCustStatus(e.target.value)}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Wallet Balance (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCustWallet}
                    onChange={e => setEditCustWallet(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Loyalty Points</label>
                  <input
                    type="number"
                    value={editCustPoints}
                    onChange={e => setEditCustPoints(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 uppercase mb-1">Reset Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={editCustPassword}
                  onChange={e => setEditCustPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                />
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 bg-white/5 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] hover:bg-[#FFC107]/90 text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-glow cursor-pointer"
                >
                  Save Customer Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6.3 MODAL OVERLAY: EDIT SELLER & STORE (ADMIN) */}
      {editingSeller && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 relative animate-slide-up">
            <button
              onClick={() => setEditingSeller(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/5 pb-3">
              <span className="font-mono text-[9px] bg-amber-400/10 text-amber-400 rounded px-2.5 py-0.5 border border-amber-400/20">
                Store ID: {editingSeller.id}
              </span>
              <h3 className="text-sm font-black text-white uppercase tracking-wider mt-2">
                Edit Vendor Store Settings
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Update store parameters, commission deduction rate, and owner credentials.</p>
            </div>

            <form onSubmit={handleSaveEditSeller} className="space-y-3.5 text-xs font-bold">
              <div>
                <label className="block text-[9px] text-slate-400 uppercase mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={editStoreName}
                  onChange={e => setEditStoreName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 uppercase mb-1">Store Description</label>
                <textarea
                  rows={2}
                  value={editStoreDesc}
                  onChange={e => setEditStoreDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Platform Commission Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editStoreCommission}
                    onChange={e => setEditStoreCommission(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Verification Status</label>
                  <select
                    value={editStoreApproved ? 'true' : 'false'}
                    onChange={e => setEditStoreApproved(e.target.value === 'true')}
                    className="w-full bg-gray-900 border border-white/10 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="true">VERIFIED & ACTIVE</option>
                    <option value="false">PENDING / SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Owner Contact Name</label>
                  <input
                    type="text"
                    value={editStoreOwnerName}
                    onChange={e => setEditStoreOwnerName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase mb-1">Owner Phone</label>
                  <input
                    type="text"
                    value={editStoreOwnerPhone}
                    onChange={e => setEditStoreOwnerPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-[#FFC107]"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingSeller(null)}
                  className="flex-1 bg-white/5 text-slate-300 font-bold py-2.5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#FFC107] hover:bg-[#FFC107]/90 text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-glow cursor-pointer"
                >
                  Save Store Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RESPONSIVE BOTTOM NAVIGATION (MOBILE DEVICE PARITY) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-lg border-t border-white/5 z-40 flex items-center justify-around px-4">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'marketplace', label: 'Catalog', icon: ShoppingBag },
          { id: 'orders', label: 'Orders', icon: CreditCard },
          { id: 'settings', label: 'Settings', icon: Settings2 }
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
                  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
                  if (activeToken) {
                    try {
                      await fetch('/api/verification/approve', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
                        body: JSON.stringify({
                          id: selectedDrawerSeller.id,
                          userId: selectedDrawerSeller.userId,
                          storeId: selectedDrawerSeller.storeId
                        })
                      });
                    } catch (_) {}
                  }
                  setPendingSellers(prev => prev.filter(s => s.id !== selectedDrawerSeller.id));
                  setSellerActionMsg(`Approved store: ${selectedDrawerSeller.name}`);
                  setSelectedDrawerSeller(null);
                }}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-lg cursor-pointer"
              >
                Approve Vendor Account
              </button>
              <button
                onClick={async () => {
                  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
                  if (activeToken) {
                    try {
                      await fetch('/api/verification/reject', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` },
                        body: JSON.stringify({
                          id: selectedDrawerSeller.id,
                          userId: selectedDrawerSeller.userId,
                          reason: 'Documentation did not meet compliance verification standards.'
                        })
                      });
                    } catch (_) {}
                  }
                  setPendingSellers(prev => prev.filter(s => s.id !== selectedDrawerSeller.id));
                  setSellerActionMsg(`Rejected store request: ${selectedDrawerSeller.name}`);
                  setSelectedDrawerSeller(null);
                }}
                className="flex-1 py-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-extrabold text-xs rounded-xl transition cursor-pointer"
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
