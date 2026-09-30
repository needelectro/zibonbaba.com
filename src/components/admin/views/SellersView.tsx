'use client';

import React, { useState, useMemo } from 'react';
import DataTableToolbar from '../ui/DataTableToolbar';
import PaginationBar from '../ui/PaginationBar';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import KPICard from '../ui/KPICard';
import {
  Store,
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Package,
  Edit,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';

interface SellerRecord {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  isApproved: boolean;
  commissionRate: number;
  productsCount?: number;
  grossSales?: number;
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

interface PendingSellerKYC {
  id: string;
  userId: string;
  storeId?: string;
  name: string;
  owner: string;
  email: string;
  type: string;
  docs: string;
  status: string;
}

interface SellersViewProps {
  sellers: SellerRecord[];
  pendingSellers: PendingSellerKYC[];
  sellerTab: 'verified' | 'kyc';
  onTabChange: (tab: 'verified' | 'kyc') => void;
  onOpenEditSeller: (seller: SellerRecord) => void;
  onToggleApproval: (id: string, currentApproved: boolean) => void;
  onDeleteSeller: (id: string, name: string) => void;
  onInspectSeller: (seller: SellerRecord) => void;
  onInspectKycDrawer: (kyc: PendingSellerKYC) => void;
  onApproveKYC: (id: string) => void;
  onRejectKYC: (id: string) => void;
  onRefresh: () => void;
  isLight: boolean;
}

export default function SellersView({
  sellers = [],
  pendingSellers = [],
  sellerTab,
  onTabChange,
  onOpenEditSeller,
  onToggleApproval,
  onDeleteSeller,
  onInspectSeller,
  onInspectKycDrawer,
  onApproveKYC,
  onRejectKYC,
  onRefresh,
  isLight
}: SellersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Metrics
  const totalSellers = sellers.length;
  const activeSellers = sellers.filter((s) => s.isApproved).length;
  const pendingKycCount = pendingSellers.length;
  const totalSalesVolume = sellers.reduce((acc, s) => acc + (s.grossSales || 0), 0);

  // Filtered sellers
  const filteredSellers = useMemo(() => {
    return sellers.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchOwner = (s.owner?.name || '').toLowerCase().includes(q);
        const matchEmail = (s.owner?.email || '').toLowerCase().includes(q);
        return matchName || matchOwner || matchEmail;
      }
      return true;
    });
  }, [sellers, searchQuery]);

  // Paginated sellers
  const totalRecords = filteredSellers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedSellers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSellers.slice(start, start + pageSize);
  }, [filteredSellers, page, pageSize]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-500" />
            Vendor & Merchant Ecosystem Control
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage partner stores, compliance KYC queues, merchant commissions, and active storefronts.
          </p>
        </div>
      </div>

      {/* 2. Seller KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Stores"
          value={totalSellers}
          subtitle="Registered vendors"
          icon={Store}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Active & Verified"
          value={activeSellers}
          subtitle="Storefronts open"
          icon={CheckCircle}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Pending KYC"
          value={pendingKycCount}
          subtitle="Awaiting compliance"
          icon={ShieldCheck}
          color="rose"
          isLight={isLight}
        />
        <KPICard
          title="Merchant Volume"
          value={`৳${totalSalesVolume.toLocaleString()}`}
          subtitle="Gross merchant sales"
          icon={TrendingUp}
          color="blue"
          isLight={isLight}
        />
      </div>

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            onTabChange('verified');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            sellerTab === 'verified'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Verified Vendor Stores ({sellers.length})</span>
        </button>

        <button
          onClick={() => {
            onTabChange('kyc');
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            sellerTab === 'kyc'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>KYC Applications Queue ({pendingSellers.length})</span>
        </button>
      </div>

      {/* 4. Tab 1: Verified Stores */}
      {sellerTab === 'verified' && (
        <div
          className={`rounded-2xl border overflow-hidden transition-all ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <DataTableToolbar
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setPage(1);
              }}
              searchPlaceholder="Search store name, owner, email..."
              onRefresh={onRefresh}
              isLight={isLight}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-bold ${
                    isLight
                      ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <th className="py-3 px-4 font-black">Store / Merchant</th>
                  <th className="py-3 px-4">Owner & Contact</th>
                  <th className="py-3 px-4">Commission Rate</th>
                  <th className="py-3 px-4">Catalog SKUs</th>
                  <th className="py-3 px-4">Gross Sales</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y font-semibold ${
                  isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'
                }`}
              >
                {paginatedSellers.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="No stores found"
                        description="No verified vendor stores match your query."
                        actionText="Clear Search"
                        onAction={() => setSearchQuery('')}
                        isLight={isLight}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedSellers.map((seller) => (
                    <tr
                      key={seller.id}
                      className={`transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                      }`}
                      onClick={() => onInspectSeller(seller)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={seller.logo || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&auto=format&fit=crop'}
                            alt={seller.name}
                            className={`w-9 h-9 rounded-lg object-cover shrink-0 border ${
                              isLight ? 'border-slate-200' : 'border-slate-800'
                            }`}
                          />
                          <div className="min-w-0 max-w-[180px]">
                            <h4 className="font-extrabold text-slate-900 dark:text-white truncate">
                              {seller.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {seller.description || 'Verified Merchant Store'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {seller.owner?.name || 'Store Owner'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">
                          {seller.owner?.email || 'N/A'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-amber-600 dark:text-amber-400">
                        {seller.commissionRate || 8.5}%
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {seller.productsCount || 0} SKUs
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-emerald-600 dark:text-emerald-400">
                        ৳{Number(seller.grossSales || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={seller.isApproved ? 'VERIFIED' : 'PENDING'} />
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onInspectSeller(seller)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                            title="Inspect Store Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditSeller(seller)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#FFC107] border-amber-500/20'
                            }`}
                            title="Edit Store Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleApproval(seller.id, seller.isApproved)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              seller.isApproved
                                ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20'
                                : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                            }`}
                            title={seller.isApproved ? 'Suspend Store' : 'Approve Store'}
                          >
                            {seller.isApproved ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => onDeleteSeller(seller.id, seller.name)}
                            className="p-1.5 rounded-lg border bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Store"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={setPage}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setPage(1);
            }}
            isLight={isLight}
          />
        </div>
      )}

      {/* 5. Tab 2: KYC Queue */}
      {sellerTab === 'kyc' && (
        <div
          className={`rounded-2xl border overflow-hidden transition-all ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Pending Compliance & Trade License Approvals
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Inspect merchant submitted documentation and activate vendor privileges.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className={`border-b font-bold ${
                    isLight
                      ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <th className="py-3 px-4 font-black">Applicant / Store</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Document Type</th>
                  <th className="py-3 px-4">Compliance Document</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y font-semibold ${
                  isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'
                }`}
              >
                {pendingSellers.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        title="KYC queue is clear"
                        description="All merchant applications have been reviewed."
                        icon={CheckCircle}
                        isLight={isLight}
                      />
                    </td>
                  </tr>
                ) : (
                  pendingSellers.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                      }`}
                      onClick={() => onInspectKycDrawer(item)}
                    >
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {item.name}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {item.email}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        {item.type}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-blue-500 hover:underline flex items-center gap-1 font-bold">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{item.docs}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status="PENDING_KYC" />
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onApproveKYC(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onRejectKYC(item.id)}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Reject
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
      )}
    </div>
  );
}
