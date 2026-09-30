'use client';

import React, { useState, useMemo } from 'react';
import DataTableToolbar from '../ui/DataTableToolbar';
import PaginationBar from '../ui/PaginationBar';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import {
  Package,
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  CheckCircle,
  Tag,
  DollarSign,
  Boxes,
  Store,
  Layers,
  Image as ImageIcon
} from 'lucide-react';

interface ProductRecord {
  id: string;
  name: string;
  price: number;
  category: string;
  rating?: number;
  image?: string;
  sku: string;
  stock: number;
  vendor?: string;
  description?: string;
  status?: string;
}

interface ProductsViewProps {
  products: ProductRecord[];
  categories: any[];
  onOpenAddProduct: () => void;
  onOpenEditProduct: (product: ProductRecord) => void;
  onDeleteProduct: (id: string, name: string) => void;
  onInspectProduct: (product: ProductRecord) => void;
  onCreateCategory: (e: React.FormEvent, name: string) => Promise<void>;
  onRefresh: () => void;
  isLight: boolean;
}

export default function ProductsView({
  products = [],
  categories = [],
  onOpenAddProduct,
  onOpenEditProduct,
  onDeleteProduct,
  onInspectProduct,
  onCreateCategory,
  onRefresh,
  isLight
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [newCatName, setNewCatName] = useState('');
  const [catSuccessMsg, setCatSuccessMsg] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await onCreateCategory(e, newCatName.trim());
    setCatSuccessMsg(`Category "${newCatName}" added!`);
    setNewCatName('');
    setTimeout(() => setCatSuccessMsg(''), 3000);
  };

  // Filtered dataset
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (categoryFilter !== 'ALL' && (p.category || '').toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      // Stock filter
      if (stockFilter === 'LOW' && (p.stock || 0) > 10) return false;
      if (stockFilter === 'OUT' && (p.stock || 0) > 0) return false;
      if (stockFilter === 'IN' && (p.stock || 0) <= 0) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        const matchVendor = (p.vendor || '').toLowerCase().includes(q);
        return matchName || matchSku || matchVendor;
      }
      return true;
    });
  }, [products, categoryFilter, stockFilter, searchQuery]);

  // Paginated dataset
  const totalRecords = filteredProducts.length;
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = 'Product ID,SKU,Name,Category,Price (BDT),Stock,Vendor,Status\n';
    const rows = filteredProducts
      .map(
        (p) =>
          `"${p.id}","${p.sku}","${p.name}","${p.category}",${p.price},${p.stock},"${p.vendor || 'Direct'}","${
            p.status || (p.stock > 0 ? 'Active' : 'Out of Stock')
          }"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zibonbaba_products_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            Product Catalog & Taxonomy Management
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Multi-vendor central catalog, global category tree, inventory units, and SKU pricing.
          </p>
        </div>

        <button
          onClick={onOpenAddProduct}
          className="px-3.5 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          <span>Add New Product SKU</span>
        </button>
      </div>

      {/* 2. Taxonomy & Categories Management Ribbon */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white border-slate-200/90 shadow-sm'
            : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3 border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Marketplace Taxonomy Categories
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              {categories.length} Active Categories
            </span>
          </div>
          {catSuccessMsg && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg animate-fade-in">
              {catSuccessMsg}
            </span>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex flex-wrap gap-1.5 flex-1 max-h-24 overflow-y-auto pr-2 scrollbar-thin">
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setPage(1);
              }}
              className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                categoryFilter === 'ALL'
                  ? 'bg-[#FFC107] text-slate-950 font-black'
                  : isLight
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Categories ({products.length})
            </button>

            {categories.map((cat: any, idx: number) => {
              const name = typeof cat === 'string' ? cat : cat?.name || 'Category';
              const isSelected = categoryFilter.toLowerCase() === name.toLowerCase();
              const count = products.filter((p) => (p.category || '').toLowerCase() === name.toLowerCase()).length;

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setCategoryFilter(name);
                    setPage(1);
                  }}
                  className={`text-xs font-bold px-2.5 py-1 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#FFC107] text-slate-950 font-black'
                      : isLight
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Add Category Form */}
          <form onSubmit={handleAddCategorySubmit} className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
            <input
              type="text"
              placeholder="New Category Name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className={`text-xs px-3 h-8.5 rounded-xl border outline-none font-medium w-full lg:w-48 ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                  : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
              }`}
            />
            <button
              type="submit"
              className="h-8.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
            >
              + Add
            </button>
          </form>
        </div>
      </div>

      {/* 3. Products Catalog Table */}
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
            searchPlaceholder="Search product SKU, name, vendor..."
            filters={[
              {
                id: 'stock',
                label: 'Stock Status',
                value: stockFilter,
                options: [
                  { label: 'All Stock Levels', value: 'ALL' },
                  { label: 'In Stock (>0)', value: 'IN' },
                  { label: 'Low Stock (≤10)', value: 'LOW' },
                  { label: 'Out of Stock', value: 'OUT' }
                ],
                onChange: (v) => {
                  setStockFilter(v);
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
                <th className="py-3 px-4 font-black">Item & Thumbnail</th>
                <th className="py-3 px-4 font-black">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Selling Price</th>
                <th className="py-3 px-4">Stock Units</th>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y font-semibold ${
                isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'
              }`}
            >
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      title="No products found"
                      description="No catalog items match your search or filter criteria."
                      actionText="Reset Filters"
                      onAction={() => {
                        setSearchQuery('');
                        setCategoryFilter('ALL');
                        setStockFilter('ALL');
                      }}
                      secondaryActionText="+ Add Product SKU"
                      onSecondaryAction={onOpenAddProduct}
                      isLight={isLight}
                    />
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const isLowStock = (prod.stock || 0) <= 10 && (prod.stock || 0) > 0;
                  const isOutOfStock = (prod.stock || 0) <= 0;

                  return (
                    <tr
                      key={prod.id}
                      className={`transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'
                      }`}
                      onClick={() => onInspectProduct(prod)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=60'}
                            alt={prod.name}
                            className={`w-9 h-9 rounded-lg object-cover shrink-0 border ${
                              isLight ? 'border-slate-200' : 'border-slate-800'
                            }`}
                          />
                          <div className="min-w-0 max-w-[200px]">
                            <h4 className="font-extrabold text-slate-900 dark:text-white truncate">
                              {prod.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              ID: {prod.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-[#FFC107]">
                        {prod.sku}
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        {prod.category}
                      </td>

                      <td className="py-3 px-4 font-mono font-black text-slate-900 dark:text-white">
                        ৳{Number(prod.price || 0).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-500'
                              : isLowStock
                              ? 'text-amber-500'
                              : 'text-emerald-500'
                          }
                        >
                          {prod.stock || 0} units
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[130px]">
                        {prod.vendor || 'Direct Master'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <StatusBadge
                          status={
                            isOutOfStock
                              ? 'OUT_OF_STOCK'
                              : isLowStock
                              ? 'LOW_STOCK'
                              : prod.status || 'ACTIVE'
                          }
                        />
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onInspectProduct(prod)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                            }`}
                            title="Quick Drawer View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenEditProduct(prod)}
                            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-amber-500/10 hover:bg-amber-500/20 text-[#FFC107] border-amber-500/20'
                            }`}
                            title="Edit Product SKU"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 rounded-lg border bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20 transition-colors cursor-pointer"
                            title="Delete Product"
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
