'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Download, Trash2, Edit, CheckSquare, Square, Filter, ChevronDown, ArrowUpDown } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  sortKey?: string;
  width?: string;
}

interface EnterpriseDataTableProps<T extends { id: string | number }> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  title?: string;
  isLoading?: boolean;
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'danger' | 'primary' | 'secondary';
    onClick: (selectedRows: T[]) => void;
  }[];
  onRowClick?: (row: T) => void;
}

export default function EnterpriseDataTable<T extends { id: string | number }>({
  columns,
  data,
  searchPlaceholder = 'Search records...',
  title,
  isLoading = false,
  bulkActions,
  onRowClick
}: EnterpriseDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Search Filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val || '').toLowerCase().includes(q)
      )
    );
  }, [data, search]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a: any, b: any) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === valB) return 0;
      if (valA === undefined || valA === null) return 1;
      if (valB === undefined || valB === null) return -1;
      
      const comparison = valA > valB ? 1 : -1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSelectAll = () => {
    if (selectedIds.size === paginatedData.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedData.map((d) => d.id)));
    }
  };

  const handleToggleSelect = (id: string | number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSort = (key: string) => {
    if (sortField === key) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(key);
      setSortDirection('asc');
    }
  };

  const selectedRows = useMemo(() => {
    return data.filter((row) => selectedIds.has(row.id));
  }, [data, selectedIds]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Top Header & Search Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/40">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {title && <h3 className="text-sm font-extrabold text-slate-100 whitespace-nowrap">{title}</h3>}
          <div className="relative flex-grow sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {selectedIds.size > 0 && bulkActions && (
            <div className="flex items-center gap-2 animate-fade-in bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl">
              <span className="text-[11px] font-bold text-amber-400">
                {selectedIds.size} Selected
              </span>
              <div className="h-4 w-px bg-amber-500/20" />
              {bulkActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => action.onClick(selectedRows)}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                      action.variant === 'danger'
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-3.5 w-10 text-center">
                <button onClick={handleSelectAll} className="p-1 hover:text-white transition">
                  {selectedIds.size === paginatedData.length && paginatedData.length > 0 ? (
                    <CheckSquare className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </th>
              {columns.map((col, idx) => {
                const sortKey = (col.sortKey || (typeof col.accessor === 'string' ? col.accessor : null)) as string | null;
                const isSorted = sortKey && sortField === sortKey;
                return (
                  <th
                    key={idx}
                    className={`p-3.5 font-black select-none ${col.width || ''} ${
                      col.sortable && sortKey ? 'cursor-pointer hover:text-slate-100 transition' : ''
                    }`}
                    onClick={() => col.sortable && sortKey && handleSort(sortKey)}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && sortKey && (
                        <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-amber-400' : 'text-slate-600'}`} />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-12 text-center text-slate-500">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="font-bold text-xs">Querying Enterprise Ledger...</p>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-12 text-center text-slate-500">
                  No records match the active criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const isSelected = selectedIds.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={`transition-colors ${
                      isSelected ? 'bg-amber-500/5' : 'hover:bg-slate-800/30'
                    } ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleToggleSelect(row.id)} className="p-1 hover:text-white transition">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>
                    </td>
                    {columns.map((col, idx) => (
                      <td key={idx} className="p-3.5 font-medium text-slate-200">
                        {typeof col.accessor === 'function'
                          ? col.accessor(row)
                          : (row[col.accessor] as unknown as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="ml-2 font-medium">
            Showing {sortedData.length === 0 ? 0 : (page - 1) * pageSize + 1} -{' '}
            {Math.min(page * pageSize, sortedData.length)} of {sortedData.length} records
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-bold text-slate-300">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none rounded-lg hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
