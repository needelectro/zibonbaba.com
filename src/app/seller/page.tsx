'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Store, TrendingUp, Package, ShoppingBag, Boxes, Users, DollarSign,
  CreditCard, Bell, Settings, Plus, Search, Filter, ArrowUpRight,
  ArrowRight, ArrowLeft, Clock, CheckCircle2, AlertTriangle, XCircle,
  AlertCircle, Trash2, Edit, Eye, LogOut, RefreshCw, ExternalLink,
  ShieldCheck, ShieldAlert, Upload, Image as ImageIcon, ChevronRight,
  ChevronDown, Calendar, Download, Phone, Mail, MapPin, SlidersHorizontal,
  Layers, Lock, Check, X, Menu, Sparkles, Percent, Truck, Info,
  FileText, HelpCircle, Send, UserPlus, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';

type SellerTab =
  | 'dashboard'
  | 'store'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'finance'
  | 'staff'
  | 'notifications'
  | 'settings';

interface StoreProfile {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  commissionRate: number;
  isApproved: boolean;
  createdAt: string;
  productsCount: number;
  ordersCount: number;
  phone: string;
  supportEmail: string;
  address: string;
  city: string;
  district: string;
  businessHours: string;
  returnPolicy: string;
  shippingPolicy: string;
  socialLinks: { facebook?: string; instagram?: string; website?: string };
  owner: {
    id: string;
    email: string;
    phone?: string;
    fullName: string;
    status: string;
    avatar?: string;
  };
}

interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  categoryId?: string;
  sku: string;
  stock: number;
  totalSold: number;
  rating: number;
  status: string;
  image?: string | null;
  images: string[];
  specifications?: Record<string, string>;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  categoryName: string;
  sku: string;
  price: number;
  stock: number;
  reorderPoint: number;
  totalSold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  status: 'HEALTHY' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  image?: string | null;
  lastUpdated: string;
}

interface OrderItem {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  subTotal: number;
  total: number;
  platformFee: number;
  sellerPayout: number;
  commissionRate: number;
  status: string;
  version: number;
  source: string;
  deliveryRider?: { name: string; phone: string; status: string } | null;
  statusHistory?: { previousStatus: string; newStatus: string; changedByName: string; date: string }[];
  items: {
    id: string;
    product: { id: string; name: string; price: number; sku: string; image?: string | null };
    quantity: number;
    price: number;
    total: number;
  }[];
}

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  recentOrders: { id: string; date: string; total: number; status: string; itemCount: number }[];
}

interface PayoutRecord {
  id: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  status: string;
  date: string;
  notes?: string;
  adminNote?: string;
  transactionRef?: string;
  processedAt?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  priority: string;
  module: string;
  createdAt: string;
}

interface StaffMember {
  id: string;
  jobTitle: string;
  permissions: string;
  isActive: boolean;
  user: {
    id: string;
    email: string;
    phone?: string;
    profile?: { fullName?: string };
  };
}

export default function SellerPortalPage() {
  const router = useRouter();
  const { isLoggedIn, role, logout } = useStore();

  const [activeTab, setActiveTab] = useState<SellerTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Core Data States
  const [store, setStore] = useState<StoreProfile | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);

  // Finance & Wallet State
  const [financeData, setFinanceData] = useState<{
    availableBalance: number;
    pendingBalance: number;
    totalWithdrawn: number;
    pendingWithdrawalAmount: number;
    totalGrossSales: number;
    platformCommission: number;
    commissionRate: number;
    payouts: PayoutRecord[];
    commissionBreakdown: any[];
  }>({
    availableBalance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0,
    pendingWithdrawalAmount: 0,
    totalGrossSales: 0,
    platformCommission: 0,
    commissionRate: 8.5,
    payouts: [],
    commissionBreakdown: []
  });

  // Analytics & Date Range Filter
  const [analyticsRange, setAnalyticsRange] = useState<'today' | '7d' | '30d' | '3m' | '12m'>('30d');
  const [analyticsKpis, setAnalyticsKpis] = useState<{
    totalGrossSales: number;
    netEarnings: number;
    platformCommission: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalProducts: number;
    lowStockCount: number;
    totalCustomers: number;
  }>({
    totalGrossSales: 0,
    netEarnings: 0,
    platformCommission: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0
  });
  const [salesTrend, setSalesTrend] = useState<{ label: string; sales: number; orders: number }[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');
  const [productStatusFilter, setProductStatusFilter] = useState('ALL');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'ALL' | 'LOW' | 'OUT_OF_STOCK'>('ALL');

  const [customerSearch, setCustomerSearch] = useState('');

  // Modals & Drawers State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [inspectingOrder, setInspectingOrder] = useState<OrderItem | null>(null);
  const [inspectingCustomer, setInspectingCustomer] = useState<CustomerRecord | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState<{ variantId: string; sku: string; currentStock: number } | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Forms State
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: 'Electronics & Gadgets',
    sku: '',
    stock: '25',
    description: '',
    image: '',
    images: [] as string[]
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const [stockEditQty, setStockEditQty] = useState('');
  const [stockEditNote, setStockEditNote] = useState('');

  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    paymentMethod: 'bKash',
    accountNumber: '',
    accountDetails: '',
    notes: ''
  });
  const [submittingPayout, setSubmittingPayout] = useState(false);

  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    jobTitle: 'Store Manager',
    permissions: ['products', 'orders', 'inventory']
  });

  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    phone: '',
    supportEmail: '',
    address: '',
    city: '',
    district: '',
    businessHours: '',
    returnPolicy: '',
    shippingPolicy: '',
    facebook: '',
    instagram: '',
    website: ''
  });
  const [savingStore, setSavingStore] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const storeLogoInputRef = useRef<HTMLInputElement | null>(null);
  const storeBannerInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
        setStore(data.store);
        setStoreForm({
          name: data.store.name || '',
          description: data.store.description || '',
          logo: data.store.logo || '',
          banner: data.store.banner || '',
          phone: data.store.phone || '',
          supportEmail: data.store.supportEmail || '',
          address: data.store.address || '',
          city: data.store.city || '',
          district: data.store.district || '',
          businessHours: data.store.businessHours || '',
          returnPolicy: data.store.returnPolicy || '',
          shippingPolicy: data.store.shippingPolicy || '',
          facebook: data.store.socialLinks?.facebook || '',
          instagram: data.store.socialLinks?.instagram || '',
          website: data.store.socialLinks?.website || ''
        });
      }
    } catch (_) {}
  }, []);

  // 2. Fetch Isolated Products
  const fetchProducts = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (_) {}
  }, []);

  // 3. Fetch Isolated Inventory
  const fetchInventory = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/inventory', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.items)) {
        setInventory(data.items);
      }
    } catch (_) {}
  }, []);

  // 4. Fetch Isolated Orders
  const fetchOrders = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.orders)) {
        setOrders(data.orders);
      }
    } catch (_) {}
  }, []);

  // 5. Fetch Isolated Customers
  const fetchCustomers = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/customers', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.customers)) {
        setCustomers(data.customers);
      }
    } catch (_) {}
  }, []);

  // 6. Fetch Finance & Payouts
  const fetchFinance = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/wallet', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setFinanceData({
          availableBalance: data.availableBalance || 0,
          pendingBalance: data.pendingBalance || 0,
          totalWithdrawn: data.totalWithdrawn || 0,
          pendingWithdrawalAmount: data.pendingWithdrawalAmount || 0,
          totalGrossSales: data.totalGrossSales || 0,
          platformCommission: data.platformCommission || 0,
          commissionRate: data.commissionRate || 8.5,
          payouts: Array.isArray(data.payouts) ? data.payouts : [],
          commissionBreakdown: Array.isArray(data.commissionBreakdown) ? data.commissionBreakdown : []
        });
      }
    } catch (_) {}
  }, []);

  // 7. Fetch Analytics with Range
  const fetchAnalytics = useCallback(async (rangeStr = analyticsRange) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/seller/analytics?range=${rangeStr}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.kpis) {
        setAnalyticsKpis(data.kpis);
        if (Array.isArray(data.salesTrend)) setSalesTrend(data.salesTrend);
        if (Array.isArray(data.bestSellers)) setBestSellers(data.bestSellers);
      }
    } catch (_) {}
  }, [analyticsRange]);

  // 8. Fetch Notifications
  const fetchNotifications = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/notifications', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (_) {}
  }, []);

  // 9. Fetch Staff
  const fetchStaff = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/staff', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.staff)) {
        setStaffList(data.staff);
      }
    } catch (_) {}
  }, []);

  // Initial load
  useEffect(() => {
    setIsMounted(true);
    const token = getAuthToken();
    if (token) {
      setLoading(true);
      Promise.all([
        fetchStoreProfile(),
        fetchProducts(),
        fetchInventory(),
        fetchOrders(),
        fetchCustomers(),
        fetchFinance(),
        fetchAnalytics('30d'),
        fetchNotifications(),
        fetchStaff()
      ]).finally(() => setLoading(false));
    }
  }, [fetchStoreProfile, fetchProducts, fetchInventory, fetchOrders, fetchCustomers, fetchFinance, fetchAnalytics, fetchNotifications, fetchStaff]);

  // Image Upload helper
  const handleFileUpload = async (file: File): Promise<string | null> => {
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image file size must be less than 5MB.', 'error');
      return null;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', 'products');
    formData.append('folder', 'seller');

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok && data.url) return data.url;
      // Fallback base64
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    } catch (_) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name.trim() || !newProd.price.trim()) {
      showToast('Product name and price are required.', 'error');
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    setSubmittingProduct(true);
    try {
      const res = await fetch('/api/seller/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newProd.name.trim(),
          price: parseFloat(newProd.price),
          discountPrice: newProd.discountPrice ? parseFloat(newProd.discountPrice) : null,
          category: newProd.category,
          sku: newProd.sku.trim() || undefined,
          stock: parseInt(newProd.stock, 10) || 20,
          description: newProd.description.trim() || undefined,
          image: newProd.image || (newProd.images[0] || null),
          images: newProd.images.length > 0 ? newProd.images : (newProd.image ? [newProd.image] : [])
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Product added to your store successfully!');
        setIsAddProductOpen(false);
        setNewProd({
          name: '',
          price: '',
          discountPrice: '',
          category: 'Electronics & Gadgets',
          sku: '',
          stock: '25',
          description: '',
          image: '',
          images: []
        });
        fetchProducts();
        fetchInventory();
        fetchAnalytics();
      } else {
        showToast(data.error || 'Failed to create product.', 'error');
      }
    } catch (_) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Edit Product Submit
  const handleEditProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const token = getAuthToken();
    if (!token) return;

    setSubmittingProduct(true);
    try {
      const res = await fetch(`/api/seller/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editingProduct.name.trim(),
          price: Number(editingProduct.price),
          discountPrice: editingProduct.discountPrice ? Number(editingProduct.discountPrice) : null,
          stock: Number(editingProduct.stock),
          category: editingProduct.category,
          status: editingProduct.status,
          description: editingProduct.description,
          image: editingProduct.image || (editingProduct.images[0] || null),
          images: editingProduct.images
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Product updated successfully!');
        setEditingProduct(null);
        fetchProducts();
        fetchInventory();
      } else {
        showToast(data.error || 'Failed to update product.', 'error');
      }
    } catch (_) {
      showToast('Connection error. Please try again.', 'error');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/seller/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Product removed from catalog.');
        setDeletingProductId(null);
        fetchProducts();
        fetchInventory();
        fetchAnalytics();
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete product.', 'error');
      }
    } catch (_) {
      showToast('Connection error.', 'error');
    }
  };

  // Quick Stock Adjustment
  const handleStockAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStockModalOpen || stockEditQty === '') return;
    const token = getAuthToken();
    if (!token) return;

    try {
      const res = await fetch('/api/seller/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          variantId: isStockModalOpen.variantId,
          quantity: parseInt(stockEditQty, 10),
          note: stockEditNote || undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Stock updated to ${stockEditQty} units.`);
        setIsStockModalOpen(null);
        setStockEditQty('');
        setStockEditNote('');
        fetchInventory();
        fetchProducts();
      } else {
        showToast(data.error || 'Failed to update stock.', 'error');
      }
    } catch (_) {
      showToast('Connection error.', 'error');
    }
  };

  // Update Order Status Transition
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, expectedVersion: number) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          expectedVersion
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Order status updated to ${newStatus}.`);
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder(prev => prev ? { ...prev, status: newStatus, version: prev.version + 1 } : null);
        }
        fetchOrders();
        fetchAnalytics();
        fetchFinance();
      } else {
        showToast(data.error || 'Could not update order status.', 'error');
      }
    } catch (_) {
      showToast('Connection error.', 'error');
    }
  };

  // Request Payout Submit
  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!payoutForm.amount || parseFloat(payoutForm.amount) <= 0) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }
    if (!payoutForm.accountNumber.trim()) {
      showToast('Account or mobile wallet number is required.', 'error');
      return;
    }

    setSubmittingPayout(true);
    try {
      const res = await fetch('/api/seller/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payoutForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Withdrawal request submitted for review!');
        setIsPayoutModalOpen(false);
        setPayoutForm({ amount: '', paymentMethod: 'bKash', accountNumber: '', accountDetails: '', notes: '' });
        fetchFinance();
      } else {
        showToast(data.error || 'Failed to submit withdrawal request.', 'error');
      }
    } catch (_) {
      showToast('Connection error.', 'error');
    } finally {
      setSubmittingPayout(false);
    }
  };

  // Save Store Settings
  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    setSavingStore(true);
    try {
      const res = await fetch('/api/seller/store', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: storeForm.name,
          description: storeForm.description,
          logo: storeForm.logo,
          banner: storeForm.banner,
          phone: storeForm.phone,
          supportEmail: storeForm.supportEmail,
          address: storeForm.address,
          city: storeForm.city,
          district: storeForm.district,
          businessHours: storeForm.businessHours,
          returnPolicy: storeForm.returnPolicy,
          shippingPolicy: storeForm.shippingPolicy,
          socialLinks: {
            facebook: storeForm.facebook,
            instagram: storeForm.instagram,
            website: storeForm.website
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Store settings updated successfully!');
        fetchStoreProfile();
      } else {
        showToast(data.error || 'Failed to update store settings.', 'error');
      }
    } catch (_) {
      showToast('Connection error.', 'error');
    } finally {
      setSavingStore(false);
    }
  };

  // Add Staff Member
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!token) return;

    if (!staffForm.fullName.trim() || !staffForm.email.trim()) {
      showToast('Staff name and email are required.', 'error');
      return;
    }

    try {
      const res = await fetch('/api/seller/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(staffForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Staff member "${staffForm.fullName}" registered!`);
        setIsAddStaffOpen(false);
        setStaffForm({ fullName: '', email: '', phone: '', jobTitle: 'Store Manager', permissions: ['products', 'orders', 'inventory'] });
        fetchStaff();
      } else {
        showToast(data.error || 'Failed to add staff member.', 'error');
      }
    } catch (_) {
      showToast('Connection error.', 'error');
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch('/api/seller/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ markAllAsRead: true })
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadNotifications(0);
        showToast('All notifications marked as read.');
      }
    } catch (_) {}
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCat = productCategoryFilter === 'ALL' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
      const matchesStatus = productStatusFilter === 'ALL' || p.status.toUpperCase() === productStatusFilter.toUpperCase();
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [products, productSearch, productCategoryFilter, productStatusFilter]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch = !inventorySearch ||
        item.productName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.sku.toLowerCase().includes(inventorySearch.toLowerCase()) ||
        item.categoryName.toLowerCase().includes(inventorySearch.toLowerCase());
      const matchesFilter =
        inventoryFilter === 'ALL' ||
        (inventoryFilter === 'LOW' && item.isLowStock) ||
        (inventoryFilter === 'OUT_OF_STOCK' && item.isOutOfStock);
      return matchesSearch && matchesFilter;
    });
  }, [inventory, inventorySearch, inventoryFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch = !orderSearch ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customerPhone.toLowerCase().includes(orderSearch.toLowerCase());
      const matchesStatus = orderStatusFilter === 'ALL' || o.status.toUpperCase() === orderStatusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Filtered Customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!customerSearch) return true;
      const q = customerSearch.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q);
    });
  }, [customers, customerSearch]);

  if (!isMounted) return null;

  // Unauthenticated Guard
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[130px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-yellow-400/10 blur-[130px] pointer-events-none" />
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center text-white backdrop-blur-xl shadow-2xl relative z-10">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-5 border border-amber-500/20 shadow-glow">
            <Store className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 mb-3">
            <Sparkles size={13} /> Zibonbaba Seller Center
          </div>
          <h1 className="text-2xl font-black mb-2 tracking-tight">Merchant Account Required</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Please log in with your verified merchant credentials to access your isolated store dashboard.
          </p>
          <div className="space-y-3">
            <Link
              href="/seller/login"
              className="bg-amber-400 text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full shadow-glow hover:bg-amber-300 transition-all duration-200"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to Seller Account</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </Link>
            <Link
              href="/seller/register"
              className="bg-white/5 hover:bg-white/10 text-white font-bold text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full border border-white/10 transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Register New Store</span>
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-8 max-w-md w-full text-center text-white backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-5 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2">Merchant Role Required</h1>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            You are logged in with a Customer profile. To open your own store and manage products, please register for a merchant account.
          </p>
          <div className="space-y-3">
            <Link
              href="/seller/register"
              className="bg-amber-400 text-gray-950 font-black text-sm px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 w-full hover:bg-amber-300 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply for Seller Account</span>
            </Link>
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-white pt-2 block w-full text-center transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPendingApproval = store ? !store.isApproved : false;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border animate-in slide-in-from-top-2 ${
          toastMessage.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 backdrop-blur-md'
            : toastMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 backdrop-blur-md'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 backdrop-blur-md'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 size={16} />}
          {toastMessage.type === 'error' && <AlertCircle size={16} />}
          {toastMessage.type === 'info' && <Info size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="h-16 border-b border-white/10 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            <Menu size={18} />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-950 text-base shadow-glow">
              Z
            </div>
            <span className="font-extrabold text-lg tracking-tight text-white hidden sm:inline">
              Zibon<span className="text-amber-400">baba</span>
            </span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            Seller Center
          </span>
        </div>

        {/* Store Name & Quick Status */}
        <div className="flex items-center gap-3">
          {store && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <Store size={14} className="text-amber-400" />
              <span className="font-bold text-white max-w-[150px] truncate">{store.name}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                store.isApproved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {store.isApproved ? 'Verified Store' : 'Pending Review'}
              </span>
            </div>
          )}

          {/* Notifications Shortcut */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Notifications"
          >
            <Bell size={16} />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* Public Store Link */}
          {store?.id && (
            <Link
              href={`/store/${store.id}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 text-xs font-bold transition-all"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              router.push('/seller/login');
            }}
            className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors text-xs flex items-center gap-1.5 font-bold"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Verification Notice Banner if Pending Review */}
      {isPendingApproval && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Store Application Under Review:</strong> Your store application is currently undergoing platform verification. You can set up your catalog, brand assets, and store policies while our compliance team completes the review.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('store')}
            className="text-amber-400 font-bold hover:underline shrink-0 flex items-center gap-1"
          >
            Review Store Profile <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Main Container with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className="w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-md hidden md:flex flex-col justify-between p-4 shrink-0 overflow-y-auto">
          <div className="space-y-6">
            {/* Store Quick Badge */}
            {store && (
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 font-black shrink-0 overflow-hidden">
                  {store.logo ? (
                    <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    store.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-white text-xs truncate">{store.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono truncate">{store.phone || store.owner?.email}</p>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <TrendingUp size={16} />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('store')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'store'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Store size={16} />
                <span>My Store</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'products'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package size={16} />
                  <span>Products</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'products' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}>
                  {products.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Boxes size={16} />
                  <span>Inventory</span>
                </div>
                {inventory.some(i => i.isLowStock || i.isOutOfStock) && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} />
                  <span>Orders</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  activeTab === 'orders' ? 'bg-slate-950/20 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}>
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'customers'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={16} />
                <span>Customers</span>
              </button>

              <button
                onClick={() => setActiveTab('finance')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'finance'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <DollarSign size={16} />
                <span>Finance & Payouts</span>
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'staff'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users size={16} />
                <span>Employees / Staff</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell size={16} />
                  <span>Notifications</span>
                </div>
                {unreadNotifications > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-amber-400 text-slate-950 shadow-glow font-extrabold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Commission & Support footer badge */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="p-3 rounded-xl bg-amber-400/5 border border-amber-400/20 text-xs">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-1">
                <span>Commission Rate</span>
                <span>{financeData.commissionRate || 8.5}%</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Platform rate per completed order fulfillment.
              </p>
            </div>
            <Link
              href="/contact"
              className="text-[11px] text-slate-400 hover:text-amber-400 transition-colors flex items-center justify-center gap-1.5 py-1"
            >
              <HelpCircle size={13} /> Merchant Support Desk
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm flex">
            <div className="w-72 bg-slate-900 border-r border-white/10 p-5 flex flex-col justify-between animate-in slide-in-from-left">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center font-black text-slate-950">
                      Z
                    </div>
                    <span className="font-extrabold text-white text-sm">Seller Center</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
                    { id: 'store', label: 'My Store', icon: Store },
                    { id: 'products', label: 'Products', icon: Package },
                    { id: 'inventory', label: 'Inventory', icon: Boxes },
                    { id: 'orders', label: 'Orders', icon: ShoppingBag },
                    { id: 'customers', label: 'Customers', icon: Users },
                    { id: 'finance', label: 'Finance & Payouts', icon: DollarSign },
                    { id: 'staff', label: 'Employees', icon: Users },
                    { id: 'notifications', label: 'Notifications', icon: Bell },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as SellerTab);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                          activeTab === tab.id
                            ? 'bg-amber-400 text-slate-950 font-black'
                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    logout();
                    router.push('/seller/login');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-500/10 text-rose-400 font-bold text-xs"
                >
                  <LogOut size={15} /> Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* ========================================================================= */}
          {/* 1. DASHBOARD & ANALYTICS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Header Title + Range Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <span>Performance Analytics</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Live isolated statistics for <strong className="text-white">{store?.name || 'Your Store'}</strong>.
                  </p>
                </div>

                {/* Range Filter Buttons */}
                <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-2xl self-start sm:self-auto text-xs">
                  {(['today', '7d', '30d', '3m', '12m'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setAnalyticsRange(r);
                        fetchAnalytics(r);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all uppercase text-[11px] ${
                        analyticsRange === r
                          ? 'bg-amber-400 text-slate-950 font-black shadow-glow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8 Primary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Total Gross Sales</span>
                    <DollarSign size={15} className="text-amber-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    ৳{analyticsKpis.totalGrossSales.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">All processed sales volume</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Net Seller Earnings</span>
                    <TrendingUp size={15} className="text-emerald-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-400 tracking-tight">
                    ৳{analyticsKpis.netEarnings.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">After {financeData.commissionRate}% platform fee</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Total Orders</span>
                    <ShoppingBag size={15} className="text-amber-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    {analyticsKpis.totalOrders}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{analyticsKpis.completedOrders} completed</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Pending Orders</span>
                    <Clock size={15} className="text-amber-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-amber-400 tracking-tight">
                    {analyticsKpis.pendingOrders}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Awaiting merchant processing</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Live Products</span>
                    <Package size={15} className="text-amber-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    {analyticsKpis.totalProducts}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Active SKUs in catalog</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Low Stock Alerts</span>
                    <AlertTriangle size={15} className="text-rose-400" />
                  </div>
                  <div className={`text-lg sm:text-2xl font-black tracking-tight ${
                    analyticsKpis.lowStockCount > 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {analyticsKpis.lowStockCount}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Items at or below reorder level</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Total Customers</span>
                    <Users size={15} className="text-amber-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                    {analyticsKpis.totalCustomers}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Unique verified buyers</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Available Payout</span>
                    <CreditCard size={15} className="text-emerald-400" />
                  </div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-400 tracking-tight">
                    ৳{financeData.availableBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Ready for withdrawal</div>
                </div>
              </div>

              {/* Real Revenue & Order Trend Visualizer */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp size={18} className="text-amber-400" />
                      Sales & Revenue Trajectory ({analyticsRange.toUpperCase()})
                    </h3>
                    <p className="text-xs text-slate-400">Time-bucketed revenue metrics for this store.</p>
                  </div>
                </div>

                {salesTrend.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-500">
                    No orders recorded for this period yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Bar chart presentation */}
                    <div className="h-48 flex items-end gap-1.5 sm:gap-2 pt-6">
                      {(() => {
                        const maxVal = Math.max(...salesTrend.map(t => t.sales), 100);
                        return salesTrend.map((t, idx) => {
                          const heightPct = Math.max(8, Math.round((t.sales / maxVal) * 100));
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 bg-slate-950 border border-white/10 px-2 py-1 rounded-lg text-[10px] text-white whitespace-nowrap pointer-events-none shadow-xl">
                                <strong>৳{t.sales.toLocaleString()}</strong> ({t.orders} orders)
                              </div>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full rounded-t-md transition-all group-hover:bg-amber-300 ${
                                  t.sales > 0 ? 'bg-amber-400' : 'bg-white/10'
                                }`}
                              />
                              <span className="text-[9px] text-slate-400 truncate w-full text-center hidden sm:block">
                                {t.label}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Best Selling Products & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Best Sellers */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl">
                  <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-400" />
                    Top Performing Products
                  </h3>
                  {bestSellers.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No sales recorded yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {bestSellers.map((item, idx) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-400 font-black text-[11px] flex items-center justify-center">
                              #{idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-white truncate max-w-[200px]">{item.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{item.sku}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-400">৳{item.revenue.toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400">{item.unitsSold} units sold</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Merchant Actions */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Layers size={16} className="text-amber-400" />
                      Quick Merchant Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setIsAddProductOpen(true)}
                        className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 hover:bg-amber-400/20 transition-all text-xs font-bold flex flex-col items-center justify-center gap-2 text-center"
                      >
                        <Plus size={20} />
                        <span>Add New Product</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('inventory')}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-bold flex flex-col items-center justify-center gap-2 text-center"
                      >
                        <Boxes size={20} className="text-amber-400" />
                        <span>Update Inventory</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all text-xs font-bold flex flex-col items-center justify-center gap-2 text-center"
                      >
                        <ShoppingBag size={20} className="text-amber-400" />
                        <span>Fulfill Orders</span>
                      </button>
                      <button
                        onClick={() => setIsPayoutModalOpen(true)}
                        className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all text-xs font-bold flex flex-col items-center justify-center gap-2 text-center"
                      >
                        <CreditCard size={20} />
                        <span>Request Payout</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span>Store Status: <strong className="text-white">{store?.isApproved ? 'Approved' : 'Pending'}</strong></span>
                    {store?.id && (
                      <Link href={`/store/${store.id}`} target="_blank" className="text-amber-400 hover:underline flex items-center gap-1 font-bold">
                        View Store <ExternalLink size={12} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. MY STORE MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Store className="text-amber-400" /> Store Profile & Settings
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage your public storefront branding, contact information, operating hours, and customer policies.
                  </p>
                </div>
                {store?.id && (
                  <Link
                    href={`/store/${store.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-glow hover:bg-amber-300 transition-all self-start sm:self-auto"
                  >
                    <span>Preview Public Store</span>
                    <ExternalLink size={14} />
                  </Link>
                )}
              </div>

              {/* Store Banner & Logo Preview */}
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                <div className="h-44 sm:h-52 w-full rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden border border-white/10">
                  {storeForm.banner ? (
                    <img src={storeForm.banner} alt="Cover Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <span>No Store Banner Uploaded</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <input
                      type="file"
                      ref={storeBannerInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setStoreForm(prev => ({ ...prev, banner: url }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => storeBannerInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/20 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-900"
                    >
                      <Upload size={13} /> Change Banner
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:-mt-14 px-4 sm:px-6 relative z-10">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-950 border-4 border-slate-900 overflow-hidden shadow-2xl relative group">
                    {storeForm.logo ? (
                      <img src={storeForm.logo} alt="Store Logo" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-amber-400/20 text-amber-400 font-black text-2xl">
                        {storeForm.name.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )}
                    <input
                      type="file"
                      ref={storeLogoInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) setStoreForm(prev => ({ ...prev, logo: url }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => storeLogoInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-amber-400 text-[11px] font-bold"
                    >
                      Change Logo
                    </button>
                  </div>

                  <div className="text-center sm:text-left flex-1 pb-1">
                    <h2 className="text-xl font-black text-white">{storeForm.name || 'Store Name'}</h2>
                    <p className="text-xs text-slate-400">{storeForm.description || 'Verified Zibonbaba Merchant'}</p>
                  </div>
                </div>
              </div>

              {/* Store Details Form */}
              <form onSubmit={handleSaveStoreSettings} className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Store / Business Name *</label>
                    <input
                      type="text"
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Customer Support Phone</label>
                    <input
                      type="text"
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      placeholder="+880 1XXXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Support Email Address</label>
                    <input
                      type="email"
                      value={storeForm.supportEmail}
                      onChange={(e) => setStoreForm({ ...storeForm, supportEmail: e.target.value })}
                      placeholder="support@yourstore.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">City / District</label>
                    <input
                      type="text"
                      value={storeForm.city}
                      onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                      placeholder="e.g. Dhaka"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Physical Store / Warehouse Address</label>
                    <input
                      type="text"
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      placeholder="House/Shop #, Road #, Area, District"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Store Description & Bio</label>
                    <textarea
                      rows={3}
                      value={storeForm.description}
                      onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                      placeholder="Describe your brand, specializations, and what makes your products unique..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Business / Operating Hours</label>
                    <input
                      type="text"
                      value={storeForm.businessHours}
                      onChange={(e) => setStoreForm({ ...storeForm, businessHours: e.target.value })}
                      placeholder="e.g. Sat - Thu: 9:00 AM - 9:00 PM"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Website / Facebook Link</label>
                    <input
                      type="text"
                      value={storeForm.facebook}
                      onChange={(e) => setStoreForm({ ...storeForm, facebook: e.target.value })}
                      placeholder="https://facebook.com/yourstore"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Return & Exchange Policy</label>
                    <textarea
                      rows={2}
                      value={storeForm.returnPolicy}
                      onChange={(e) => setStoreForm({ ...storeForm, returnPolicy: e.target.value })}
                      placeholder="e.g. 7 days easy return for unopened or defective products"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Shipping & Fulfillment Guarantee</label>
                    <textarea
                      rows={2}
                      value={storeForm.shippingPolicy}
                      onChange={(e) => setStoreForm({ ...storeForm, shippingPolicy: e.target.value })}
                      placeholder="e.g. Orders dispatched within 24 hours via Zibonbaba Express"
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingStore}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-glow transition-all disabled:opacity-50"
                  >
                    {savingStore ? 'Saving Changes...' : 'Save Store Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. PRODUCT MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Package className="text-amber-400" /> Products & Catalog ({filteredProducts.length})
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage SKU listings, pricing, variants, and approval states for your store.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-glow hover:bg-amber-300 transition-all self-start sm:self-auto"
                >
                  <Plus size={16} />
                  <span>Add New Product</span>
                </button>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by name, SKU, category..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="General Retail">General Retail</option>
                  </select>

                  <select
                    value={productStatusFilter}
                    onChange={(e) => setProductStatusFilter(e.target.value)}
                    className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="DRAFT">Draft</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Product Info</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Price</th>
                        <th className="py-3.5 px-4">Stock</th>
                        <th className="py-3.5 px-4">Sold</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <Package size={32} className="mx-auto mb-2 text-slate-600" />
                            <p className="font-bold text-white text-sm">No products found</p>
                            <p className="text-xs text-slate-500 mt-1">Start by adding your first product SKU.</p>
                            <button
                              onClick={() => setIsAddProductOpen(true)}
                              className="mt-3 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                            >
                              Add Product
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 overflow-hidden shrink-0">
                                  {p.image ? (
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                                      <ImageIcon size={18} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 max-w-[220px]">
                                  <h4 className="font-bold text-white truncate">{p.name}</h4>
                                  <p className="text-[10px] font-mono text-amber-400">{p.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-300">{p.category}</td>
                            <td className="py-3.5 px-4 font-bold text-white">
                              <div>৳{p.price.toLocaleString()}</div>
                              {p.discountPrice && (
                                <div className="text-[10px] text-emerald-400 line-through">৳{p.discountPrice.toLocaleString()}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4 font-bold">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stock <= 0
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : p.stock <= 5
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-300">{p.totalSold}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                p.status === 'PUBLISHED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : p.status === 'PENDING_APPROVAL'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : p.status === 'OUT_OF_STOCK'
                                  ? 'bg-rose-500/20 text-rose-400'
                                  : 'bg-slate-700 text-slate-300'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setEditingProduct(p)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                                  title="Edit Product"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => setDeletingProductId(p.id)}
                                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                                  title="Delete Product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
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

          {/* ========================================================================= */}
          {/* 4. INVENTORY MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Boxes className="text-amber-400" /> Inventory & Stock Control
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Real-time available stock, reorder thresholds, and quick stock updates.
                  </p>
                </div>
              </div>

              {/* Inventory Filter Bar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Search by SKU or product..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInventoryFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      inventoryFilter === 'ALL' ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    All Stock ({inventory.length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('LOW')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      inventoryFilter === 'LOW' ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Low Stock ({inventory.filter(i => i.isLowStock).length})
                  </button>
                  <button
                    onClick={() => setInventoryFilter('OUT_OF_STOCK')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      inventoryFilter === 'OUT_OF_STOCK' ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    Out of Stock ({inventory.filter(i => i.isOutOfStock).length})
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">SKU / Item</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Unit Price</th>
                        <th className="py-3.5 px-4">Available Stock</th>
                        <th className="py-3.5 px-4">Reorder Point</th>
                        <th className="py-3.5 px-4">Stock Health</th>
                        <th className="py-3.5 px-4 text-right">Quick Adjust</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No inventory items match your current filter.
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-white">{item.productName}</p>
                              <p className="text-[10px] font-mono text-amber-400">{item.sku}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">{item.categoryName}</td>
                            <td className="py-3.5 px-4 font-bold text-white">৳{item.price.toLocaleString()}</td>
                            <td className="py-3.5 px-4 font-black text-sm">
                              <span className={item.stock <= 0 ? 'text-rose-400' : item.stock <= 5 ? 'text-amber-400' : 'text-emerald-400'}>
                                {item.stock}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">{item.reorderPoint} units</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.status === 'HEALTHY'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : item.status === 'LOW_STOCK'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setIsStockModalOpen({
                                    variantId: item.id,
                                    sku: item.sku,
                                    currentStock: item.stock
                                  });
                                  setStockEditQty(String(item.stock));
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-400 font-bold text-xs transition-colors"
                              >
                                Adjust Stock
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

          {/* ========================================================================= */}
          {/* 5. ORDER MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <ShoppingBag className="text-amber-400" /> Customer Orders ({filteredOrders.length})
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Orders placed with your store. Fulfill, confirm, and prepare shipments.
                  </p>
                </div>
              </div>

              {/* Order Status Filters */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md space-y-3">
                <div className="relative w-full">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by Order ID (#...), buyer name, phone..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] ${
                        orderStatusFilter === st
                          ? 'bg-amber-400 text-slate-950 font-black shadow-glow'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Order ID & Date</th>
                        <th className="py-3.5 px-4">Buyer & Destination</th>
                        <th className="py-3.5 px-4">Items Summary</th>
                        <th className="py-3.5 px-4">Gross Total</th>
                        <th className="py-3.5 px-4">Net Payout</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No orders found matching your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-white font-mono">#{o.id.slice(-8).toUpperCase()}</p>
                              <p className="text-[10px] text-slate-400">{new Date(o.date).toLocaleDateString()}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-white">{o.customerName}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{o.shippingCity}</p>
                            </td>
                            <td className="py-3.5 px-4">
                              <p className="font-medium text-slate-300">{o.items.length} item(s)</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[160px]">
                                {o.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ')}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-white">৳{o.total.toLocaleString()}</td>
                            <td className="py-3.5 px-4 font-black text-emerald-400">৳{o.sellerPayout.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                o.status === 'DELIVERED' || o.status === 'COMPLETED'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : o.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : o.status === 'PROCESSING' || o.status === 'CONFIRMED'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : o.status === 'READY_FOR_DELIVERY' || o.status === 'SHIPPED'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}>
                                {o.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setInspectingOrder(o)}
                                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors flex items-center gap-1"
                                >
                                  <Eye size={13} />
                                  <span>Details</span>
                                </button>
                              </div>
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

          {/* ========================================================================= */}
          {/* 6. CUSTOMERS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="text-amber-400" /> Store Customers ({filteredCustomers.length})
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Customers who have purchased directly from your store. Strictly scoped to your orders.
                  </p>
                </div>
              </div>

              {/* Customer Search Toolbar */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customer by name, email, phone, city..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              {/* Customers Table */}
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Customer Name</th>
                        <th className="py-3.5 px-4">Contact Info</th>
                        <th className="py-3.5 px-4">Location</th>
                        <th className="py-3.5 px-4">Store Orders</th>
                        <th className="py-3.5 px-4">Lifetime Spend</th>
                        <th className="py-3.5 px-4">Last Order</th>
                        <th className="py-3.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            No customers found for your store yet.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => (
                          <tr key={c.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">{c.name}</td>
                            <td className="py-3.5 px-4">
                              <p className="text-slate-300 font-mono">{c.phone}</p>
                              <p className="text-[10px] text-slate-500">{c.email}</p>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">{c.city}</td>
                            <td className="py-3.5 px-4 font-bold text-amber-400">{c.totalOrders} order(s)</td>
                            <td className="py-3.5 px-4 font-black text-emerald-400">৳{c.totalSpent.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-slate-400">{new Date(c.lastOrderDate).toLocaleDateString()}</td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => setInspectingCustomer(c)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-xs"
                              >
                                View History
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

          {/* ========================================================================= */}
          {/* 7. FINANCE & PAYOUTS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <DollarSign className="text-amber-400" /> Financial Dashboard & Settlement
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Track gross earnings, platform commission deductions, and submit payout withdrawal requests.
                  </p>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-glow hover:bg-emerald-400 transition-all self-start sm:self-auto"
                >
                  <CreditCard size={16} />
                  <span>Request Payout</span>
                </button>
              </div>

              {/* Finance Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Available Balance</span>
                    <CreditCard size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 tracking-tight">
                    ৳{financeData.availableBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Settled from completed deliveries</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Pending Settlement</span>
                    <Clock size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 tracking-tight">
                    ৳{financeData.pendingBalance.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Orders in transit or processing</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Total Paid Out</span>
                    <CheckCircle2 size={16} className="text-slate-400" />
                  </div>
                  <div className="text-2xl font-black text-white tracking-tight">
                    ৳{financeData.totalWithdrawn.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Disbursed to your accounts</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Platform Commission</span>
                    <Percent size={16} className="text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-400 tracking-tight">
                    {financeData.commissionRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Standard marketplace rate</div>
                </div>
              </div>

              {/* Payout History & Commission Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payout Requests History */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard size={16} className="text-emerald-400" />
                      Payout Withdrawal History
                    </h3>
                  </div>

                  {financeData.payouts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No payout requests submitted yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {financeData.payouts.map((p) => (
                        <div key={p.id} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">৳{p.amount.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-400">via {p.paymentMethod}</span>
                            </div>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">Acc: {p.accountNumber}</p>
                            <p className="text-[9px] text-slate-500">{new Date(p.date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'COMPLETED' || p.status === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : p.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Commission Breakdown Ledger */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Percent size={16} className="text-amber-400" />
                    Order Commission Ledger
                  </h3>
                  {financeData.commissionBreakdown.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No order commission entries recorded yet.
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto space-y-2.5 pr-1">
                      {financeData.commissionBreakdown.map((item) => (
                        <div key={item.orderId} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-bold text-white font-mono">#{item.orderId.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-300">Gross: ৳{item.orderAmount.toLocaleString()}</p>
                            <p className="text-[10px] text-amber-400">Fee: -৳{item.commissionAmount.toLocaleString()}</p>
                            <p className="text-[11px] font-bold text-emerald-400">Net: ৳{item.netEarnings.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. EMPLOYEES & STAFF TAB */}
          {/* ========================================================================= */}
          {activeTab === 'staff' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Users className="text-amber-400" /> Store Staff & Team ({staffList.length})
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage store employees and control permissions for product uploads and inventory.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddStaffOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs shadow-glow hover:bg-amber-300 transition-all self-start sm:self-auto"
                >
                  <UserPlus size={16} />
                  <span>Add Staff Member</span>
                </button>
              </div>

              {/* Staff Table */}
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-white/5 border-b border-white/10 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-3.5 px-4">Staff Member</th>
                        <th className="py-3.5 px-4">Job Role</th>
                        <th className="py-3.5 px-4">Assigned Permissions</th>
                        <th className="py-3.5 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {staffList.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center text-slate-400">
                            No staff accounts added yet. You can invite store managers or sales assistants.
                          </td>
                        </tr>
                      ) : (
                        staffList.map((s) => (
                          <tr key={s.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-white">
                              {s.user?.profile?.fullName || s.user?.email || 'Staff Member'}
                              <p className="text-[10px] font-mono text-slate-400">{s.user?.email}</p>
                            </td>
                            <td className="py-3.5 px-4 text-amber-400 font-bold">{s.jobTitle}</td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {typeof s.permissions === 'string' ? s.permissions : 'Inventory, Orders'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                                ACTIVE
                              </span>
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

          {/* ========================================================================= */}
          {/* 9. NOTIFICATIONS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <Bell className="text-amber-400" /> Merchant Notification Center
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    System alerts regarding new customer orders, payouts, and compliance verification.
                  </p>
                </div>
                {unreadNotifications > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsRead}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-amber-400 transition-colors self-start sm:self-auto"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>

              {/* Notification List */}
              <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    <Bell size={32} className="mx-auto mb-2 text-slate-600" />
                    <span>No notifications received yet.</span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        n.isRead
                          ? 'bg-white/5 border-white/5 text-slate-400'
                          : 'bg-amber-400/5 border-amber-400/20 text-white'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{n.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-bold uppercase">
                            {n.module}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{n.body}</p>
                        <p className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>

                      {!n.isRead && (
                        <button
                          onClick={async () => {
                            const token = getAuthToken();
                            await fetch('/api/seller/notifications', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                              body: JSON.stringify({ notificationId: n.id })
                            });
                            setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, isRead: true } : item));
                            setUnreadNotifications(prev => Math.max(0, prev - 1));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold text-amber-400 shrink-0"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. SETTINGS TAB */}
          {/* ========================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <Settings className="text-amber-400" /> Account & Security Settings
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Manage your personal merchant identity, login credentials, and session security.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-6">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-amber-400" />
                  Merchant Identity Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Owner Email</label>
                    <input
                      type="text"
                      disabled
                      value={store?.owner?.email || ''}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Owner Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={store?.owner?.fullName || ''}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Account Role</label>
                    <input
                      type="text"
                      disabled
                      value="VENDOR_ADMIN (Merchant Owner)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-amber-400 font-bold cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Verification Status</label>
                    <input
                      type="text"
                      disabled
                      value={store?.isApproved ? 'VERIFIED & ACTIVE' : 'PENDING COMPLIANCE REVIEW'}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-emerald-400 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="font-bold text-white text-xs mb-2">Need to update your password or legal business entity?</h4>
                  <p className="text-xs text-slate-400 mb-4">
                    For bank verification and tax documents update, please submit a compliance ticket to the Zibonbaba merchant verification board.
                  </p>
                  <Link
                    href="/seller/forgot-password"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors"
                  >
                    <Lock size={13} className="text-amber-400" />
                    <span>Reset Account Password</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD PRODUCT */}
      {/* ========================================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-amber-400" /> Add Product SKU to Store
              </h2>
              <button onClick={() => setIsAddProductOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Selling Price (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    placeholder="2500"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newProd.discountPrice}
                    onChange={(e) => setNewProd({ ...newProd, discountPrice: e.target.value })}
                    placeholder="Optional original price"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Initial Stock Units</label>
                  <input
                    type="number"
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Books & Stationery">Books & Stationery</option>
                    <option value="General Retail">General Retail</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">SKU Code (Auto-generated if empty)</label>
                  <input
                    type="text"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    placeholder="e.g. WH-1000XM4"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Product Images Uploader */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Images (Upload or URL)</label>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={newProd.image}
                      onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                      placeholder="Paste image URL..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingImage(true);
                          const url = await handleFileUpload(file);
                          if (url) {
                            setNewProd(prev => ({
                              ...prev,
                              image: url,
                              images: [url, ...prev.images]
                            }));
                          }
                          setUploadingImage(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5"
                    >
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </div>

                  {newProd.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {newProd.images.map((img, i) => (
                        <div key={i} className="w-14 h-14 rounded-xl border border-white/10 overflow-hidden relative group shrink-0">
                          <img src={img} alt="Preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewProd(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-rose-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description & Key Features</label>
                <textarea
                  rows={3}
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="Provide detailed specifications, warranty, materials, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-glow disabled:opacity-50"
                >
                  {submittingProduct ? 'Saving SKU...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT PRODUCT */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Edit size={18} className="text-amber-400" /> Edit Product SKU: {editingProduct.sku}
              </h2>
              <button onClick={() => setEditingProduct(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Price (৳) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Discount Price (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.discountPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, discountPrice: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock Level</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Status</label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value })}
                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="PUBLISHED">PUBLISHED (Active on Marketplace)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                    <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProduct}
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-glow disabled:opacity-50"
                >
                  {submittingProduct ? 'Saving...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ORDER DETAILS & TRANSITIONS */}
      {/* ========================================================================= */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <ShoppingBag size={18} className="text-amber-400" />
                  Order #{inspectingOrder.id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-[11px] text-slate-400">Placed on {new Date(inspectingOrder.date).toLocaleString()}</p>
              </div>
              <button onClick={() => setInspectingOrder(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Customer & Fulfillment Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Customer / Recipient</span>
                <p className="font-bold text-white text-sm">{inspectingOrder.customerName}</p>
                <p className="text-slate-300 font-mono"><Phone size={12} className="inline mr-1 text-amber-400" />{inspectingOrder.customerPhone}</p>
                <p className="text-slate-400"><Mail size={12} className="inline mr-1 text-amber-400" />{inspectingOrder.customerEmail}</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Shipping Destination</span>
                <p className="text-slate-300 leading-relaxed"><MapPin size={12} className="inline mr-1 text-amber-400" />{inspectingOrder.shippingAddress}</p>
                <p className="text-[11px] text-slate-400 font-bold">City: {inspectingOrder.shippingCity}</p>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ordered Items</h4>
              <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 text-xs">
                {inspectingOrder.items.map((it) => (
                  <div key={it.id} className="p-3 bg-white/5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                        {it.product.image ? (
                          <img src={it.product.image} alt={it.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Package size={16} />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{it.product.name}</p>
                        <p className="text-[10px] font-mono text-slate-400">SKU: {it.product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">৳{it.price.toLocaleString()} × {it.quantity}</p>
                      <p className="text-[11px] font-black text-amber-400">৳{it.total.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Ledger Summary */}
            <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>৳{inspectingOrder.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-300">
                <span>Platform Commission ({inspectingOrder.commissionRate || 8.5}%)</span>
                <span>-৳{inspectingOrder.platformFee.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between font-black text-sm text-emerald-400">
                <span>Net Seller Payout</span>
                <span>৳{inspectingOrder.sellerPayout.toLocaleString()}</span>
              </div>
            </div>

            {/* Seller Permitted State Transitions */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Action / Fulfillment Transition</h4>
              <div className="flex flex-wrap gap-2">
                {inspectingOrder.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleUpdateOrderStatus(inspectingOrder.id, 'CONFIRMED', inspectingOrder.version)}
                      className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs"
                    >
                      Confirm Order
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(inspectingOrder.id, 'PROCESSING', inspectingOrder.version)}
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                    >
                      Accept & Process
                    </button>
                  </>
                )}

                {inspectingOrder.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(inspectingOrder.id, 'PROCESSING', inspectingOrder.version)}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs"
                  >
                    Start Packing & Processing
                  </button>
                )}

                {inspectingOrder.status === 'PROCESSING' && (
                  <button
                    onClick={() => handleUpdateOrderStatus(inspectingOrder.id, 'READY_FOR_DELIVERY', inspectingOrder.version)}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5"
                  >
                    <Truck size={14} />
                    <span>Mark Ready for Courier Dispatch</span>
                  </button>
                )}

                {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(inspectingOrder.status) && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel this order?')) {
                        handleUpdateOrderStatus(inspectingOrder.id, 'CANCELLED', inspectingOrder.version);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOMER HISTORY */}
      {/* ========================================================================= */}
      {inspectingCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users size={18} className="text-amber-400" /> Customer Purchase Profile
              </h2>
              <button onClick={() => setInspectingCustomer(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2 text-xs">
              <h3 className="font-black text-base text-white">{inspectingCustomer.name}</h3>
              <p className="text-slate-400 font-mono"><Phone size={12} className="inline mr-1 text-amber-400" />{inspectingCustomer.phone}</p>
              <p className="text-slate-400"><Mail size={12} className="inline mr-1 text-amber-400" />{inspectingCustomer.email}</p>
              <p className="text-slate-400"><MapPin size={12} className="inline mr-1 text-amber-400" />{inspectingCustomer.city}</p>
              <div className="pt-2 border-t border-white/10 flex justify-between font-bold">
                <span>Total Orders Placed:</span>
                <span className="text-amber-400">{inspectingCustomer.totalOrders}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total Store Spend:</span>
                <span className="text-emerald-400">৳{inspectingCustomer.totalSpent.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order History</h4>
              <div className="space-y-2 text-xs">
                {inspectingCustomer.recentOrders.map(ro => (
                  <div key={ro.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white font-mono">#{ro.id.slice(-6).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-500">{new Date(ro.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">৳{ro.total.toLocaleString()}</p>
                      <span className="text-[10px] font-bold text-amber-400 uppercase">{ro.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: QUICK STOCK ADJUSTMENT */}
      {/* ========================================================================= */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-7 max-w-sm w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Boxes size={16} className="text-amber-400" /> Adjust Stock: {isStockModalOpen.sku}
              </h3>
              <button onClick={() => setIsStockModalOpen(null)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleStockAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">New Available Stock Quantity *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockEditQty}
                  onChange={(e) => setStockEditQty(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Audit / Movement Note (Optional)</label>
                <input
                  type="text"
                  value={stockEditNote}
                  onChange={(e) => setStockEditNote(e.target.value)}
                  placeholder="e.g. Received new shipment from supplier"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(null)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-glow"
                >
                  Save Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REQUEST PAYOUT */}
      {/* ========================================================================= */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CreditCard size={18} className="text-emerald-400" /> Request Payout Withdrawal
              </h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
              <div className="flex justify-between font-bold text-emerald-400">
                <span>Available for Withdrawal:</span>
                <span>৳{financeData.availableBalance.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Minimum payout threshold: ৳500</p>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Withdrawal Amount (৳) *</label>
                <input
                  type="number"
                  min="500"
                  max={financeData.availableBalance}
                  step="1"
                  required
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  placeholder={`500 - ${financeData.availableBalance}`}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Disbursement Channel</label>
                <select
                  value={payoutForm.paymentMethod}
                  onChange={(e) => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="bKash">bKash Merchant / Personal</option>
                  <option value="Nagad">Nagad Wallet</option>
                  <option value="Rocket">Rocket (DBBL)</option>
                  <option value="Bank Transfer">Bank Electronic Transfer (BEFTN)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Account / Mobile Number *</label>
                <input
                  type="text"
                  required
                  value={payoutForm.accountNumber}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountNumber: e.target.value })}
                  placeholder="01XXXXXXXXX or Bank Account #"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Bank / Account Details (Optional)</label>
                <input
                  type="text"
                  value={payoutForm.accountDetails}
                  onChange={(e) => setPayoutForm({ ...payoutForm, accountDetails: e.target.value })}
                  placeholder="Bank name, branch, routing code"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout || financeData.availableBalance < 500}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-glow disabled:opacity-50"
                >
                  {submittingPayout ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD STAFF */}
      {/* ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <UserPlus size={18} className="text-amber-400" /> Add Store Staff Member
              </h3>
              <button onClick={() => setIsAddStaffOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffForm.fullName}
                  onChange={(e) => setStaffForm({ ...staffForm, fullName: e.target.value })}
                  placeholder="e.g. Tariq Ahmed"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="staff@store.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Role Title</label>
                <select
                  value={staffForm.jobTitle}
                  onChange={(e) => setStaffForm({ ...staffForm, jobTitle: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white"
                >
                  <option value="Store Manager">Store Manager</option>
                  <option value="Inventory Staff">Inventory Staff</option>
                  <option value="Sales Associate">Sales Associate</option>
                  <option value="Customer Support">Customer Support</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-glow"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION */}
      {/* ========================================================================= */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Delete Product SKU?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                This will permanently delete this product SKU and all corresponding warehouse inventory records.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProduct(deletingProductId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
