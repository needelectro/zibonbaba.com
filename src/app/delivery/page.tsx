'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  DollarSign,
  Phone,
  LogOut,
  Map,
  Sparkles,
  Inbox
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldAlert } from 'lucide-react';

export default function DeliveryManDashboard() {
  const router = useRouter();
  const { username, userEmail, token, logout, isLoggedIn, role } = useStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulated delivery tasks
  const [tasks, setTasks] = useState([
    {
      id: 'ORD-982104',
      customer: 'Kabir Hasan',
      phone: '+8801712345678',
      address: 'House 12, Road 5, Dhanmondi, Dhaka',
      codAmount: 149.00,
      paymentMethod: 'Cash on Delivery',
      status: 'ASSIGNED',
      notes: 'Please call before arrival.'
    },
    {
      id: 'ORD-982054',
      customer: 'Mita Roy',
      phone: '+8801812345678',
      address: 'House 22, Sector 11, Uttara, Dhaka',
      codAmount: 0.00,
      paymentMethod: 'Prepaid (Wallet)',
      status: 'SHIPPED',
      notes: 'Leave package with security.'
    }
  ]);

  const [deliveredCount, setDeliveredCount] = useState(12);
  const [earnings, setEarnings] = useState(1560.00);
  const [cashInHand, setCashInHand] = useState(450.00);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Login Required</h1>
          <p className="text-xs text-gray-400 mb-6">Please log in to your account to view the Delivery Portal.</p>
          <Link href="/login" className="bg-[#FFC107] text-[#1F2937] font-black text-xs px-6 py-3 rounded-2xl block w-full text-center">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  const allowedDeliveryRoles = ['deliveryman', 'delivery_manager', 'superadmin'];
  if (!allowedDeliveryRoles.includes(role)) {
    return (
      <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Access Denied</h1>
          <p className="text-xs text-gray-400 mb-6">Strict Dashboard Isolation is active. You do not have permission to view the Delivery Portal.</p>
          <button onClick={() => router.push('/')} className="bg-white/5 border border-white/5 text-slate-350 hover:text-white font-black text-xs px-6 py-3 rounded-2xl block w-full cursor-pointer">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        // If delivered, update earnings and cash in hand
        if (newStatus === 'DELIVERED') {
          setDeliveredCount(c => c + 1);
          setEarnings(e => e + 120); // 120 BDT delivery fee
          if (t.codAmount > 0) {
            setCashInHand(ch => ch + t.codAmount);
          }
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
    
    // Simulate real-time websocket/SSE notifications
    alert(`Order ${taskId} status updated to ${newStatus}. Notifications sent to Customer and Seller.`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Header Banner */}
      <header className="bg-[#1F2937] text-white py-10 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFC107] text-[#1F2937] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                Courier & Logistics Portal
              </span>
            </div>
            <h1 className="text-3xl font-black mt-2">Courier Dashboard: {username || 'Delivery Agent'}</h1>
            <p className="text-xs text-gray-400 mt-1">Accept shipments, track delivery coordinates, and manage cash collection logs.</p>
          </div>
          <button
            onClick={() => { logout(); window.location.href = '/login'; }}
            className="flex items-center gap-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Map */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Completed Deliveries</p>
              <p className="text-2xl font-black text-[#1F2937] mt-1">{deliveredCount}</p>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Courier Earnings</p>
              <p className="text-2xl font-black text-green-600 mt-1">${earnings}</p>
            </div>
            <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm col-span-2">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-semibold">Cash in Hand (COD)</p>
              <p className="text-2xl font-black text-[#1F2937] mt-1">${cashInHand}</p>
              <span className="text-[8px] text-gray-400 block mt-1">Please deposit COD amount to Delivery Manager weekly.</span>
            </div>
          </div>

          {/* Interactive Routing Coordinates */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-5 space-y-3">
            <h3 className="font-black text-[#1F2937] text-sm flex items-center gap-1.5">
              <Map className="w-4.5 h-4.5 text-[#FF8F00]" />
              Live Routing Map Coordinates
            </h3>
            <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center border border-gray-200 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=60')" }} />
              <div className="relative z-10 p-4">
                <Navigation className="w-8 h-8 text-[#FF8F00] mx-auto mb-2 animate-bounce" />
                <span className="text-[10px] font-bold text-gray-800">Map Rendering Sandbox</span>
                <p className="text-[9px] text-gray-500 mt-1 max-w-[200px] mx-auto">Dhaka Metropolitan Grid routing enabled. Dispatch coords synced.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Assigned Shipments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-black text-[#1F2937] text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#FF8F00]" />
              Active Shipments Assigned ({tasks.filter(t => t.status !== 'DELIVERED').length})
            </h3>

            <div className="space-y-4">
              {tasks.filter(t => t.status !== 'DELIVERED').map(task => (
                <div key={task.id} className="p-5 border border-gray-100 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex justify-between items-start border-b border-gray-200/60 pb-3">
                    <div>
                      <span className="font-mono text-xs font-black text-gray-900">{task.id}</span>
                      <span className="text-[9px] text-gray-400 block mt-0.5">Method: {task.paymentMethod}</span>
                    </div>
                    <span className={`text-[8.5px] font-black px-2.5 py-1 border rounded-full uppercase ${
                      task.status === 'ASSIGNED' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      task.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-orange-100 text-orange-700 border-orange-200'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] font-semibold text-gray-600">
                    <div className="space-y-2">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Address: <span className="font-bold text-gray-800">{task.address}</span></span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>Phone: <span className="font-bold text-gray-800">{task.phone}</span></span>
                      </p>
                    </div>

                    <div className="space-y-2 md:text-right">
                      <p>
                        <span>Collect COD: <span className="text-sm font-black text-[#1F2937]">৳{task.codAmount}</span></span>
                      </p>
                      <p className="text-[9px] text-gray-400 italic">Notes: "{task.notes}"</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-gray-200/60 pt-3">
                    {task.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'SHIPPED')}
                        className="bg-[#1F2937] hover:bg-black text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Accept & Start Shipping
                      </button>
                    )}
                    {task.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'PICKED_UP')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Out For Delivery
                      </button>
                    )}
                    {(task.status === 'PICKED_UP' || task.status === 'SHIPPED') && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'DELIVERED')}
                          className="bg-[#FFC107] hover:bg-[#FFB300] text-[#1F2937] text-[10px] font-black px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Confirm Delivered
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(task.id, 'FAILED')}
                          className="border border-red-500/20 text-red-500 hover:bg-red-500/5 text-[10px] font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Delivery Failed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {tasks.filter(t => t.status !== 'DELIVERED').length === 0 && (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <Inbox className="w-10 h-10 mx-auto text-gray-300" />
                  <p className="text-xs font-bold">No pending deliveries</p>
                  <p className="text-[10px] text-gray-400">All shipments have been successfully dispatched and delivered.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
