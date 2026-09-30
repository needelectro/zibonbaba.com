'use client';

import React, { useState, useMemo } from 'react';
import DataTableToolbar from '../ui/DataTableToolbar';
import PaginationBar from '../ui/PaginationBar';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import KPICard from '../ui/KPICard';
import {
  Users,
  UserCheck,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Wallet,
  Phone,
  Mail,
  UserX
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount?: number;
  totalSpent?: number;
  walletBalance?: number;
  loyaltyPoints?: number;
  status: string;
  createdAt?: string;
}

interface CustomersViewProps {
  customers: CustomerRecord[];
  onOpenAddCustomer: () => void;
  onOpenEditCustomer: (customer: CustomerRecord) => void;
  onToggleStatus: (customer: CustomerRecord) => void;
  onDeleteCustomer: (id: string, email: string) => void;
  onInspectCustomer: (customer: CustomerRecord) => void;
  onRefresh: () => void;
  isLight: boolean;
}

export default function CustomersView({
  customers = [],
  onOpenAddCustomer,
  onOpenEditCustomer,
  onToggleStatus,
  onDeleteCustomer,
  onInspectCustomer,
  onRefresh,
  isLight
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Metrics
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => (c.status || '').toUpperCase() === 'ACTIVE').length;
  const suspendedCount = customers.filter((c) => (c.status || '').toUpperCase() === 'SUSPENDED').length;
  const vipCount = customers.filter((c) => (c.totalSpent || 0) > 10000 || (c.status || '').toUpperCase() === 'VIP').length;

  // Filtered
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== 'ALL' && (c.status || '').toUpperCase() !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (c.name || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        return matchName || matchEmail || matchPhone;
      }
      return true;
    });
  }, [customers, statusFilter, searchQuery]);

  // Paginated
  const totalRecords = filteredCustomers.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, page, pageSize]);

  const handleExportCsv = () => {
    const headers = 'Customer ID,Name,Email,Phone,Orders Count,Total Spent (BDT),Wallet Balance (BDT),Status\n';
    const rows = filteredCustomers
      .map(
        (c) =>
          `"${c.id}","${c.name}","${c.email}","${c.phone || 'N/A'}",${c.ordersCount || 0},${c.totalSpent || 0},${
            c.walletBalance || 0
          },"${c.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zibonbaba_customers_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Customer Directory & CRM Profiles
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage buyer accounts, loyalty point balances, wallet funds, and account verification states.
          </p>
        </div>

        <button
          onClick={onOpenAddCustomer}
          className="px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 stroke-[3px]" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* 2. Customer KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total Customers"
          value={totalCount}
          subtitle="Registered users"
          icon={Users}
          color="purple"
          isLight={isLight}
        />
        <KPICard
          title="Active Accounts"
          value={activeCount}
          subtitle="Verified buyers"
          icon={UserCheck}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="VIP Buyers"
          value={vipCount}
          subtitle="Spend > ৳10k"
          icon={Wallet}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Suspended"
          value={suspendedCount}
          subtitle="Restricted logins"
          icon={UserX}
          color="rose"
          isLight={isLight}
        />
      </div>

      {/* 3. Customers Table Card */}
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
            searchPlaceholder="Search customer name, email, phone..."
            filters={[
              {
                id: 'status',
                label: 'Status',
                value: statusFilter,
                options: [
                  { label: 'All Statuses', value: 'ALL' },
                  { label: 'Active Only', value: 'ACTIVE' },
                  { label: 'Suspended', value: 'SUSPENDED' }
                ],
                onChange: (v) => {
                  setStatusFilter(v);
                  setPage(1);
                }
              }
            ]}
            onRefresh={onRefresh}
            onExport={handleExportCsv}
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
                <th className="py-3 px-4 font-black">Customer Profile</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Loyalty Points</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-semibold ${
                isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'
              }`}
            >
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No customers found"
                      description="No customer accounts match your search or filter."
                      actionText="Reset Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                      }}
                      secondaryActionText="+ Add Customer"
                      onSecondaryAction={onOpenAddCustomer}
                      isLight={isLight}
                    />
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((cust) => {
                  const isSuspended = (cust.status || '').toUpperCase() === 'SUSPENDED';
                  return (
                    <tr
                      key={cust.id}
                      className={`transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                      }`}
                      onClick={() => onInspectCustomer(cust)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FFC107] to-amber-500 flex items-center justify-center font-black text-slate-950 text-xs shadow-xs shrink-0">
                            {(cust.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 max-w-[180px]">
                            <h4 className="font-extrabold text-slate-900 dark:text-white truncate">
                              {cust.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">{cust.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {cust.phone || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {cust.ordersCount || 0} Orders
                      </td>

                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                        ৳{Number(cust.totalSpent || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                        ৳{Number(cust.walletBalance || 0).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {cust.loyaltyPoints || 0} Pts
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={cust.status || 'ACTIVE'} />
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onInspectCustomer(cust)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                            title="Inspect Profile Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditCustomer(cust)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#FFC107] border-amber-500/20'
                            }`}
                            title="Edit Customer Profile"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onToggleStatus(cust)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/20'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/20'
                            }`}
                            title={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
                          >
                            {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(cust.id, cust.email)}
                            className="p-1.5 rounded-lg border bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Customer Account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
    </div>
  );
}
