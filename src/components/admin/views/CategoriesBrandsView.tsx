'use client';

import React, { useState, useEffect, useMemo } from 'react';
import DataTableToolbar from '../ui/DataTableToolbar';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import {
  FolderTree,
  Tag,
  Plus,
  Edit,
  Trash2,
  Boxes,
  CheckCircle,
  AlertCircle,
  Search,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  X
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  createdAt?: string;
  icon?: string;
  description?: string;
}

interface BrandItem {
  id: string;
  name: string;
  origin?: string;
  categoryName?: string;
  productCount?: number;
  isFeatured?: boolean;
}

interface CategoriesBrandsViewProps {
  categories: any[];
  onRefresh: () => void;
  isLight: boolean;
  token?: string | null;
}

export default function CategoriesBrandsView({
  categories = [],
  onRefresh,
  isLight,
  token
}: CategoriesBrandsViewProps) {
  const [activeTab, setActiveTab] = useState<'categories' | 'brands' | 'tree'>('categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryList, setCategoryList] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Brands local state (derived & curated for marketplace)
  const [brandsList, setBrandsList] = useState<BrandItem[]>([
    { id: 'b1', name: 'Samsung', origin: 'South Korea', categoryName: 'Electronics', productCount: 42, isFeatured: true },
    { id: 'b2', name: 'Apple', origin: 'United States', categoryName: 'Electronics', productCount: 38, isFeatured: true },
    { id: 'b3', name: 'Sony', origin: 'Japan', categoryName: 'Electronics', productCount: 24, isFeatured: false },
    { id: 'b4', name: 'Xiaomi', origin: 'China', categoryName: 'Electronics', productCount: 56, isFeatured: true },
    { id: 'b5', name: 'Unilever', origin: 'United Kingdom', categoryName: 'Beauty & Health', productCount: 89, isFeatured: true },
    { id: 'b6', name: 'Bata', origin: 'Switzerland', categoryName: 'Apparel & Shoes', productCount: 65, isFeatured: true },
    { id: 'b7', name: 'Apex', origin: 'Bangladesh', categoryName: 'Apparel & Shoes', productCount: 48, isFeatured: true },
    { id: 'b8', name: 'Aarong', origin: 'Bangladesh', categoryName: 'Lifestyle', productCount: 72, isFeatured: true },
    { id: 'b9', name: 'Nestle', origin: 'Switzerland', categoryName: 'Grocery', productCount: 60, isFeatured: false },
    { id: 'b10', name: 'Pran', origin: 'Bangladesh', categoryName: 'Grocery', productCount: 112, isFeatured: true }
  ]);

  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandOrigin, setNewBrandOrigin] = useState('');
  const [newBrandCategory, setNewBrandCategory] = useState('Electronics');

  // Fetch real categories from API
  const fetchCategoryData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (res.ok && data.categories) {
        setCategoryList(data.categories);
      } else if (Array.isArray(categories)) {
        // Fallback to prop
        setCategoryList(
          categories.map((c, idx) =>
            typeof c === 'string'
              ? { id: `cat-${idx}`, name: c, slug: c.toLowerCase().replace(/\s+/g, '-'), productCount: 0 }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('Fetch categories error:', err);
      setErrorMsg('Failed to load live categories.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [categories]);

  // Create Category handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          name: formName.trim(),
          slug: formSlug.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      setSuccessMsg(`Category "${formName}" created successfully!`);
      setFormName('');
      setFormSlug('');
      setFormDescription('');
      setIsAddModalOpen(false);
      fetchCategoryData();
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating category');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Update Category handler
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !formName.trim()) return;

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        },
        body: JSON.stringify({
          id: editingCategory.id,
          name: formName.trim(),
          slug: formSlug.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update category');
      }

      setSuccessMsg(`Category "${formName}" updated successfully!`);
      setIsEditModalOpen(false);
      setEditingCategory(null);
      fetchCategoryData();
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating category');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Delete Category handler
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? This cannot be undone.`)) {
      return;
    }

    try {
      const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('zibonbaba_token') : null);
      const res = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: activeToken ? `Bearer ${activeToken}` : ''
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete category');
      }

      setSuccessMsg(`Category "${name}" deleted.`);
      fetchCategoryData();
      onRefresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error deleting category');
    }
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setIsEditModalOpen(true);
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categoryList.filter(c => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q);
    });
  }, [categoryList, searchQuery]);

  // Filtered brands
  const filteredBrands = useMemo(() => {
    return brandsList.filter(b => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        (b.origin || '').toLowerCase().includes(q) ||
        (b.categoryName || '').toLowerCase().includes(q)
      );
    });
  }, [brandsList, searchQuery]);

  // Add brand locally
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const newBrand: BrandItem = {
      id: `b-${Date.now()}`,
      name: newBrandName.trim(),
      origin: newBrandOrigin.trim() || 'Bangladesh',
      categoryName: newBrandCategory,
      productCount: 0,
      isFeatured: true
    };

    setBrandsList([newBrand, ...brandsList]);
    setNewBrandName('');
    setNewBrandOrigin('');
    setSuccessMsg(`Brand "${newBrand.name}" registered successfully.`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-amber-500" />
            Category & Brand Architecture
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Manage multi-tier product categories, brand directories, slugs, and navigation taxonomy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFormName('');
              setFormSlug('');
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
          <button
            onClick={fetchCategoryData}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              isLight
                ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
            title="Refresh Categories"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className={`flex items-center gap-2 border-b pb-3 text-xs font-bold ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Marketplace Categories ({categoryList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'brands'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Brands Directory ({brandsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tree')}
          className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'tree'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visual Hierarchy Tree</span>
        </button>
      </div>

      {/* 1. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex items-center justify-between gap-4">
            <div
              className={`flex items-center rounded-xl px-3 h-10 border text-xs w-full max-w-sm ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
              }`}
            >
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search categories by name or slug..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Showing {filteredCategories.length} of {categoryList.length} categories
            </span>
          </div>

          {/* Grid of Categories */}
          {filteredCategories.length === 0 ? (
            <EmptyState
              title="No categories found"
              description={searchQuery ? `No category matching "${searchQuery}"` : 'Get started by creating your first category.'}
              icon={FolderTree}
              isLight={isLight}
              actionText="Add Category"
              onAction={() => setIsAddModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map(cat => (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border transition-all hover:shadow-md ${
                    isLight
                      ? 'bg-white border-slate-200/80 hover:border-amber-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-black">
                      {cat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(cat)}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                          isLight
                            ? 'border-slate-200 hover:bg-slate-100 text-slate-600'
                            : 'border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                        title="Edit Category"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                    slug: /{cat.slug}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Boxes className="w-3.5 h-3.5 text-amber-500" />
                      <span>{cat.productCount ?? 0} Listed Items</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-500">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. BRANDS TAB */}
      {activeTab === 'brands' && (
        <div className="space-y-6">
          {/* Add Brand Inline Form */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3 flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-amber-500" />
              Register New Marketplace Brand
            </h3>
            <form onSubmit={handleAddBrand} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Brand Name (e.g. Apex, Samsung)"
                value={newBrandName}
                onChange={e => setNewBrandName(e.target.value)}
                required
                className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <input
                type="text"
                placeholder="Country of Origin (e.g. Bangladesh)"
                value={newBrandOrigin}
                onChange={e => setNewBrandOrigin(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
              <select
                value={newBrandCategory}
                onChange={e => setNewBrandCategory(e.target.value)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              >
                {categoryList.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Register Brand
              </button>
            </form>
          </div>

          {/* Brands Table */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead
                  className={`border-b text-[11px] font-black uppercase tracking-wider ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <tr>
                    <th className="px-5 py-3.5">Brand</th>
                    <th className="px-5 py-3.5">Primary Category</th>
                    <th className="px-5 py-3.5">Origin</th>
                    <th className="px-5 py-3.5">Catalog Products</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {filteredBrands.map(brand => (
                    <tr
                      key={brand.id}
                      className={`transition ${isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 font-black flex items-center justify-center text-xs">
                            {brand.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block">{brand.name}</span>
                            {brand.isFeatured && (
                              <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Featured Brand
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-600 dark:text-slate-300">
                        {brand.categoryName || 'General'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono">
                        {brand.origin || 'International'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-amber-500">
                        {brand.productCount || 0} products
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                          Verified Partner
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setBrandsList(brandsList.filter(b => b.id !== brand.id));
                          }}
                          className="p-1 rounded text-rose-500 hover:bg-rose-500/10 transition"
                          title="Remove Brand"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* 3. VISUAL TREE TAB */}
      {activeTab === 'tree' && (
        <div
          className={`p-6 rounded-2xl border ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}
        >
          <div className="mb-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">Marketplace Taxonomy Tree</h3>
            <p className="text-xs text-slate-400">Interactive visual hierarchy of Root Categories and Linked Merchant Brands</p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 font-bold flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              <span>Zibonbaba Multi-Vendor Global Root</span>
            </div>

            <div className="pl-6 border-l-2 border-amber-500/30 space-y-4">
              {categoryList.map(cat => {
                const relatedBrands = brandsList.filter(
                  b => (b.categoryName || '').toLowerCase() === cat.name.toLowerCase()
                );

                return (
                  <div key={cat.id} className="space-y-2">
                    <div
                      className={`p-3 rounded-xl border flex items-center justify-between ${
                        isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-amber-500" />
                        <span className="font-black text-slate-900 dark:text-white">{cat.name}</span>
                        <span className="text-[10px] font-normal text-slate-400 font-mono">({cat.slug})</span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-500">
                        {cat.productCount ?? 0} SKUs
                      </span>
                    </div>

                    {relatedBrands.length > 0 && (
                      <div className="pl-6 border-l border-slate-700/50 space-y-1.5">
                        {relatedBrands.map(b => (
                          <div
                            key={b.id}
                            className="p-2 rounded-lg bg-slate-800/30 border border-slate-800 flex items-center justify-between text-[11px]"
                          >
                            <span className="text-slate-300 font-bold flex items-center gap-1.5">
                              <Tag className="w-3 h-3 text-amber-400" />
                              {b.name}
                            </span>
                            <span className="text-[10px] text-slate-400">{b.origin}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-sm">Add New Category</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Home Appliances"
                  value={formName}
                  onChange={e => {
                    setFormName(e.target.value);
                    if (!formSlug) {
                      setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL Slug</label>
                <input
                  type="text"
                  placeholder="e.g. home-appliances"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FFC107] text-slate-950 font-black"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h3 className="font-black text-sm">Edit Category: {editingCategory.name}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 hover:text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-400 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">URL Slug</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={e => setFormSlug(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border font-mono ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#FFC107] text-slate-950 font-black"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
