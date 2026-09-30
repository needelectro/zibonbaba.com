'use client';

import React, { useState, useMemo } from 'react';
import DataTableToolbar from '../ui/DataTableToolbar';
import PaginationBar from '../ui/PaginationBar';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import { Printer, Eye, CreditCard, Download, Filter, CheckSquare, Square } from 'lucide-react';

interface OrderItem {
  id?: string;
  name?: string;
  product?: { name: string; price: number };
  quantity?: number;
  price?: number;
}

interface OrderRecord {
  id: string;
  date: string;
  items?: OrderItem[];
  total: number;
  status: string;
  source: string;
  customerName?: string;
  branchName?: string;
  customerEmail?: string;
}

interface OrdersViewProps {
  orders: OrderRecord[];
  onSelectOrder: (order: OrderRecord) => void;
  onPrintMemo: (order: OrderRecord) => void;
  onPrintBulkMemos: (orders: OrderRecord[]) => void;
  onRefresh: () => void;
  isLight: boolean;
}

export default function OrdersView({
  orders = [],
  onSelectOrder,
  onPrintMemo,
  onPrintBulkMemos,
  onRefresh,
  isLight
}: OrdersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Status Tabs
  const statusTabs = [
    { id: 'ALL', label: 'All Orders' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'PROCESSING', label: 'Processing' },
    { id: 'SHIPPED', label: 'Shipped' },
    { id: 'DELIVERED', label: 'Delivered' },
    { id: 'CANCELLED', label: 'Cancelled' }
  ];

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (statusFilter !== 'ALL' && (o.status || '').toUpperCase() !== statusFilter) {
        return false;
      }
      // Source filter
      if (sourceFilter !== 'ALL' && (o.source || '').toUpperCase() !== sourceFilter) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = (o.id || '').toLowerCase().includes(q);
        const matchCust = (o.customerName || '').toLowerCase().includes(q);
        const matchStore = (o.branchName || '').toLowerCase().includes(q);
        return matchId || matchCust || matchStore;
      }
      return true;
    });
  }, [orders, statusFilter, sourceFilter, searchQuery]);

  // Paginated dataset
  const totalRecords = filteredOrders.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, page, pageSize]);

  // Bulk selection toggles
  const isAllSelected =
    paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrderIds.includes(o.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      const ids = paginatedOrders.map((o) => o.id);
      setSelectedOrderIds(Array.from(new Set([...selectedOrderIds, ...ids])));
    }
  };

  const handleToggleRow = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Export CSV
  const handleExportCsv = () => {
    const toExport = selectedOrderIds.length > 0
      ? orders.filter((o) => selectedOrderIds.includes(o.id))
      : filteredOrders;

    const headers = 'Order ID,Date,Customer,Store,Items Count,Gross Total (BDT),Status,Source\n';
    const rows = toExport
      .map(
        (o) =>
          `"${o.id}","${o.date}","${o.customerName || 'N/A'}","${o.branchName || 'Zibonbaba'}","${
            o.items?.length || 0
          }",${o.total},"${o.status}","${o.source}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zibonbaba_orders_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Orders & Shipments Register
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Operational fulfillment hub, invoice dispatch tracking, and cash memo processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrintBulkMemos(filteredOrders)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print cash memos for all filtered orders"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print All Memos ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Status Segment Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b pb-3 border-slate-200 dark:border-slate-800">
        {statusTabs.map((tab) => {
          const count =
            tab.id === 'ALL'
              ? orders.length
              : orders.filter((o) => (o.status || '').toUpperCase() === tab.id).length;
          const isActive = statusFilter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isActive
                    ? 'bg-slate-950 text-white'
                    : isLight
                    ? 'bg-slate-100 text-slate-600'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
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
            searchPlaceholder="Search order ref, customer, store..."
            filters={[
              {
                id: 'source',
                label: 'Channel',
                value: sourceFilter,
                options: [
                  { label: 'All Channels', value: 'ALL' },
                  { label: 'Online Store', value: 'ONLINE' },
                  { label: 'POS Terminal', value: 'POS' }
                ],
                onChange: (v) => {
                  setSourceFilter(v);
                  setPage(1);
                }
              }
            ]}
            onRefresh={onRefresh}
            onExport={handleExportCsv}
            selectedCount={selectedOrderIds.length}
            bulkActions={[
              {
                label: `Print Selected Memos (${selectedOrderIds.length})`,
                icon: Printer,
                variant: 'primary',
                onClick: () => {
                  const toPrint = orders.filter((o) => selectedOrderIds.includes(o.id));
                  onPrintBulkMemos(toPrint);
                }
              }
            ]}
            onClearSelection={() => setSelectedOrderIds([])}
            isLight={isLight}
          />
        </div>

        {/* Orders Table */}
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
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                  />
                </th>
                <th className="py-3 px-4 font-black">Order Ref</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Fulfillment Store</th>
                <th className="py-3 px-4">Gross Total</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-semibold ${
                isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'
              }`}
            >
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <EmptyState
                      title="No orders found"
                      description="There are no orders matching your current filters."
                      actionText="Clear Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setStatusFilter('ALL');
                        setSourceFilter('ALL');
                      }}
                      isLight={isLight}
                    />
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isSelected = selectedOrderIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? isLight
                            ? 'bg-amber-50/50'
                            : 'bg-amber-500/[0.04]'
                          : isLight
                          ? 'hover:bg-slate-50/80'
                          : 'hover:bg-slate-800/40'
                      }`}
                      onClick={() => onSelectOrder(order)}
                    >
                      <td
                        className="py-3.5 px-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleRow(order.id)}
                          className="rounded text-amber-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
                        />
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-[#FFC107]">
                        #{order.id.slice(0, 10)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {order.date}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {order.customerName || 'Direct Customer'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                        {order.branchName || 'Zibonbaba Hub'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-slate-900 dark:text-white">
                        ৳{Number(order.total || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {order.items?.length || 0} Units
                      </td>
                      <td className="py-3.5 px-4 text-[10px] font-mono font-bold text-slate-400">
                        {order.source}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintMemo(order)}
                            className={`px-2 py-1 rounded-lg border text-[10.5px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#FFC107] border-amber-500/20'
                            }`}
                            title="Print Invoice / Cash Memo"
                          >
                            <Printer className="w-3 h-3" /> Memo
                          </button>
                          <button
                            onClick={() => onSelectOrder(order)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                            title="Inspect Order Details Drawer"
                          >
                            <Eye className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
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
