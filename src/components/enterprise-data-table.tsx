'use client';

import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Download, SlidersHorizontal } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
}

interface EnterpriseDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  exportFileName?: string;
  itemsPerPage?: number;
}

export default function EnterpriseDataTable<T extends { id?: string | number }>({
  data,
  columns,
  searchPlaceholder = 'Search records...',
  exportFileName = 'data_export',
  itemsPerPage = 10,
}: EnterpriseDataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Search Filter
  const filteredData = data.filter((row) => {
    if (!search.trim()) return true;
    return Object.values(row).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortColumn === null) return 0;
    const col = columns[sortColumn];
    const valA = typeof col.accessor === 'function' ? '' : a[col.accessor];
    const valB = typeof col.accessor === 'function' ? '' : b[col.accessor];

    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage) || 1;
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (index: number) => {
    if (sortColumn === index) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(index);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => c.header).join(',');
    const rows = data.map((row) =>
      columns
        .map((c) => {
          const val = typeof c.accessor === 'function' ? '' : row[c.accessor];
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-neutral-light rounded-2xl shadow-card overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-neutral-light flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-light/20">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-white border border-neutral-light rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-neutral-dark placeholder:text-neutral-muted outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-white hover:bg-neutral-light border border-neutral-light text-neutral-dark text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-neutral-muted" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-neutral-light/50 border-b border-neutral-light text-neutral-muted font-bold uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable !== false && handleSort(idx)}
                  className={`py-3 px-4 ${col.sortable !== false ? 'cursor-pointer select-none hover:text-neutral-dark' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable !== false && sortColumn === idx && (
                      sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-light/60">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-neutral-muted">
                  No records match your criteria.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rIdx) => (
                <tr key={row.id || rIdx} className="hover:bg-neutral-light/20 transition-colors">
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="py-3 px-4 font-medium text-neutral-dark">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-neutral-light flex items-center justify-between text-xs text-neutral-muted bg-neutral-light/10">
        <span>
          Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} records
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg border border-neutral-light bg-white hover:bg-neutral-light disabled:opacity-40 disabled:cursor-not-allowed font-bold"
          >
            Prev
          </button>
          <span className="px-2 font-bold text-neutral-dark">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg border border-neutral-light bg-white hover:bg-neutral-light disabled:opacity-40 disabled:cursor-not-allowed font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
