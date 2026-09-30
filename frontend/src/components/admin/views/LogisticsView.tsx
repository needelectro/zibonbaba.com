'use client';

import React, { useState } from 'react';
import KPICard from '../ui/KPICard';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import {
  MapPin,
  Truck,
  Users,
  CheckCircle,
  Package,
  Search,
  RefreshCw,
  Send
} from 'lucide-react';

interface DeliveryManRecord {
  id: string;
  user?: { fullName?: string; email?: string; phone?: string };
  name?: string;
  email?: string;
  phone?: string;
  vehicleType?: string;
  status: string;
  assignedOrdersCount?: number;
  totalDelivered?: number;
}

interface UnassignedOrderRecord {
  id: string;
  total: number;
  status: string;
  customer?: { fullName?: string; phone?: string };
  address?: string;
}

interface LogisticsViewProps {
  deliveryMen: DeliveryManRecord[];
  unassignedOrders: UnassignedOrderRecord[];
  onUpdateDeliveryManStatus: (id: string, status: string) => Promise<void>;
  onAssignOrderToRider: (orderId: string, deliveryManId: string) => Promise<void>;
  isAssigningOrder: string | null;
  onRefresh: () => void;
  isLight: boolean;
}

export default function LogisticsView({
  deliveryMen = [],
  unassignedOrders = [],
  onUpdateDeliveryManStatus,
  onAssignOrderToRider,
  isAssigningOrder,
  onRefresh,
  isLight
}: LogisticsViewProps) {
  const [selectedRider, setSelectedRider] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');

  const activeRiders = deliveryMen.filter((d) => (d.status || '').toUpperCase() === 'ACTIVE');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Courier & Logistics Fleet Control
          </h2>
          <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Dispatch riders, delivery partner fleet, unassigned order queues, and rider allocations.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <KPICard
          title="Fleet Size"
          value={deliveryMen.length}
          subtitle="Registered courier riders"
          icon={Truck}
          color="blue"
          isLight={isLight}
        />
        <KPICard
          title="Active On-Duty"
          value={activeRiders.length}
          subtitle="Ready for dispatch"
          icon={CheckCircle}
          color="emerald"
          isLight={isLight}
        />
        <KPICard
          title="Unassigned Orders"
          value={unassignedOrders.length}
          subtitle="Awaiting rider assignment"
          icon={Package}
          color="amber"
          isLight={isLight}
        />
        <KPICard
          title="Delivery Success"
          value="99.2%"
          subtitle="SLA fulfillment rate"
          icon={MapPin}
          color="indigo"
          isLight={isLight}
        />
      </div>

      {/* Unassigned Orders Queue */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}
      >
        <div className="p-4 border-b flex items-center justify-between border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-500" />
              Unassigned Orders Dispatch Queue ({unassignedOrders.length})
            </h3>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Assign these customer orders directly to active fleet riders.
            </p>
          </div>
          <button onClick={onRefresh} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-bold ${isLight ? 'bg-slate-50/70 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <th className="py-3 px-4 font-black">Order Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Delivery Address</th>
                <th className="py-3 px-4">Gross Total</th>
                <th className="py-3 px-4">Assign Active Rider</th>
                <th className="py-3 px-4 text-right">Dispatch Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-semibold ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
              {unassignedOrders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      title="All orders assigned"
                      description="No customer orders currently awaiting rider assignment."
                      icon={CheckCircle}
                      isLight={isLight}
                    />
                  </td>
                </tr>
              ) : (
                unassignedOrders.map((ord) => (
                  <tr key={ord.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-600 dark:text-[#FFC107]">
                      #{ord.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {ord.customer?.fullName || 'Customer'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      {ord.address || 'Dhaka Metropolitan'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ৳{Number(ord.total || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={selectedRider[ord.id] || ''}
                        onChange={(e) => setSelectedRider({ ...selectedRider, [ord.id]: e.target.value })}
                        className={`text-xs p-1.5 rounded-lg border outline-none font-bold ${
                          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800 text-white'
                        }`}
                      >
                        <option value="">Select Rider...</option>
                        {deliveryMen.map((dm) => (
                          <option key={dm.id} value={dm.id}>
                            {dm.name || dm.user?.fullName || dm.user?.email} ({dm.vehicleType || 'Bike'})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          const rId = selectedRider[ord.id];
                          if (!rId) {
                            alert('Please select a rider from the dropdown first.');
                            return;
                          }
                          onAssignOrderToRider(ord.id, rId);
                        }}
                        disabled={isAssigningOrder === ord.id}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isAssigningOrder === ord.id ? 'Assigning...' : 'Assign & Dispatch'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fleet Delivery Personnel Roster */}
      <div
        className={`rounded-2xl border overflow-hidden transition-all ${
          isLight ? 'bg-white border-slate-200/90 shadow-sm' : 'bg-slate-900/90 border-slate-800 shadow-xl'
        }`}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            Delivery Fleet Roster ({deliveryMen.length} Personnel)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b font-bold ${isLight ? 'bg-slate-50/70 border-slate-200 text-slate-500' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                <th className="py-3 px-4 font-black">Rider Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Vehicle Type</th>
                <th className="py-3 px-4">Active Deliveries</th>
                <th className="py-3 px-4 text-center">Duty Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y font-semibold ${isLight ? 'divide-slate-100 text-slate-800' : 'divide-slate-800/80 text-slate-300'}`}>
              {deliveryMen.map((dm) => (
                <tr key={dm.id} className={isLight ? 'hover:bg-slate-50/80' : 'hover:bg-slate-800/40'}>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {dm.name || dm.user?.fullName || dm.user?.email}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {dm.phone || dm.user?.phone || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {dm.vehicleType || 'Motorcycle'}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-500">
                    {dm.assignedOrdersCount || 0} Orders
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <StatusBadge status={dm.status || 'ACTIVE'} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onUpdateDeliveryManStatus(dm.id, dm.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                        dm.status === 'ACTIVE'
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}
                    >
                      {dm.status === 'ACTIVE' ? 'Set Off-Duty' : 'Set Active'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
