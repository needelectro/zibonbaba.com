'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, Product, Order, Customer } from '@/store/useStore';

// Layout & Navigation Shell
import AdminAppShell from '@/components/admin/layout/AdminAppShell';
import { AdminModuleType } from '@/components/admin/layout/AdminSidebar';

// Views
import DashboardView from '@/components/admin/views/DashboardView';
import OrdersView from '@/components/admin/views/OrdersView';
import ProductsView from '@/components/admin/views/ProductsView';
import CustomersView from '@/components/admin/views/CustomersView';
import SellersView from '@/components/admin/views/SellersView';
import InventoryView from '@/components/admin/views/InventoryView';
import FinanceView from '@/components/admin/views/FinanceView';
import LogisticsView from '@/components/admin/views/LogisticsView';
import ResellersView from '@/components/admin/views/ResellersView';
import CrmView from '@/components/admin/views/CrmView';
import HrmView from '@/components/admin/views/HrmView';
import PosView from '@/components/admin/views/PosView';
import SettingsView from '@/components/admin/views/SettingsView';
import NotificationsView from '@/components/admin/views/NotificationsView';
import ReviewsView from '@/components/admin/views/ReviewsView';

// Super Admin / Security / RBAC Views
import AccountsManagementView from '@/components/admin/AccountsManagementView';
import RolesPermissionsView from '@/components/admin/RolesPermissionsView';
import SecurityAuditView from '@/components/admin/SecurityAuditView';
import ReportsAnalyticsView from '@/components/admin/ReportsAnalyticsView';

// Modals & Drawers
import DetailsDrawer from '@/components/admin/ui/DetailsDrawer';
import OrderTimeline from '@/components/admin/ui/OrderTimeline';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import ProductFormModal from '@/components/admin/ui/ProductFormModal';
import CustomerFormModal from '@/components/admin/ui/CustomerFormModal';
import SellerFormModal from '@/components/admin/ui/SellerFormModal';
import InvoiceMemoModal from '@/components/invoice-memo-modal';

import {
  Lock,
  ShieldAlert,
  Printer,
  Edit,
  FileText,
  CreditCard,
  User,
  Store,
  Package,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    products,
    orders,
    crmCustomers,
    fetchProducts,
    fetchOrders,
    fetchCrmCustomers,
    categories,
    fetchHomepage,
    token,
    isLoggedIn,
    role,
    logout,
    username,
    userEmail,
    adminTheme,
    toggleAdminTheme,
    initAdminTheme
  } = useStore();

  const [activeModule, setActiveModule] = useState<AdminModuleType>('dashboard');
  const [isMounted, setIsMounted] = useState(false);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  // Drawers & Inspection State
  const [viewingOrder, setViewingOrder] = useState<any | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<any | null>(null);
  const [viewingVendor, setViewingVendor] = useState<any | null>(null);
  const [selectedDrawerSeller, setSelectedDrawerSeller] = useState<any | null>(null);

  // Form Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductData, setEditingProductData] = useState<any | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomerData, setEditingCustomerData] = useState<any | null>(null);

  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [editingSellerData, setEditingSellerData] = useState<any | null>(null);

  // Cash Memo / Invoice Modal State
  const [invoiceModalOrders, setInvoiceModalOrders] = useState<any[] | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Local / Synchronized State
  const [localOrders, setLocalOrders] = useState<Order[]>([]);
  const [localCustomers, setLocalCustomers] = useState<Customer[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [sellerActionMsg, setSellerActionMsg] = useState('');

  // Seller Management State
  const [adminSellers, setAdminSellers] = useState<any[]>([]);
  const [sellerTab, setSellerTab] = useState<'verified' | 'kyc'>('verified');

  // Customer Management State
  const [adminCustomers, setAdminCustomers] = useState<any[]>([]);

  // Reseller & Logistics Management State
  const [adminResellers, setAdminResellers] = useState<any[]>([]);
  const [adminDeliveryMen, setAdminDeliveryMen] = useState<any[]>([]);
  const [adminUnassignedOrders, setAdminUnassignedOrders] = useState<any[]>([]);
  const [adminWithdrawals, setAdminWithdrawals] = useState<any[]>([]);
  const [isAssigningOrder, setIsAssigningOrder] = useState<string | null>(null);

  // Reviews Moderation State
  const [adminReviews, setAdminReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // Settings State
  const [shippingCost, setShippingCost] = useState(10);
  const [globalVAT, setGlobalVAT] = useState(8);
  const [platformCommission, setPlatformCommission] = useState(10);
  const [gateways, setGateways] = useState({
    SSLCommerz: true,
    bKash: true,
    Nagad: true,
    Rocket: false,
    Stripe: true,
    PayPal: false
  });

  // CRM notes & HRM employees state
  const [crmNotes, setCrmNotes] = useState<any[]>([
    { id: 1, name: 'Kabir Hasan', note: 'VIP buyer requested early delivery on invoice #ORD-982103.', date: '2026-07-14' },
    { id: 2, name: 'Nadia Rahman', note: 'Verified new shipping address in Dhanmondi. Updated successfully.', date: '2026-07-13' }
  ]);
  const [employees, setEmployees] = useState<any[]>([
    { id: 'emp-1', name: 'Kabir Rahman', role: 'Operations Manager', dept: 'Logistics', salary: 45000, attendance: '98%', status: 'Paid' },
    { id: 'emp-2', name: 'Sadia Chowdhury', role: 'Support Team Lead', dept: 'Customer Success', salary: 38000, attendance: '95%', status: 'Paid' },
    { id: 'emp-3', name: 'Anisul Hoque', role: 'Inventory Specialist', dept: 'Warehouse A', salary: 28000, attendance: '92%', status: 'Processing' }
  ]);

  // ---------------------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // ---------------------------------------------------------------------------
  const getActiveToken = () => token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);

  const fetchAdminSellers = async () => {
    const activeToken = getActiveToken();
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
    const activeToken = getActiveToken();
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
    const activeToken = getActiveToken();
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
    const activeToken = getActiveToken();
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
    const activeToken = getActiveToken();
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
    const activeToken = getActiveToken();
    if (!activeToken) return;
    try {
      const res = await fetch('/api/admin/withdrawals', { headers: { Authorization: `Bearer ${activeToken}` } });
      const data = await res.json();
      if (res.ok && Array.isArray(data.withdrawals)) {
        setAdminWithdrawals(data.withdrawals);
      }
    } catch (_) {}
  };

  const fetchAdminReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await fetch('/api/reviews?limit=100');
      const data = await res.json();
      if (res.ok && Array.isArray(data.reviews)) {
        setAdminReviews(data.reviews);
      }
    } catch (_) {} finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    initAdminTheme();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get('module');
      if (mod) {
        setActiveModule(mod as AdminModuleType);
      }
    }

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

    const activeToken = getActiveToken();
    if (activeToken) {
      const authHeaders = { Authorization: `Bearer ${activeToken}` };
      fetch('/api/admin/platform-stats', { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => setPlatformStats(data))
        .catch(() => {});

      fetch('/api/verification/pending', { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
          if (data.verifications && Array.isArray(data.verifications)) {
            setPendingSellers(
              data.verifications.map((v: any) => ({
                id: v.id,
                userId: v.userId,
                storeId: v.storeId,
                name: v.userName || v.storeName || v.user?.profile?.fullName || v.user?.email || 'Vendor Applicant',
                owner: v.userName || v.user?.profile?.fullName || 'Owner',
                email: v.email || v.user?.email || 'vendor@store.com',
                type: v.type || 'TRADE_LICENSE',
                docs: 'Verification_Doc.pdf',
                status: v.status || 'Pending'
              }))
            );
          }
        })
        .catch(() => {});

      fetch('/api/admin/settings', { headers: authHeaders })
        .then((res) => res.json())
        .then((data) => {
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

  // Real-time synchronization listeners
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
    };

    window.addEventListener('zibonbaba:order-sync', handleSync);
    window.addEventListener('zibonbaba:product-sync', handleSync);
    window.addEventListener('zibonbaba:sync', handleSync);

    return () => {
      window.removeEventListener('zibonbaba:order-sync', handleSync);
      window.removeEventListener('zibonbaba:product-sync', handleSync);
      window.removeEventListener('zibonbaba:sync', handleSync);
    };
  }, [fetchOrders, fetchProducts]);

  useEffect(() => {
    if (products.length > 0) setLocalProducts(products);
    if (orders.length > 0) setLocalOrders(orders);
    if (crmCustomers.length > 0) setLocalCustomers(crmCustomers);
  }, [products, orders, crmCustomers]);

  // Global Ctrl+K handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // The modal state is inside AdminAppShell or triggered directly
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ---------------------------------------------------------------------------
  // MUTATION HANDLERS
  // ---------------------------------------------------------------------------
  // Product Save / Edit / Delete
  const handleSaveProductForm = async (formData: any) => {
    const activeToken = getActiveToken();
    if (formData.id) {
      // Edit
      try {
        const res = await fetch(`/api/products/${formData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: activeToken ? `Bearer ${activeToken}` : ''
          },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          await fetchProducts();
          alert('Product catalog SKU updated successfully.');
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to update product SKU.');
        }
      } catch (_) {
        alert('Error updating product.');
      }
    } else {
      // Create
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: activeToken ? `Bearer ${activeToken}` : ''
          },
          body: JSON.stringify(formData)
        });
        if (res.ok) {
          await fetchProducts();
          alert(`Product SKU ${formData.sku} registered successfully.`);
        } else {
          const err = await res.json();
          alert(err.error || 'Failed to create product SKU.');
        }
      } catch (_) {
        alert('Error creating product.');
      }
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}" from the platform catalog?`)) return;
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: activeToken ? `Bearer ${activeToken}` : '' }
      });
      if (res.ok) {
        await fetchProducts();
        alert(`Product "${name}" deleted.`);
      }
    } catch (_) {
      alert('Error deleting product.');
    }
  };

  // Category Creation
  const handleCreateCategory = async (e: React.FormEvent, catName: string) => {
    e.preventDefault();
    if (!catName) return;
    const activeToken = getActiveToken();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ name: catName })
      });
      if (res.ok) {
        fetchHomepage();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create category.');
      }
    } catch (_) {
      alert('Error creating category.');
    }
  };

  // Customer Save / Edit / Delete / Toggle
  const handleSaveCustomerForm = async (formData: any) => {
    const activeToken = getActiveToken();
    if (formData.id) {
      try {
        const res = await fetch(`/api/admin/users/${formData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: activeToken ? `Bearer ${activeToken}` : ''
          },
          body: JSON.stringify({
            fullName: formData.name,
            phone: formData.phone || undefined,
            status: formData.status,
            walletBalance: formData.walletBalance,
            loyaltyPoints: formData.loyaltyPoints,
            password: formData.password || undefined
          })
        });
        if (res.ok) {
          await fetchAdminCustomers();
          await fetchCrmCustomers();
          alert('Customer profile updated successfully.');
        }
      } catch (_) {
        alert('Error updating customer record.');
      }
    } else {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: activeToken ? `Bearer ${activeToken}` : ''
          },
          body: JSON.stringify({
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password || 'Customer123!',
            role: 'CUSTOMER',
            status: formData.status
          })
        });
        if (res.ok) {
          await fetchAdminCustomers();
          await fetchCrmCustomers();
          alert('Customer registered successfully.');
        }
      } catch (_) {
        alert('Error creating customer.');
      }
    }
  };

  const handleToggleCustomerStatus = async (cust: any) => {
    const newStatus = cust.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/admin/users/${cust.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        await fetchAdminCustomers();
        await fetchCrmCustomers();
      }
    } catch (_) {}
  };

  const handleDeleteCustomer = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to permanently delete user account ${email}?`)) return;
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: activeToken ? `Bearer ${activeToken}` : '' }
      });
      if (res.ok) {
        await fetchAdminCustomers();
        await fetchCrmCustomers();
        alert(`User ${email} deleted.`);
      }
    } catch (_) {}
  };

  // Seller Save / Toggle / Delete / KYC
  const handleSaveSellerForm = async (formData: any) => {
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/admin/sellers/${formData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchAdminSellers();
        alert('Vendor store profile updated successfully.');
      }
    } catch (_) {
      alert('Error updating store.');
    }
  };

  const handleToggleSellerApproval = async (sellerId: string, currentApproved: boolean) => {
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/admin/sellers/${sellerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ isApproved: !currentApproved })
      });
      if (res.ok) {
        await fetchAdminSellers();
      }
    } catch (_) {}
  };

  const handleDeleteSeller = async (id: string, name: string) => {
    if (!confirm(`Delete vendor store "${name}" and all associated products?`)) return;
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/admin/sellers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: activeToken ? `Bearer ${activeToken}` : '' }
      });
      if (res.ok) {
        await fetchAdminSellers();
        alert(`Vendor store "${name}" removed.`);
      }
    } catch (_) {}
  };

  const handleApproveKYC = async (id: string) => {
    const sel = pendingSellers.find((s) => s.id === id);
    setPendingSellers((prev) => prev.filter((s) => s.id !== id));
    const activeToken = getActiveToken();
    try {
      await fetch('/api/verification/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          id,
          userId: sel?.userId,
          storeId: sel?.storeId,
          reason: 'Administrative verification review'
        })
      });
    } catch (_) {}
    setSellerActionMsg(`Store "${sel?.name || 'Applicant'}" approved! Verification active.`);
    setTimeout(() => setSellerActionMsg(''), 4000);
  };

  const handleRejectKYC = async (id: string) => {
    const sel = pendingSellers.find((s) => s.id === id);
    setPendingSellers((prev) => prev.filter((s) => s.id !== id));
    const activeToken = getActiveToken();
    try {
      await fetch('/api/verification/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          id,
          userId: sel?.userId,
          storeId: sel?.storeId,
          reason: 'Documentation did not meet compliance verification standards.'
        })
      });
    } catch (_) {}
    setSellerActionMsg(`Verification request for "${sel?.name || 'Applicant'}" rejected.`);
    setTimeout(() => setSellerActionMsg(''), 4000);
  };

  // Logistics / Courier Handlers
  const handleUpdateDeliveryManStatus = async (id: string, newStatus: string) => {
    const activeToken = getActiveToken();
    try {
      const res = await fetch('/api/admin/delivery-men', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ deliveryManId: id, newStatus })
      });
      if (res.ok) {
        fetchAdminDeliveryMen();
      }
    } catch (_) {}
  };

  const handleAssignOrderToRider = async (orderId: string, deliveryManId: string) => {
    const activeToken = getActiveToken();
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
        alert('Order assigned to courier rider successfully.');
      }
    } catch (_) {} finally {
      setIsAssigningOrder(null);
    }
  };

  // Reseller Status Handler
  const handleUpdateResellerStatus = async (id: string, newStatus: string) => {
    const activeToken = getActiveToken();
    try {
      const res = await fetch('/api/admin/resellers', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ resellerId: id, newStatus })
      });
      if (res.ok) {
        fetchAdminResellers();
      }
    } catch (_) {}
  };

  // Withdrawal / Payout Status Handler
  const handleUpdateWithdrawalStatus = async (id: string, newStatus: string) => {
    const activeToken = getActiveToken();
    try {
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          withdrawalId: id,
          newStatus,
          transactionRef: `TXN-${Date.now().toString().slice(-6)}`
        })
      });
      if (res.ok) {
        fetchAdminWithdrawals();
      }
    } catch (_) {}
  };

  // Review Moderation Handlers
  const handleToggleReviewFeatured = async (id: string, currentFeatured: boolean) => {
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({ isFeatured: !currentFeatured })
      });
      if (res.ok) {
        setAdminReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isFeatured: !currentFeatured } : r))
        );
      }
    } catch (_) {}
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    const activeToken = getActiveToken();
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: activeToken ? `Bearer ${activeToken}` : '' }
      });
      if (res.ok) {
        setAdminReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (_) {}
  };

  // CRM Note Handlers
  const handleAddCrmNote = async (e: React.FormEvent, cName: string, cNote: string) => {
    setCrmNotes((prev) => [
      { id: Date.now(), name: cName, note: cNote, date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);
  };

  const handleDeleteCrmNote = async (id: any) => {
    setCrmNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Employee Handlers
  const handleAddEmployee = async (e: React.FormEvent, eName: string, eRole: string) => {
    setEmployees((prev) => [
      ...prev,
      { id: `emp-${Date.now()}`, name: eName, role: eRole, dept: 'Operations', salary: 32000, attendance: '100%', status: 'Paid' }
    ]);
  };

  const handleDeleteEmployee = async (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Gateway toggle
  const handleToggleGateway = (gwName: string) => {
    setGateways((prev: any) => ({ ...prev, [gwName]: !prev[gwName] }));
  };

  // Settings Save
  const handleSaveSettings = async () => {
    const activeToken = getActiveToken();
    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          globalVAT,
          shippingCost,
          platformCommission,
          gateways
        })
      });
      setSettingsSavedMsg('Platform settings updated successfully.');
      setTimeout(() => setSettingsSavedMsg(''), 4000);
    } catch (_) {
      setSettingsSavedMsg('Settings saved locally.');
      setTimeout(() => setSettingsSavedMsg(''), 4000);
    }
  };

  // Search Result selection handler
  const handleSearchResultSelect = (module: string, itemId: string, itemData?: any) => {
    if (module === 'products') {
      const prod = localProducts.find((p) => p.id === itemId);
      setViewingProduct(prod || { id: itemId, name: itemData?.title, price: 0, stock: 0 });
    } else if (module === 'customers') {
      const cust = adminCustomers.find((c) => c.id === itemId);
      setViewingCustomer(cust || { id: itemId, name: itemData?.title, email: itemData?.subtitle, status: 'ACTIVE' });
    } else if (module === 'vendors') {
      const vend = adminSellers.find((s) => s.id === itemId);
      setViewingVendor(vend || { id: itemId, name: itemData?.title, isApproved: true });
    } else if (module === 'orders') {
      const ord = localOrders.find((o) => o.id === itemId);
      setViewingOrder(ord || { id: itemId, customerName: itemData?.title, total: 0, status: 'PENDING' });
    } else if (module === 'transactions') {
      setActiveModule('wallet');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  // ---------------------------------------------------------------------------
  // AUTHENTICATION & ACCESS CONTROL GUARDS
  // ---------------------------------------------------------------------------
  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">Login Required</h1>
          <p className="text-xs text-slate-400 mb-6">
            Please log in to your account to access the Zibonbaba administrative console.
          </p>
          <Link
            href="/admin/login"
            className="bg-[#FFC107] text-slate-950 font-black text-xs px-6 py-3 rounded-2xl block w-full text-center hover:bg-amber-400 transition-all shadow-sm"
          >
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
          <p className="text-xs text-slate-400 mb-6">
            Strict Dashboard Isolation active. Your role ({role}) does not have administrative permissions.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-white/5 border border-white/10 text-slate-300 hover:text-white font-black text-xs px-6 py-3 rounded-2xl block w-full cursor-pointer"
          >
            Back to Storefront
          </button>
        </div>
      </div>
    );
  }

  const isLight = adminTheme === 'light';

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    switch (activeModule) {
      case 'dashboard':
        return [{ label: 'Main' }, { label: 'Dashboard Overview' }];
      case 'marketplace':
        return [{ label: 'Marketplace' }, { label: 'Products & Categories' }];
      case 'orders':
        return [{ label: 'Marketplace' }, { label: 'Orders & Shipments' }];
      case 'reviews':
        return [{ label: 'Marketplace' }, { label: 'Customer Reviews' }];
      case 'pos':
        return [{ label: 'Marketplace' }, { label: 'POS Terminal Sales' }];
      case 'customers':
        return [{ label: 'Customers' }, { label: 'Customer Hub' }];
      case 'sellers':
        return [{ label: 'Sellers' }, { label: 'Sellers & Stores' }];
      case 'resellers':
        return [{ label: 'Resellers' }, { label: 'Reseller Program' }];
      case 'delivery':
        return [{ label: 'Logistics' }, { label: 'Courier & Fleet' }];
      case 'inventory':
        return [{ label: 'Operations' }, { label: 'Inventory & Stock' }];
      case 'warehouse':
        return [{ label: 'Operations' }, { label: 'Warehouses Log' }];
      case 'erp':
        return [{ label: 'Operations' }, { label: 'ERP & Accounting' }];
      case 'crm':
        return [{ label: 'Management' }, { label: 'CRM Sales Pipeline' }];
      case 'hrm':
        return [{ label: 'Management' }, { label: 'HRM Attendance & Staff' }];
      case 'wallet':
        return [{ label: 'Finance' }, { label: 'Unified Wallets' }];
      case 'finance':
        return [{ label: 'Finance' }, { label: 'Financial Records' }];
      case 'reports':
        return [{ label: 'Reports' }, { label: 'Sales Reports & BI' }];
      case 'accounts':
        return [{ label: 'Administration' }, { label: 'User & Staff Accounts' }];
      case 'rbac':
        return [{ label: 'Administration' }, { label: 'Roles & Permissions' }];
      case 'security':
        return [{ label: 'Administration' }, { label: 'Security & Audit Logs' }];
      case 'settings':
        return [{ label: 'Administration' }, { label: 'System Settings' }];
      case 'notifications':
        return [{ label: 'Administration' }, { label: 'Notification Hub' }];
      default:
        return [{ label: 'Main' }, { label: activeModule }];
    }
  };

  const totalGmvComputed = localOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const platformCommissionComputed = Math.round(totalGmvComputed * (platformCommission / 100));

  return (
    <AdminAppShell
      activeModule={activeModule}
      onSelectModule={setActiveModule}
      adminTheme={adminTheme}
      onToggleTheme={toggleAdminTheme}
      username={username}
      role={role}
      userEmail={userEmail}
      onLogout={handleLogout}
      badgeCounts={{
        orders: localOrders.length,
        pendingSellers: pendingSellers.length,
        reviews: adminReviews.length,
        unassignedOrders: adminUnassignedOrders.length,
        withdrawals: adminWithdrawals.filter((w) => (w.status || '').toUpperCase() === 'PENDING').length
      }}
      onSelectSearchResult={handleSearchResultSelect}
      breadcrumbs={getBreadcrumbs()}
    >
      {/* --------------------------------------------------------------- */}
      {/* MODULE RENDER DISPATCHER                                        */}
      {/* --------------------------------------------------------------- */}

      {/* 1. DASHBOARD */}
      {activeModule === 'dashboard' && (
        <DashboardView
          platformStats={platformStats}
          onNavigateModule={(mod) => setActiveModule(mod as AdminModuleType)}
          isLight={isLight}
          token={token}
          orders={localOrders}
          products={localProducts}
          customers={adminCustomers.length > 0 ? adminCustomers : localCustomers}
          sellers={adminSellers}
          pendingSellersCount={pendingSellers.length}
          onSelectOrder={(ord) => setViewingOrder(ord)}
          onPrintMemo={(ord) => {
            setInvoiceModalOrders([ord]);
            setIsInvoiceModalOpen(true);
          }}
        />
      )}

      {/* 2. ORDERS & SHIPMENTS */}
      {activeModule === 'orders' && (
        <OrdersView
          orders={localOrders}
          onSelectOrder={(ord) => setViewingOrder(ord)}
          onPrintMemo={(ord) => {
            setInvoiceModalOrders([ord]);
            setIsInvoiceModalOpen(true);
          }}
          onPrintBulkMemos={(ords) => {
            setInvoiceModalOrders(ords);
            setIsInvoiceModalOpen(true);
          }}
          onRefresh={fetchOrders}
          isLight={isLight}
        />
      )}

      {/* 3. PRODUCTS & CATEGORIES */}
      {activeModule === 'marketplace' && (
        <ProductsView
          products={localProducts}
          categories={categories}
          onOpenAddProduct={() => {
            setEditingProductData(null);
            setIsProductModalOpen(true);
          }}
          onOpenEditProduct={(prod) => {
            setEditingProductData(prod);
            setIsProductModalOpen(true);
          }}
          onDeleteProduct={handleDeleteProduct}
          onInspectProduct={(prod) => setViewingProduct(prod)}
          onCreateCategory={handleCreateCategory}
          onRefresh={fetchProducts}
          isLight={isLight}
        />
      )}

      {/* 4. CUSTOMER HUB */}
      {activeModule === 'customers' && (
        <CustomersView
          customers={adminCustomers.length > 0 ? adminCustomers : localCustomers}
          onOpenAddCustomer={() => {
            setEditingCustomerData(null);
            setIsCustomerModalOpen(true);
          }}
          onOpenEditCustomer={(cust) => {
            setEditingCustomerData(cust);
            setIsCustomerModalOpen(true);
          }}
          onToggleStatus={handleToggleCustomerStatus}
          onDeleteCustomer={handleDeleteCustomer}
          onInspectCustomer={(cust) => setViewingCustomer(cust)}
          onRefresh={fetchAdminCustomers}
          isLight={isLight}
        />
      )}

      {/* 5. SELLERS & KYC QUEUE */}
      {activeModule === 'sellers' && (
        <SellersView
          sellers={adminSellers}
          pendingSellers={pendingSellers}
          sellerTab={sellerTab}
          onTabChange={setSellerTab}
          onOpenEditSeller={(sel) => {
            setEditingSellerData(sel);
            setIsSellerModalOpen(true);
          }}
          onToggleApproval={handleToggleSellerApproval}
          onDeleteSeller={handleDeleteSeller}
          onInspectSeller={(sel) => setViewingVendor(sel)}
          onInspectKycDrawer={(kyc) => setSelectedDrawerSeller(kyc)}
          onApproveKYC={handleApproveKYC}
          onRejectKYC={handleRejectKYC}
          onRefresh={fetchAdminSellers}
          isLight={isLight}
        />
      )}

      {/* 6. INVENTORY & WAREHOUSES */}
      {(activeModule === 'inventory' || activeModule === 'warehouse') && (
        <InventoryView
          products={localProducts}
          onRefresh={fetchProducts}
          isLight={isLight}
        />
      )}

      {/* 7. FINANCE & WALLETS */}
      {(activeModule === 'finance' || activeModule === 'wallet' || activeModule === 'erp') && (
        <FinanceView
          totalRevenue={totalGmvComputed}
          platformCommission={platformCommissionComputed}
          withdrawals={adminWithdrawals}
          onUpdateWithdrawalStatus={handleUpdateWithdrawalStatus}
          gateways={gateways}
          onToggleGateway={handleToggleGateway}
          isLight={isLight}
        />
      )}

      {/* 8. COURIER & LOGISTICS */}
      {activeModule === 'delivery' && (
        <LogisticsView
          deliveryMen={adminDeliveryMen}
          unassignedOrders={adminUnassignedOrders}
          onUpdateDeliveryManStatus={handleUpdateDeliveryManStatus}
          onAssignOrderToRider={handleAssignOrderToRider}
          isAssigningOrder={isAssigningOrder}
          onRefresh={() => {
            fetchAdminDeliveryMen();
            fetchAdminUnassignedOrders();
          }}
          isLight={isLight}
        />
      )}

      {/* 9. RESELLER PROGRAM */}
      {activeModule === 'resellers' && (
        <ResellersView
          resellers={adminResellers}
          onUpdateStatus={handleUpdateResellerStatus}
          isLight={isLight}
        />
      )}

      {/* 10. CRM */}
      {activeModule === 'crm' && (
        <CrmView
          crmNotes={crmNotes}
          onAddCrmNote={handleAddCrmNote}
          onDeleteCrmNote={handleDeleteCrmNote}
          isLight={isLight}
        />
      )}

      {/* 11. HRM & WORKFORCE */}
      {activeModule === 'hrm' && (
        <HrmView
          employees={employees}
          onAddEmployee={handleAddEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          isLight={isLight}
        />
      )}

      {/* 12. POS TERMINAL SALES */}
      {activeModule === 'pos' && (
        <PosView
          products={localProducts}
          isLight={isLight}
        />
      )}

      {/* 13. SYSTEM SETTINGS */}
      {activeModule === 'settings' && (
        <SettingsView
          shippingCost={shippingCost}
          setShippingCost={setShippingCost}
          globalVAT={globalVAT}
          setGlobalVAT={setGlobalVAT}
          platformCommission={platformCommission}
          setPlatformCommission={setPlatformCommission}
          gateways={gateways}
          onToggleGateway={handleToggleGateway}
          onSaveSettings={handleSaveSettings}
          savedMsg={settingsSavedMsg}
          isLight={isLight}
        />
      )}

      {/* 14. NOTIFICATION HUB */}
      {activeModule === 'notifications' && (
        <NotificationsView isLight={isLight} />
      )}

      {/* 15. CUSTOMER REVIEWS MODERATION */}
      {activeModule === 'reviews' && (
        <ReviewsView
          reviews={adminReviews}
          isLoading={isLoadingReviews}
          onRefresh={fetchAdminReviews}
          onToggleFeatured={handleToggleReviewFeatured}
          onDeleteReview={handleDeleteReview}
          isLight={isLight}
        />
      )}

      {/* 16. USER & STAFF ACCOUNTS (SUPER ADMIN) */}
      {activeModule === 'accounts' && (
        <AccountsManagementView token={token} isLight={isLight} />
      )}

      {/* 17. ROLES & PERMISSIONS */}
      {activeModule === 'rbac' && (
        <RolesPermissionsView token={token} isLight={isLight} />
      )}

      {/* 18. SECURITY & AUDIT LOGS */}
      {(activeModule === 'security' || activeModule === 'audit') && (
        <SecurityAuditView token={token} isLight={isLight} />
      )}

      {/* 19. REPORTS & BI ANALYTICS */}
      {activeModule === 'reports' && (
        <ReportsAnalyticsView token={token} isLight={isLight} />
      )}

      {/* --------------------------------------------------------------- */}
      {/* ENTERPRISE SLIDE-OVER DETAILS DRAWERS                           */}
      {/* --------------------------------------------------------------- */}

      {/* Order Details Drawer */}
      <DetailsDrawer
        isOpen={Boolean(viewingOrder)}
        onClose={() => setViewingOrder(null)}
        title={viewingOrder ? `Order #${viewingOrder.id.slice(0, 10)}` : 'Order Details'}
        subtitle={viewingOrder?.date ? `Placed on ${viewingOrder.date}` : undefined}
        badge={viewingOrder?.status ? <StatusBadge status={viewingOrder.status} /> : undefined}
        isLight={isLight}
        footerActions={
          <>
            <button
              onClick={() => {
                if (viewingOrder) {
                  setInvoiceModalOrders([viewingOrder]);
                  setIsInvoiceModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Cash Memo</span>
            </button>
            <button
              onClick={() => setViewingOrder(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </>
        }
      >
        {viewingOrder && (
          <div className="space-y-5 text-xs">
            {/* Visual Status Progression */}
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Fulfillment Lifecycle
              </p>
              <OrderTimeline currentStatus={viewingOrder.status} isLight={isLight} />
            </div>

            {/* Customer & Merchant Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3.5 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">Customer</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {viewingOrder.customerName || viewingOrder.customer?.fullName || 'Direct Customer'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {viewingOrder.customerEmail || viewingOrder.customer?.email || 'customer@store.com'}
                </p>
              </div>

              <div
                className={`p-3.5 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Store className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">Store / Hub</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white truncate">
                  {viewingOrder.branchName || viewingOrder.store || 'Zibonbaba Hub'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Channel: <strong className="font-mono">{viewingOrder.source || 'ONLINE'}</strong>
                </p>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div
              className={`p-4 rounded-xl border space-y-3 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Purchased Items ({viewingOrder.items?.length || 0})
              </h4>

              <div className="space-y-2">
                {(!viewingOrder.items || viewingOrder.items.length === 0) ? (
                  <p className="text-slate-400 italic">No itemized lines recorded for this order ref.</p>
                ) : (
                  viewingOrder.items.map((item: any, idx: number) => {
                    const itemName = item.product?.name || item.name || 'Catalog Item';
                    const itemPrice = item.product?.price || item.price || 0;
                    const itemQty = item.quantity || 1;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 border-b last:border-0 border-slate-200/60 dark:border-slate-800"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{itemName}</p>
                          <p className="text-[10.5px] text-slate-400 font-mono">
                            {itemQty} × ৳{itemPrice.toLocaleString()}
                          </p>
                        </div>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ৳{(itemQty * itemPrice).toLocaleString()}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-extrabold">
                <span>Total Amount:</span>
                <span className="font-mono font-black text-amber-600 dark:text-[#FFC107]">
                  ৳{Number(viewingOrder.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </DetailsDrawer>

      {/* Product Details Drawer */}
      <DetailsDrawer
        isOpen={Boolean(viewingProduct)}
        onClose={() => setViewingProduct(null)}
        title={viewingProduct ? viewingProduct.name : 'Product SKU'}
        subtitle={viewingProduct?.sku ? `SKU: ${viewingProduct.sku}` : undefined}
        badge={
          viewingProduct ? (
            <StatusBadge
              status={
                viewingProduct.stock <= 0
                  ? 'OUT_OF_STOCK'
                  : viewingProduct.stock <= 10
                  ? 'LOW_STOCK'
                  : viewingProduct.status || 'ACTIVE'
              }
            />
          ) : undefined
        }
        isLight={isLight}
        footerActions={
          <>
            <button
              onClick={() => {
                if (viewingProduct) {
                  setEditingProductData(viewingProduct);
                  setViewingProduct(null);
                  setIsProductModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Product</span>
            </button>
            <button
              onClick={() => setViewingProduct(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </>
        }
      >
        {viewingProduct && (
          <div className="space-y-4 text-xs">
            {viewingProduct.image && (
              <img
                src={viewingProduct.image}
                alt={viewingProduct.name}
                className="w-full h-44 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</span>
                <p className="font-mono font-black text-base text-slate-900 dark:text-white">
                  ৳{Number(viewingProduct.price || 0).toLocaleString()}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">Inventory Stock</span>
                <p className="font-mono font-black text-base text-amber-500">
                  {viewingProduct.stock || 0} units
                </p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant Store:</span>
                <span className="font-bold text-slate-900 dark:text-white">{viewingProduct.vendor || 'Direct'}</span>
              </div>
            </div>

            {viewingProduct.description && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Description:</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {viewingProduct.description}
                </p>
              </div>
            )}
          </div>
        )}
      </DetailsDrawer>

      {/* Customer Details Drawer */}
      <DetailsDrawer
        isOpen={Boolean(viewingCustomer)}
        onClose={() => setViewingCustomer(null)}
        title={viewingCustomer ? viewingCustomer.name : 'Customer Profile'}
        subtitle={viewingCustomer?.email}
        badge={viewingCustomer ? <StatusBadge status={viewingCustomer.status || 'ACTIVE'} /> : undefined}
        isLight={isLight}
        footerActions={
          <>
            <button
              onClick={() => {
                if (viewingCustomer) {
                  setEditingCustomerData(viewingCustomer);
                  setViewingCustomer(null);
                  setIsCustomerModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Account</span>
            </button>
            <button
              onClick={() => setViewingCustomer(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </>
        }
      >
        {viewingCustomer && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">Wallet Funds</span>
                <p className="font-mono font-black text-base text-amber-500">
                  ৳{Number(viewingCustomer.walletBalance || 0).toLocaleString()}
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">Loyalty Points</span>
                <p className="font-mono font-black text-base text-purple-500">
                  {viewingCustomer.loyaltyPoints || 0} Pts
                </p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {viewingCustomer.phone || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Orders Count:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {viewingCustomer.ordersCount || 0} Orders
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Lifetime Spend:</span>
                <span className="font-mono font-bold text-emerald-500">
                  ৳{Number(viewingCustomer.totalSpent || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </DetailsDrawer>

      {/* Seller Details Drawer */}
      <DetailsDrawer
        isOpen={Boolean(viewingVendor)}
        onClose={() => setViewingVendor(null)}
        title={viewingVendor ? viewingVendor.name : 'Vendor Store'}
        subtitle={viewingVendor?.id ? `Store ID: ${viewingVendor.id}` : undefined}
        badge={
          viewingVendor ? (
            <StatusBadge status={viewingVendor.isApproved ? 'VERIFIED' : 'PENDING'} />
          ) : undefined
        }
        isLight={isLight}
        footerActions={
          <>
            <button
              onClick={() => {
                if (viewingVendor) {
                  setEditingSellerData(viewingVendor);
                  setViewingVendor(null);
                  setIsSellerModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Store Settings</span>
            </button>
            <button
              onClick={() => setViewingVendor(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </>
        }
      >
        {viewingVendor && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">Commission</span>
                <p className="font-mono font-black text-base text-amber-500">
                  {viewingVendor.commissionRate || 8.5}%
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border space-y-1 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">Catalog SKUs</span>
                <p className="font-mono font-black text-base text-blue-500">
                  {viewingVendor.productsCount || 0} Items
                </p>
              </div>
            </div>

            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex justify-between">
                <span className="text-slate-400">Owner Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {viewingVendor.owner?.name || 'Merchant Owner'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {viewingVendor.owner?.email || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">
                  {viewingVendor.owner?.phone || 'N/A'}
                </span>
              </div>
            </div>

            {viewingVendor.description && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Store Description:</p>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {viewingVendor.description}
                </p>
              </div>
            )}
          </div>
        )}
      </DetailsDrawer>

      {/* KYC Review Slide-Over Drawer */}
      <DetailsDrawer
        isOpen={Boolean(selectedDrawerSeller)}
        onClose={() => setSelectedDrawerSeller(null)}
        title={selectedDrawerSeller ? `KYC Review: ${selectedDrawerSeller.name}` : 'KYC Review'}
        subtitle={selectedDrawerSeller?.owner ? `Applicant: ${selectedDrawerSeller.owner}` : undefined}
        badge={<StatusBadge status="PENDING_KYC" />}
        isLight={isLight}
        footerActions={
          selectedDrawerSeller ? (
            <>
              <button
                onClick={() => {
                  handleApproveKYC(selectedDrawerSeller.id);
                  setSelectedDrawerSeller(null);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition shadow-xs cursor-pointer"
              >
                Approve Vendor Account
              </button>
              <button
                onClick={() => {
                  handleRejectKYC(selectedDrawerSeller.id);
                  setSelectedDrawerSeller(null);
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Reject Request
              </button>
            </>
          ) : undefined
        }
      >
        {selectedDrawerSeller && (
          <div className="space-y-5 text-xs font-semibold">
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <p className="text-slate-400">
                Applicant Name: <span className="font-bold text-slate-900 dark:text-white">{selectedDrawerSeller.owner}</span>
              </p>
              <p className="text-slate-400">
                Email Address: <span className="font-bold text-slate-900 dark:text-white">{selectedDrawerSeller.email}</span>
              </p>
              <p className="text-slate-400">
                Document Type: <span className="font-bold text-amber-500">{selectedDrawerSeller.type}</span>
              </p>
              <p className="text-slate-400">
                Compliance Document: <span className="font-bold text-blue-500 underline cursor-pointer">{selectedDrawerSeller.docs}</span>
              </p>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Compliance Verification Checklist
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2 text-emerald-500 font-bold">
                  ✔ National ID / Passport validity confirmed
                </li>
                <li className="flex items-center gap-2 text-emerald-500 font-bold">
                  ✔ Trade License registration active
                </li>
                <li className="flex items-center gap-2 text-emerald-500 font-bold">
                  ✔ TIN certificate matches owner credentials
                </li>
              </ul>
            </div>
          </div>
        )}
      </DetailsDrawer>

      {/* --------------------------------------------------------------- */}
      {/* STRUCTURED FORM MODALS                                          */}
      {/* --------------------------------------------------------------- */}

      {/* Product Add / Edit Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleSaveProductForm}
        initialData={editingProductData}
        categories={categories}
        isLight={isLight}
      />

      {/* Customer Add / Edit Modal */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleSaveCustomerForm}
        initialData={editingCustomerData}
        isLight={isLight}
      />

      {/* Seller Edit Modal */}
      <SellerFormModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onSubmit={handleSaveSellerForm}
        initialData={editingSellerData}
        isLight={isLight}
      />

      {/* Cash Memo & Invoice Printing Modal */}
      <InvoiceMemoModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceModalOrders(null);
        }}
        orders={invoiceModalOrders}
        title="Admin Cash Memo & Invoice Dispatch System"
      />
    </AdminAppShell>
  );
}
