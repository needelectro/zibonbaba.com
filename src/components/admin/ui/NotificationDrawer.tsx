'use client';

import React, { useState } from 'react';
import { X, Bell, CheckCircle2, AlertTriangle, Shield, CreditCard, Package, Store } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: 'ORDER' | 'KYC' | 'PAYMENT' | 'INVENTORY' | 'SECURITY' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule?: (module: string) => void;
  isLight: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New Seller KYC Application',
    body: 'Merchant "Luxury Jewels BD" submitted Trade License & NID verification docs.',
    category: 'KYC',
    timestamp: '10 mins ago',
    isRead: false,
    link: 'sellers'
  },
  {
    id: 'notif-2',
    title: 'High-Value Order Received',
    body: 'Customer Rashedul Karim placed order #FA1CE1A7 (৳5,800) via SSLCommerz.',
    category: 'ORDER',
    timestamp: '25 mins ago',
    isRead: false,
    link: 'orders'
  },
  {
    id: 'notif-3',
    title: 'Payout Request Pending',
    body: 'Vendor "Fashion Elite" requested withdrawal of ৳18,500 via bKash.',
    category: 'PAYMENT',
    timestamp: '1 hour ago',
    isRead: false,
    link: 'wallet'
  },
  {
    id: 'notif-4',
    title: 'Low Stock Alert Threshold',
    body: 'Product "Smart Fitness Tracker v2" reached low stock warning level (4 units remaining).',
    category: 'INVENTORY',
    timestamp: '2 hours ago',
    isRead: true,
    link: 'inventory'
  },
  {
    id: 'notif-5',
    title: 'Security Firewall Audit Log',
    body: 'Immutable session checkpoint signed by system auditor. Zero privilege escalation.',
    category: 'SECURITY',
    timestamp: '5 hours ago',
    isRead: true,
    link: 'security'
  }
];

export default function NotificationDrawer({
  isOpen,
  onClose,
  onNavigateModule,
  isLight
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.isRead : true));
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ORDER':
        return <Package className="w-3.5 h-3.5 text-blue-500" />;
      case 'KYC':
        return <Store className="w-3.5 h-3.5 text-amber-500" />;
      case 'PAYMENT':
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      case 'INVENTORY':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />;
      case 'SECURITY':
        return <Shield className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          className={`w-screen max-w-md shadow-2xl flex flex-col transform transition-transform duration-300 animate-slide-up border-l ${
            isLight
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-slate-900 border-slate-800 text-slate-100'
          }`}
        >
          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
              isLight ? 'border-slate-200 bg-slate-50/70' : 'border-slate-800 bg-slate-950/50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Notifications Hub</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {unreadCount} unread system events
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10.5px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div
            className={`flex items-center gap-2 px-5 py-2.5 border-b text-xs font-bold ${
              isLight ? 'border-slate-200 bg-slate-50/30' : 'border-slate-800 bg-slate-950/20'
            }`}
          >
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-[#FFC107] text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filter === 'UNREAD'
                  ? 'bg-[#FFC107] text-slate-950 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-xs font-bold">You're all caught up!</p>
                <p className="text-[11px] text-slate-500 mt-0.5">No notifications require administrative action.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    markAsRead(item.id);
                    if (item.link && onNavigateModule) {
                      onNavigateModule(item.link);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    !item.isRead
                      ? isLight
                        ? 'bg-amber-50/30 border-amber-200 hover:bg-amber-50/60'
                        : 'bg-slate-950/60 border-amber-500/20 hover:border-amber-500/40'
                      : isLight
                      ? 'bg-white border-slate-200 hover:bg-slate-50'
                      : 'bg-slate-950/20 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-3.5 right-3.5 animate-pulse" />
                  )}

                  <div className="flex items-start gap-2.5 pr-4">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${
                        isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400">• {item.timestamp}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
