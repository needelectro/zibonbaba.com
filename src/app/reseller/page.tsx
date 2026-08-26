'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
  TrendingUp,
  Award,
  DollarSign,
  Users,
  Copy,
  Check,
  Share2,
  FileText,
  Clock,
  ArrowUpRight,
  Target,
  LogOut,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldAlert } from 'lucide-react';

export default function ResellerDashboard() {
  const router = useRouter();
  const { username, userEmail, token, logout, isLoggedIn, role } = useStore();
  const [activeTab, setActiveTab] = useState<'commission' | 'target'>('commission');
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const referralCode = 'ZIBON-RES001';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // State variables for dynamic data
  const [commissionBalance, setCommissionBalance] = useState(2450.00);
  const [referredCount, setReferredCount] = useState(14);
  const [earningsHistory, setEarningsHistory] = useState([
    { date: '2026-07-14', orderId: 'ORD-982101', saleAmount: 12000, rate: 5, earnings: 600 },
    { date: '2026-07-12', orderId: 'ORD-982054', saleAmount: 8500, rate: 5, earnings: 425 },
    { date: '2026-07-10', orderId: 'ORD-982010', saleAmount: 18000, rate: 5, earnings: 900 },
    { date: '2026-07-08', orderId: 'ORD-981992', saleAmount: 10500, rate: 5, earnings: 525 }
  ]);

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Login Required</h1>
          <p className="text-xs text-gray-400 mb-6">Please log in to your account to view the Reseller Dashboard.</p>
          <Link href="/login" className="bg-[#FFC107] text-[#1F2937] font-black text-xs px-6 py-3 rounded-2xl block w-full text-center">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  if (role !== 'reseller' && role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-[#1F2937] flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-sm w-full text-center text-white">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black mb-2">Access Denied</h1>
          <p className="text-xs text-gray-400 mb-6">Strict Dashboard Isolation is active. You do not have permission to view the Reseller Portal.</p>
          <button onClick={() => router.push('/')} className="bg-white/5 border border-white/5 text-slate-300 hover:text-white font-black text-xs px-6 py-3 rounded-2xl block w-full cursor-pointer">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Target Reseller settings
  const targetMonthly = 100000;
  const currentSales = 72500;
  const targetPercent = Math.min(100, Math.round((currentSales / targetMonthly) * 100));

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {/* Header Banner */}
      <header className="bg-[#1F2937] text-white py-10 px-4 md:px-8 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#FFC107] text-[#1F2937] text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
                Zibonbaba Reseller Program
              </span>
            </div>
            <h1 className="text-3xl font-black mt-2">Welcome Back, {username || 'Reseller Agent'}</h1>
            <p className="text-xs text-gray-400 mt-1">Manage referral commissions, track sales quotas, and check salary disbursements.</p>
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
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* Tab Selection */}
        <div className="flex border-b border-gray-200 mb-6 gap-2">
          <button
            onClick={() => setActiveTab('commission')}
            className={`pb-3 text-sm font-black transition-all border-b-2 px-4 ${
              activeTab === 'commission' ? 'border-[#FFC107] text-[#1F2937]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Commission-Based Reseller
          </button>
          <button
            onClick={() => setActiveTab('target')}
            className={`pb-3 text-sm font-black transition-all border-b-2 px-4 ${
              activeTab === 'target' ? 'border-[#FFC107] text-[#1F2937]' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            Target-Based Reseller
          </button>
        </div>

        {/* Tab 1: Commission-Based Reseller */}
        {activeTab === 'commission' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#FFC107]/15 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-[#FF8F00]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Commission Balance</p>
                  <p className="text-2xl font-black text-[#1F2937] mt-0.5">৳{commissionBalance.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Referred Clients</p>
                  <p className="text-2xl font-black text-[#1F2937] mt-0.5">{referredCount} Clients</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Average commission rate</p>
                  <p className="text-2xl font-black text-[#1F2937] mt-0.5">5% Flat Rate</p>
                </div>
              </div>
            </div>

            {/* Referral Settings Block */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-black text-[#1F2937] text-base">Referral Link Generator</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Your referral code</label>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-[#FFF8E1] border-2 border-dashed border-[#FFC107] rounded-xl px-4 py-2.5 font-mono font-bold text-lg text-gray-800 tracking-wider">
                        {referralCode}
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-1.5 px-4 rounded-xl text-xs font-bold transition-all ${
                          copied ? 'bg-green-500 text-white' : 'bg-[#1F2937] text-white hover:bg-black'
                        }`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Share Link</label>
                    <div className="flex gap-2">
                      <div className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-500 truncate">
                        https://zibonbaba.com/register?ref={referralCode}
                      </div>
                      <button className="flex items-center gap-1 bg-[#FFC107] text-[#1F2937] hover:bg-[#FFB300] rounded-xl text-xs font-bold px-4 transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFF8E1]/40 border border-[#FFC107]/20 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#FF8F00]">
                    <Sparkles className="w-4 h-4" />
                    Affiliate Payouts
                  </span>
                  <p className="text-[10px] text-gray-500 mt-2 leading-relaxed">
                    Referral rewards are credited directly to your payout wallet instantly upon order completion by the customer.
                  </p>
                </div>
                <button
                  onClick={() => alert('Payout request registered. Processing time: 24 Hours.')}
                  className="w-full bg-[#FFC107] hover:bg-[#FFB300] text-[#1F2937] text-xs font-black py-3 rounded-xl transition-colors cursor-pointer"
                >
                  Request Commission Withdrawal
                </button>
              </div>
            </div>

            {/* Earnings History Logs */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-black text-[#1F2937] text-sm">Earnings History Log</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase">Sale Amount</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase">Commission Rate</th>
                      <th className="px-6 py-3 font-bold text-gray-500 uppercase text-right">Commission Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {earningsHistory.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-500">{log.date}</td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-800">{log.orderId}</td>
                        <td className="px-6 py-4 font-bold text-gray-700">৳{log.saleAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 font-semibold text-gray-500">{log.rate}%</td>
                        <td className="px-6 py-4 font-black text-green-600 text-right">${log.earnings.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Target-Based Reseller */}
        {activeTab === 'target' && (
          <div className="space-y-6">
            {/* KPI Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly Quota Progress</span>
                  <span className="text-xs font-black text-[#FF8F00]">{targetPercent}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FFC107] h-full rounded-full transition-all duration-500" style={{ width: `${targetPercent}%` }} />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>৳{currentSales.toLocaleString()} sold</span>
                  <span>Target: ${targetMonthly.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Monthly Base Salary</p>
                  <p className="text-2xl font-black text-[#1F2937] mt-0.5">৳15,000</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex items-center gap-4">
                <div className="p-3 bg-[#FFC107]/15 rounded-2xl">
                  <Target className="w-6 h-6 text-[#FF8F00]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pending Target Bonus</p>
                  <p className="text-2xl font-black text-[#1F2937] mt-0.5">৳3,500</p>
                </div>
              </div>
            </div>

            {/* Performance Indicators & Rules */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-black text-[#1F2937] text-base">Targets & KPI Objectives</h3>
                <div className="space-y-2">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">Monthly Sales Target</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Maintain ৳100,000 in monthly sales volume.</p>
                    </div>
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 font-extrabold px-2.5 py-1 rounded-full uppercase">
                      In Progress
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-gray-800">Active Customer Acquisition</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Register at least 5 new active shopping accounts.</p>
                    </div>
                    <span className="text-[10px] bg-green-100 text-green-700 font-extrabold px-2.5 py-1 rounded-full uppercase">
                      Completed
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1F2937] text-white p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="flex items-center gap-1.5 text-xs font-bold text-[#FFC107]">
                    <Award className="w-4 h-4" />
                    Target-Based Benefits
                  </span>
                  <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">
                    Target-based agents receive a guaranteed base salary of ৳15,000 every calendar month, plus attractive commission margins when exceeding 100% of their monthly quotas.
                  </p>
                </div>
                <div className="flex gap-4 border-t border-gray-800 pt-4 mt-4">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400">Payroll Cycle</span>
                    <span className="text-xs font-black text-white">1st of Month</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-gray-400">Payment Channel</span>
                    <span className="text-xs font-black text-white">Direct Bank Wire</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
