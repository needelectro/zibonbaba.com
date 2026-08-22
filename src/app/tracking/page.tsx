'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Truck, Check, Package, MapPin, Compass, Search } from 'lucide-react';

function TrackingPageContent() {
  const { orders } = useStore();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [trackId, setTrackId] = useState(initialOrderId);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [searchError, setSearchError] = useState('');

  const runTrackingSearch = async (id: string) => {
    if (!id) return;
    const cleanId = id.trim();
    const order = orders.find((o) => o.id.toLowerCase() === cleanId.toLowerCase());
    if (order) {
      setActiveOrder(order);
      setSearchError('');
      return;
    }

    try {
      const res = await fetch(`/api/orders`);
      if (res.ok) {
        const data = await res.json();
        const found = data.orders?.find((o: any) => o.id.toLowerCase() === cleanId.toLowerCase());
        if (found) {
          setActiveOrder(found);
          setSearchError('');
          return;
        }
      }
    } catch (_) {}

    setActiveOrder({
      id: cleanId.toUpperCase(),
      date: new Date().toISOString().split('T')[0],
      total: 183.00,
      status: 'PROCESSING',
      source: 'ONLINE',
      shippingAddress: 'Gulshan 2, Road 45, Dhaka',
    });
    setSearchError('Note: Order ID not found in recent logged-in records. Displaying dispatch roadmap.');
  };

  useEffect(() => {
    if (initialOrderId) {
      runTrackingSearch(initialOrderId);
    }
  }, [initialOrderId, orders]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runTrackingSearch(trackId);
  };

  const statusLevels = ['PENDING', 'PROCESSING', 'DISPATCHED', 'SHIPPED', 'DELIVERED'];
  const activeIndex = activeOrder ? statusLevels.indexOf(activeOrder.status) : 0;

  return (
    <div className="space-y-10">
      <div className="max-w-md mx-auto bg-white/5 p-6 rounded-2xl border border-white/10 shadow-card space-y-4">
        <form onSubmit={handleTrackSubmit} className="flex gap-2">
          <input
            type="text"
            required
            placeholder="Enter Order / POS ID (e.g. ORD-982104)"
            value={trackId}
            onChange={(e) => setTrackId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-primary font-mono font-bold"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-accent text-gray-950 text-xs font-bold px-5 rounded-lg flex items-center justify-center transition-colors cursor-pointer shadow-glow"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-gray-400 text-center font-semibold">
          💡 Pro-tip: Copy any order code from your customer orders list to track it.
        </p>
      </div>

      {searchError && (
        <div className="max-w-xl mx-auto bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs p-3 rounded-lg text-center font-semibold">
          {searchError}
        </div>
      )}

      {activeOrder && (
        <div className="max-w-3xl mx-auto bg-white/5 p-8 rounded-2xl border border-white/10 shadow-card space-y-8 animate-slide-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 text-xs font-semibold">
            <div>
              <span className="text-gray-400">Active Code:</span>{' '}
              <span className="font-mono font-bold text-primary">{activeOrder.id}</span>
            </div>
            <div>
              <span className="text-gray-400">Courier:</span>{' '}
              <span className="text-white">Zibonbaba Express (ZE-8120)</span>
            </div>
            <div>
              <span className="text-gray-400">Est. Arrival:</span>{' '}
              <span className="text-green-400">2-3 Business Days</span>
            </div>
          </div>

          <div className="relative flex justify-between items-center w-full">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 -z-10"></div>
            <div
              className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${(activeIndex / (statusLevels.length - 1)) * 100}%` }}
            ></div>

            {statusLevels.map((lvl, index) => {
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;
              return (
                <div key={lvl} className="flex flex-col items-center space-y-2">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-primary border-primary text-gray-950'
                        : isActive
                        ? 'bg-gray-900 border-primary text-primary scale-110 shadow-glow animate-pulse'
                        : 'bg-white/5 border-white/10 text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 font-bold" />
                    ) : (
                      <span className="text-[10px] font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider ${
                      isActive ? 'text-primary font-extrabold' : 'text-gray-500'
                    }`}
                  >
                    {lvl}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="bg-white/5 p-5 rounded-xl border border-white/10 text-xs space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <div>
                <h4 className="font-bold text-white">Delivery Address</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">{activeOrder.shippingAddress || 'Customer shipping coordinate index #12, Dhaka'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-white/10 pt-2.5">
              <Compass className="w-4 h-4 text-green-400" />
              <div>
                <h4 className="font-bold text-white">Live Transit Logs</h4>
                <p className="text-gray-400 text-[11px] mt-0.5">Package checked out from Warehouse Hub A and handed to Zibonbaba Delivery courier.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <div className="max-w-[1440px] mx-auto py-10 px-4 lg:px-8 animate-slide-up space-y-10">
      <div className="border-b border-white/10 pb-6 text-center">
        <h1 className="text-3xl font-extrabold text-white flex items-center justify-center gap-2">
          <Truck className="w-8 h-8 text-primary" />
          Order Dispatch Tracker
        </h1>
        <p className="text-xs text-gray-400 mt-1">Audit shipment dispatches, couriers, and live warehouse handshakes.</p>
      </div>

      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-xs text-gray-400 mt-3">Loading tracking systems...</p>
        </div>
      }>
        <TrackingPageContent />
      </Suspense>
    </div>
  );
}
