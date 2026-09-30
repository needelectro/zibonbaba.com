'use client';

import React, { useState, useEffect } from 'react';
import { X, Package, DollarSign, Image as ImageIcon, Layers, Store, Check, Info } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: any;
  categories: any[];
  isLight: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  categories = [],
  isLight
}: ProductFormModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'category' | 'status'>('basic');
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('25');
  const [category, setCategory] = useState('Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [vendor, setVendor] = useState('Zibonbaba Direct');
  const [status, setStatus] = useState('PUBLISHED');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setSku(initialData.sku || '');
      setDescription(initialData.description || '');
      setPrice(initialData.price !== undefined ? initialData.price.toString() : '');
      setStock(initialData.stock !== undefined ? initialData.stock.toString() : '20');
      setCategory(initialData.category || 'Electronics');
      setImageUrl(initialData.image || '');
      setVendor(initialData.vendor || 'Zibonbaba Direct');
      setStatus(initialData.status || 'PUBLISHED');
    } else {
      setName('');
      setSku(`SKU-${Date.now().toString().slice(-6)}`);
      setDescription('');
      setPrice('');
      setStock('25');
      setCategory(categories && categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : categories[0]?.name || 'Electronics') : 'Electronics');
      setImageUrl('');
      setVendor('Zibonbaba Direct');
      setStatus('PUBLISHED');
    }
    setActiveTab('basic');
  }, [initialData, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !sku.trim()) {
      alert('Please fill out product name, SKU, and price.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        id: initialData?.id,
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        category,
        image: imageUrl.trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        vendor: vendor.trim(),
        status
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Info },
    { id: 'pricing', label: 'Pricing & Stock', icon: DollarSign },
    { id: 'media', label: 'Media & Gallery', icon: ImageIcon },
    { id: 'category', label: 'Category & Vendor', icon: Layers },
    { id: 'status', label: 'Visibility & Status', icon: Package }
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div
        className={`w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden animate-slide-up ${
          isLight
            ? 'bg-white border-slate-200 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-slate-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                {initialData ? `Edit Product SKU: ${initialData.sku}` : 'Register New Product SKU'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Structured multi-section catalog configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs Header */}
        <div
          className={`flex border-b text-xs font-bold px-4 overflow-x-auto scrollbar-none ${
            isLight ? 'border-slate-200 bg-slate-50/40' : 'border-slate-800 bg-slate-950/20'
          }`}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                    : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto scrollbar-thin text-xs font-semibold">
            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Wireless Noise-Cancelling Headphones"
                    className={`w-full p-2.5 rounded-xl border outline-none font-medium text-xs ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="e.g. ELEC-9821"
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono uppercase text-xs ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Brand / Vendor
                    </label>
                    <input
                      type="text"
                      value={vendor}
                      onChange={(e) => setVendor(e.target.value)}
                      placeholder="e.g. Luxury Baba or Direct"
                      className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed specifications, features, warranty terms..."
                    className={`w-full p-2.5 rounded-xl border outline-none font-medium text-xs resize-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PRICING & STOCK */}
            {activeTab === 'pricing' && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Selling Price (৳ BDT) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="e.g. 1500"
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono text-xs ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Available Stock Units *
                    </label>
                    <input
                      type="number"
                      required
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      placeholder="e.g. 50"
                      className={`w-full p-2.5 rounded-xl border outline-none font-mono text-xs ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                          : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                      }`}
                    />
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isLight ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'}`}>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    💡 <strong>Automated Stock Alerts:</strong> When stock falls below 10 units, this SKU will trigger an automatic low-stock notice in the Action Center.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: MEDIA */}
            {activeTab === 'media' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className={`w-full p-2.5 rounded-xl border outline-none text-xs ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500'
                        : 'bg-slate-950 border-slate-800 text-white focus:border-amber-400'
                    }`}
                  />
                </div>

                {imageUrl && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Preview:</p>
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      className="w-32 h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CATEGORY */}
            {activeTab === 'category' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Taxonomy Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold text-xs ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    {(categories || []).map((c: any, idx: number) => {
                      const cName = typeof c === 'string' ? c : c?.name || 'Category';
                      return <option key={idx} value={cName}>{cName}</option>;
                    })}
                  </select>
                </div>
              </div>
            )}

            {/* TAB 5: STATUS */}
            {activeTab === 'status' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Catalog Visibility Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-bold text-xs ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-white'
                    }`}
                  >
                    <option value="PUBLISHED">PUBLISHED (Live on Storefront)</option>
                    <option value="DRAFT">DRAFT (Hidden from Buyers)</option>
                    <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div
            className={`px-5 py-3.5 border-t flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isLight ? 'border-slate-200 hover:bg-slate-100 text-slate-700' : 'border-slate-800 hover:bg-slate-800 text-slate-300'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#FFC107] hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Save Product Changes' : 'Create Product SKU'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
