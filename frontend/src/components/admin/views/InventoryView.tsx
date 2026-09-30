'use client';

import React, { useState } from 'react';
import KPICard from '../ui/KPICard';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import {
  Boxes,
  Warehouse,
  AlertTriangle,
  CheckCircle,
  Package,
  ArrowRightLeft,
  Search,
  RefreshCw
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  vendor?: string;
}

interface InventoryViewProps {
  products: ProductItem[];
  onRefresh: () => void;
  isLight: boolean;
}

export default function InventoryView({ products = [], onRefresh, isLight }: InventoryViewProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouses' | 'movements'>('inventory');

  const totalProducts = products.length;
  const inStockCount = products.filter((p) => p.stock > 10).length;
  const lowStockCount = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const warehouses = [
    { id: 'wh-1', name: 'Central Dhaka Fulfillment Hub', location: 'Tejgaon Industrial Area, Dhaka', capacity: '85%', totalUnits: '12,400', manager: 'Anisul Hoque' },
    { id: 'wh-2', name: 'Chittagong Port Logistics Point', location: 'Agrabad C/A, Chittagong', capacity: '62%', totalUnits: '8,200', manager: 'Farhan Kabir' },
    { id: 'wh-3', name: 'Sylhet Express Sort Facility', location: 'Subidbazar, Sylhet', capacity: '40%', totalUnits: '3,100', manager: 'Nayeem Hasan' }
  ];

  const movements = [
    { id: 'mov-1', sku: 'ELEC-8812', name: 'Smart Wireless Earbuds', type: 'INBOUND', qty: '+50', warehouse: 'Central Dhaka Hub', date: 'Today, 2:30 PM' },
    { id: 'mov-2', sku: 'APP-9921', name: 'Cotton Premium Polo Shirt', type: 'OUTBOUND', qty: '-4', warehouse: 'Central Dhaka Hub', date: 'Today, 1:15 PM' },
    { id: 'mov-3', sku: 'HOME-3321', name: 'Electric Coffee Grinder', type: 'RESTOCK', qty: '+20', warehouse: 'Chittagong Logistics', date: 'Yesterday' }
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            Supply Chain & Inventory Management
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Real-time stock velocity, warehouse allocation logs, and automated restock alerts.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Total SKUs"
          value={totalProducts}
          subtitle="Catalog catalogued"
          icon={Package}
          color="indigo"
          isLight={isLight}
        />
        <KPICard
          title="In Stock"
          value={inStockCount}
          subtitle="Adequate inventory"
          icon={CheckCircle}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Low Stock Alert"
          value={lowStockCount}
          subtitle="Stock ≤ 10 units"
          icon={AlertTriangle}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Out of Stock"
          value={outOfStockCount}
          subtitle="Requires reorder"
          icon={Boxes}
          color="rose"
          isLight={isLight}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Stock Levels ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'warehouses'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5" />
          <span>Warehouse Facilities ({warehouses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('movements')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'movements'
              ? 'bg-[#FFC107] text-slate-950 font-black shadow-xs'
              : isLight
              ? 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Stock Movements</span>
        </button>
      </div>

      {/* Content: Stock Levels */}
      {activeTab === 'inventory' && (
        <div
          className={`rounded-2xl border overflow-hidden transition-all ${
            isLight
              ? 'bg-white border-slate-200/90 shadow-sm'
              : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <div className="p-4 border-b flex items-center justify-between border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center rounded-xl px-3 h-9 w-72 border text-xs focus-within:border-amber-500 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search SKU or product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent w-full outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-bold ${isLight ? 'bg-slate-50/70 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                  <th className="py-3 px-4 font-black">SKU Code</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4 font-black">Stock On Hand</th>
                  <th className="py-3 px-4">Store / Vendor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-semibold ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= 10 && p.stock > 0;
                  const isOut = p.stock <= 0;
                  return (
                    <tr key={p.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-[#FFC107]">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{p.category}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">৳{p.price}</td>
                      <td className="py-3.5 px-4 font-mono font-black">
                        <span className={isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-emerald-500'}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{p.vendor || 'Direct'}</td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={isOut ? 'OUT_OF_STOCK' : isLow ? 'LOW_STOCK' : 'IN_STOCK'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content: Warehouses */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className={`p-5 rounded-2xl border space-y-3 ${
                isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-amber-500 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  {wh.id.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-slate-400">{wh.capacity} utilized</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{wh.name}</h4>
              <p className="text-xs text-slate-400">{wh.location}</p>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Total Units: <strong className="text-slate-800 dark:text-slate-200">{wh.totalUnits}</strong></span>
                <span className="text-slate-400">Lead: <strong className="text-slate-800 dark:text-slate-200">{wh.manager}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content: Movements */}
      {activeTab === 'movements' && (
        <div
          className={`rounded-2xl border p-5 space-y-3 ${
            isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
          }`}
        >
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Recent Stock Movement Ledger
          </h3>
          <div className="space-y-2">
            {movements.map((m) => (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-500">{m.sku}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{m.name}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${m.type === 'INBOUND' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-400'}`}>
                      {m.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.warehouse} • {m.date}</p>
                </div>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{m.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
